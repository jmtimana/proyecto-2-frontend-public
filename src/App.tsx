import Navbar from './common/Navbar';
import Router from './Router';
import Footer from './common/Footer';

// App es el "marco" de la aplicación: la barra de arriba (Navbar) que se ve
// siempre, el Router en el medio, y el Footer abajo. Usamos un layout en
// columna con min-height para que el footer quede siempre pegado abajo.
export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Router />
      </div>
      <Footer />
    </div>
  );
}
