import { Component } from 'react'
import type { ReactNode, ErrorInfo, CSSProperties } from 'react'

/**
 * Props for StorachaErrorBoundary
 */
export interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * Static fallback ReactNode to render on error
   */
  fallback?: ReactNode
  /**
   * Render prop for fallback UI with error details and reset capability.
   * Takes priority over `fallback` prop.
   */
  renderFallback?: (error: Error, reset: () => void) => ReactNode
  /**
   * Callback when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /**
   * Additional CSS class names for the default fallback wrapper
   */
  className?: string
  /**
   * Inline styles for the default fallback wrapper
   */
  style?: CSSProperties
}

/**
 * State for StorachaErrorBoundary
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary for Storacha Console Toolkit components.
 */
export class StorachaErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: undefined }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): ReactNode {
    const { children, fallback, renderFallback, className, style } = this.props
    const { hasError, error } = this.state

    if (!hasError) {
      return children
    }

    if (renderFallback && error) {
      return renderFallback(error, this.reset)
    }

    if (fallback) {
      return fallback
    }

    return (
      <div className={className} style={style} role="alert">
        <p>Something went wrong.</p>
        {error?.message ? <p>{error.message}</p> : null}
        <button type="button" onClick={this.reset}>
          Try again
        </button>
      </div>
    )
  }
}
