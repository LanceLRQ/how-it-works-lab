import './App.css'

function App() {
  return (
    <main className="page">
      <header className="header">
        <h1>how-it-works-lab</h1>
        <p className="tagline">
          通过独立课程、交互实验和跨课程学习路线，理解机制、动手实践并验证学习结果。
        </p>
      </header>

      <section className="section">
        <h2>当前状态</h2>
        <p>
          平台正在搭建中：工程脚手架已就绪，课程目录、学习路线与本地进度功能尚未接入。
          课程在独立仓库开发，由本仓库统一编排并发布静态产物。
        </p>
      </section>

      <section className="section">
        <h2>相关文档</h2>
        <ul className="links">
          <li>
            <a href="https://github.com/LanceLRQ/how-it-works-lab">GitHub 仓库</a>
          </li>
          <li>
            <a href="https://github.com/LanceLRQ/how-it-works-lab/blob/main/docs/course-architecture.md">
              课程模块技术架构指南
            </a>
          </li>
          <li>
            <a href="https://github.com/LanceLRQ/how-it-works-lab/blob/main/docs/ai-content-disclosure.md">
              AI 创作与内容声明
            </a>
          </li>
          <li>
            <a href="https://github.com/LanceLRQ/how-it-works-lab/blob/main/docs/licensing.md">
              许可说明
            </a>
          </li>
        </ul>
      </section>
    </main>
  )
}

export default App
