import { Component } from 'react'
import { Building2, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in app:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink-100/60 px-4">
          <div className="w-full max-w-md card p-8 text-center">
            <span className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
              <Building2 size={22} className="text-white" />
            </span>
            <h1 className="text-lg font-bold text-ink-900">Something went wrong</h1>
            <p className="text-sm text-ink-500 mt-2">
              BuildConnect hit an unexpected error. Reloading usually fixes this.
            </p>
            <button
              onClick={() => window.location.assign('/')}
              className="btn-primary mt-6 w-full inline-flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
