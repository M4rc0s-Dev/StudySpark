import React from 'react'

interface State {
  error: Error | null
}

// Prevents a single render crash from unmounting the whole React tree and
// leaving only the bare page background (the reported "blue screen" on F5).
// Instead it shows a recoverable message with a reload button.
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crashed:', error, info)
  }

  handleReload = () => window.location.reload()

  render() {
    if (this.state.error) {
      const msg = this.state.error.message || String(this.state.error)
      // Show the real error so a crash can be diagnosed instead of staying
      // mysterious. Collapsed by default to keep the screen calm.
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-paper dark:bg-[#0b1220] px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-ember-50 dark:bg-ember-500/15 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink dark:text-sepia-50">
            Algo salió mal
          </h1>
          <p className="text-ink-muted dark:text-sepia-300 max-w-sm">
            La página se rompió al cargar. Recarga para intentarlo de nuevo.
          </p>
          <details className="max-w-md w-full text-left">
            <summary className="cursor-pointer text-xs text-ink-muted dark:text-sepia-300 hover:text-ink dark:hover:text-sepia-100">
              Detalles del error
            </summary>
            <pre className="mt-2 p-3 rounded-xl bg-ink/5 dark:bg-white/5 text-xs text-rose-600 dark:text-rose-400 overflow-auto whitespace-pre-wrap">
              {msg}
            </pre>
          </details>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ember-500 text-paper text-sm font-bold shadow-soft hover:shadow-lift transition-all"
          >
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary

