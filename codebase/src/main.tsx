import React, { Component, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    try {
      window.localStorage.removeItem('vlearn-chat-history')
      window.localStorage.removeItem('vlearn-theme')
    } catch {
      // ignore
    }
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-6 text-slate-800">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-center">
            <span className="text-4xl">⚠️</span>
            <h1 className="mt-3 text-lg font-bold text-slate-900">Đã xảy ra sự cố hiển thị</h1>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Hệ thống ghi nhận sự cố bộ nhớ đệm. Vui lòng nhấn nút bên dưới để khôi phục và tải lại ứng dụng.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-5 w-full rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-800"
            >
              Khôi phục & Tải lại trang
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
