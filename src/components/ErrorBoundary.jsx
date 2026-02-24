import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // also log to console for dev
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ color: "#b91c1c" }}>An error occurred rendering the app</h2>
        <pre style={{ whiteSpace: "pre-wrap", background: "#111827", color: "#f8fafc", padding: 12, borderRadius: 6 }}>
          {String(this.state.error)}
          {this.state.info?.componentStack ? "\n" + this.state.info.componentStack : ""}
        </pre>
        <p style={{ color: "#6b7280" }}>Check the dev console for details.</p>
      </div>
    );
  }
}
