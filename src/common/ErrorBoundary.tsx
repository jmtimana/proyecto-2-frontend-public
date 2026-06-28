import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Container, Button } from 'react-bootstrap';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {

    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 text-center" style={{ maxWidth: 520 }}>
          <div style={{ fontSize: 48 }}>😵</div>
          <h4 style={{ fontWeight: 600 }} className="mt-2">Algo salió mal</h4>
          <p className="text-secondary">
            Ocurrió un error inesperado. Puedes recargar la página para continuar.
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </Container>
      );
    }
    return this.props.children;
  }
}
