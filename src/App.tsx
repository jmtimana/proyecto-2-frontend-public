import Navbar from './common/Navbar';
import Router from './Router';
import Footer from './common/Footer';
import ErrorBoundary from './common/ErrorBoundary';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}
