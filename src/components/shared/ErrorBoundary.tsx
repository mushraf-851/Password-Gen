import React from 'react'

type State = { hasError: boolean; error?: Error | null }

export default class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    // log to console for now
    // future: send to a logging service
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
          <div className="max-w-2xl text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <pre className="text-sm text-left bg-gray-800 p-4 rounded overflow-auto" style={{whiteSpace: 'pre-wrap'}}>
              {String(this.state.error)}
            </pre>
            <p className="mt-4 text-gray-400">Check the developer console for more details.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
