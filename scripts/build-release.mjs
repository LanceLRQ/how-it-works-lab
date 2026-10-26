#!/usr/bin/env node
// 平台统一构建与发布编排（方案见 docs/_internal/discussion/2026-10-26-build-and-release.md）：
// 同步 submodule → 用课程自己的工具链构建 → 组装 release/ → 平台级校验 → 写 manifest 快照。
// 不向课程仓库注入任何内容；失败即清理产物退出，不发布半套版本。
//
// 用法：
//   pnpm build:release                 # 构建全部 status=ready 的课程 + portal
//   pnpm build:release --course transformer
//   pnpm build:release --skip-install  # 跳过课程依赖安装（本地迭代用）
//   pnpm build:release --list          # 只列注册表状态

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const RELEASE = path.join(ROOT, 'release')
const REGISTRY = path.join(ROOT, 'catalog', 'courses.json')

function parseArgs(argv) {
  const opts = { course: [], skipInstall: false, list: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--course') opts.course.push(argv[++i])
    else if (argv[i] === '--skip-install') opts.skipInstall = true
    else if (argv[i] === '--list') opts.list = true
    else {
      console.error(`未知参数：${argv[i]}`)
      process.exit(2)
    }
  }
  return opts
}

function run(cmd, args, cwd, label) {
  const r = spawnSync(cmd, args, { cwd, stdio: ['ignore', 'inherit', 'inherit'] })
  if (r.status !== 0) throw new Error(`${label} 失败（exit ${r.status}）：${cmd} ${args.join(' ')}`)
}

function out(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`命令失败：${cmd} ${args.join(' ')}\n${r.stderr}`)
  return r.stdout.trim()
}

function selectCourses(registry, requested) {
  const byId = new Map(registry.courses.map((c) => [c.id, c]))
  if (requested.length === 0) {
    const skipped = registry.courses.filter((c) => c.status !== 'ready')
    for (const c of skipped) console.log(`跳过 ${c.id}（${c.status}）：${c.reason ?? ''}`)
    return registry.courses.filter((c) => c.status === 'ready')
  }
  const picked = []
  for (const id of requested) {
    const c = byId.get(id)
    if (!c) throw new Error(`注册表中没有课程：${id}（可用：${[...byId.keys()].join(', ')}）`)
    if (c.status !== 'ready') throw new Error(`${id} 状态为 ${c.status}，先完成课程侧适配：${c.reason ?? ''}`)
    picked.push(c)
  }
  return picked
}

function syncCourse(course) {
  run('git', ['submodule', 'update', '--init', '--recursive', course.dir], ROOT, `${course.id} submodule 同步`)
  const commit = out('git', ['rev-parse', 'HEAD'], path.join(ROOT, course.dir))
  const remoteBranches = out('git', ['branch', '-r', '--contains', commit], path.join(ROOT, course.dir))
  if (!remoteBranches) {
    throw new Error(`${course.id} 的提交 ${commit} 不在任何远端分支上，违反「submodule 提交须能从远端获取」`)
  }
  return commit
}

function installCourse(course) {
  // 课程目录自带 pnpm-workspace.yaml（含 allowBuilds 等项目级设置），pnpm 就近使用它，
  // 与主仓库 workspace 天然隔离；不要加 --ignore-workspace，那会连课程自己的设置一起忽略。
  run('pnpm', ['install'], path.join(ROOT, course.dir), `${course.id} 依赖安装`)
}

function buildCourse(course) {
  run('pnpm', ['run', course.buildCommand], path.join(ROOT, course.dir), `${course.id} 构建`)
}

function assembleCourse(course, courseRelease) {
  const dist = path.join(ROOT, course.dir, course.dist)
  if (!fs.existsSync(path.join(dist, 'index.html'))) {
    throw new Error(`${course.id} 产物缺少 index.html（期望目录：${course.dist}）`)
  }
  fs.cpSync(dist, courseRelease, { recursive: true })
  const copied = []
  for (const f of course.licenseFiles) {
    const src = path.join(ROOT, course.dir, f)
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(courseRelease, f))
      copied.push(f)
    }
  }
  if (course.licenseFiles.length > 0 && copied.length === 0) {
    console.warn(`警告：${course.id} 声明了许可文件但一个都没找到（${course.licenseFiles.join(', ')}）`)
  }
}

function validateCourse(course, courseRelease) {
  const violations = []
  let mountSeen = false
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (entry.name.endsWith('.html')) {
        const html = fs.readFileSync(p, 'utf8')
        if (html.includes(course.mount)) mountSeen = true
        for (const m of html.matchAll(/(?:src|href)=["']\/(?!\/)[^"']*/g)) {
          if (!m[0].includes(`="${course.mount}`)) {
            violations.push(`${path.relative(RELEASE, p)}：${m[0]}`)
          }
        }
      }
    }
  }
  walk(courseRelease)
  if (!mountSeen) throw new Error(`${course.id} 产物未使用挂载前缀 ${course.mount}（base 未生效？）`)
  if (violations.length > 0) {
    throw new Error(`${course.id} 产物存在越界绝对路径（应为 ${course.mount} 前缀）：\n  ${violations.join('\n  ')}`)
  }
}

function hashTree(dir, excludeTop = []) {
  const h = createHash('sha256')
  let files = 0
  let bytes = 0
  const walk = (d, depth) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (depth === 0 && excludeTop.includes(entry.name)) continue
      const p = path.join(d, entry.name)
      if (entry.isDirectory()) walk(p, depth + 1)
      else {
        const buf = fs.readFileSync(p)
        h.update(entry.name)
        h.update(buf)
        files++
        bytes += buf.length
      }
    }
  }
  walk(dir, 0)
  return { files, bytes, hash: h.digest('hex').slice(0, 16) }
}

function buildPortal() {
  run('pnpm', ['--filter', 'portal', 'build'], ROOT, 'portal 构建')
  fs.cpSync(path.join(ROOT, 'apps', 'portal', 'dist'), RELEASE, { recursive: true })
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'))
  if (opts.list) {
    for (const c of registry.courses) console.log(`${c.id.padEnd(22)} ${c.status.padEnd(20)} ${c.mount}`)
    return
  }
  const courses = selectCourses(registry, opts.course)
  const superproject = out('git', ['rev-parse', 'HEAD'], ROOT)

  if (fs.existsSync(RELEASE)) fs.rmSync(RELEASE, { recursive: true })
  fs.mkdirSync(RELEASE)

  try {
    for (const c of courses) {
      console.log(`\n=== ${c.id} ===`)
      const commit = syncCourse(c)
      console.log(`提交 ${commit}`)
      if (!opts.skipInstall) installCourse(c)
      buildCourse(c)
      const courseRelease = path.join(RELEASE, 'study', c.id)
      fs.mkdirSync(courseRelease, { recursive: true })
      assembleCourse(c, courseRelease)
      validateCourse(c, courseRelease)
      c._commit = commit
      c._tree = hashTree(courseRelease)
      console.log(`产物 ${c._tree.files} 个文件 / ${(c._tree.bytes / 1024 / 1024).toFixed(1)} MB / sha ${c._tree.hash}`)
    }

    console.log('\n=== portal ===')
    buildPortal()
    const portalTree = hashTree(RELEASE, ['study'])

    const manifest = {
      generatedAt: new Date().toISOString(),
      superproject,
      courses: courses.map((c) => ({
        id: c.id, mount: c.mount, commit: c._commit,
        files: c._tree.files, bytes: c._tree.bytes, hash: c._tree.hash,
      })),
      portal: { rootFiles: portalTree.files, rootBytes: portalTree.bytes, rootHash: portalTree.hash },
    }
    fs.writeFileSync(path.join(RELEASE, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

    console.log('\n=== 完成 ===')
    for (const c of courses) {
      console.log(`${c.mount.padEnd(28)} ${c._commit.slice(0, 8)}  ${String(c._tree.files).padStart(4)} 文件`)
    }
    console.log(`manifest 已写入 release/manifest.json`)
  } catch (err) {
    if (fs.existsSync(RELEASE)) fs.rmSync(RELEASE, { recursive: true })
    throw err
  }
}

try {
  main()
} catch (err) {
  console.error(`\n构建发布失败，已清理 release/：\n${err.message}`)
  process.exit(1)
}
