import Navbar from './common/Navbar';
import Router from './Router';

// App es el "marco" de la aplicación: la barra de arriba (Navbar) que
// se ve siempre, y debajo el Router que decide qué página mostrar.
export default function App() {
  return (
    <>
      <Navbar />
      <Router />
    </>
  );
}
