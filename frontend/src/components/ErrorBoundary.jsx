import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("React screen failed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="center-screen">
          <div className="auth-card">
            <p className="eyebrow">Something went wrong</p>
            <h1>We could not load this screen.</h1>
            <p className="muted">Refresh the page and try again. If it repeats, check the browser console.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
