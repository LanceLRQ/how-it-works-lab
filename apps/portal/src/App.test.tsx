import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('首页', () => {
  it('渲染平台名称与定位说明', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'how-it-works-lab' }),
    ).toBeTruthy()
    expect(screen.getByText(/理解机制、动手实践并验证学习结果/)).toBeTruthy()
  })
})
