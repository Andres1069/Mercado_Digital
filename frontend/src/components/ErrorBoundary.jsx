// frontend/src/components/ErrorBoundary.jsx
// Red de seguridad para cualquier excepción no controlada durante el render de
// React. Envuelve <App/> en main.jsx, por fuera de BrowserRouter/AuthProvider,
// así que su fallback no puede depender de esos contextos: usa navegación nativa.
import { Component } from "react";
import ErrorPage from "./errors/ErrorPage";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Error de render no controlado:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorPage
          tipo="SERVER_ERROR"
          detalleTecnico={this.state.error?.stack || String(this.state.error)}
          inicioHref="/"
          onVolver={() => window.location.assign("/")}
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
