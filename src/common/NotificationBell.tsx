// =========================================================
// Campana de notificaciones para la barra superior.
// - Muestra un contador rojo con las no leídas.
// - Al abrir, trae la lista; cada notificación se marca leída al hacer clic.
// - Botón "Marcar todas como leídas".
// - El contador se refresca solo cada 45 segundos.
// Endpoints: GET /notifications, GET /notifications/unread-count,
//            PATCH /notifications/{id}/read, PATCH /notifications/read-all
// =========================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { NotificationApi } from '../api/NotificationApi';
import type { NotificationResponse } from '../api/types/Notification';

// Convierte la fecha ISO en algo corto: "ahora", "hace 5 min", "hace 2 h"...
function tiempoRelativo(iso: string): string {
  try {
    const fecha = new Date(iso);
    const diffMs = Date.now() - fecha.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return 'ahora';
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `hace ${d} d`;
    return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [cargado, setCargado] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Refresca solo el contador (barato; se llama cada 45s).
  const refrescarContador = useCallback(() => {
    NotificationApi.unreadCount().then(setCount).catch(() => {});
  }, []);

  useEffect(() => {
    refrescarContador();
    const id = window.setInterval(refrescarContador, 45000);
    return () => window.clearInterval(id);
  }, [refrescarContador]);

  // Cerrar el panel al hacer clic fuera de la campana.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function cargarLista() {
    setLoading(true);
    NotificationApi.list()
      .then((data) => {
        setItems(data);
        setCargado(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) cargarLista(); // al abrir, traemos lo último
  }

  async function clickNotificacion(n: NotificationResponse) {
    if (n.read) return;
    try {
      await NotificationApi.markRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setCount((c) => Math.max(0, c - 1));
    } catch {
      // si falla, no rompemos la UI
    }
  }

  async function marcarTodas() {
    try {
      await NotificationApi.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setCount(0);
    } catch {
      // ignoramos el error
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Campana + contador */}
      <button
        onClick={toggle}
        aria-label="Notificaciones"
        style={{
          background: 'none',
          border: 'none',
          position: 'relative',
          cursor: 'pointer',
          padding: '4px 6px',
          fontSize: 20,
          lineHeight: 1,
        }}
      >
        🔔
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              background: '#dc3545',
              color: '#fff',
              borderRadius: 10,
              fontSize: 10,
              fontWeight: 700,
              minWidth: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '115%',
            width: 340,
            maxHeight: 440,
            overflowY: 'auto',
            background: '#fff',
            border: '0.5px solid #e6e6ef',
            borderRadius: 12,
            boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
            zIndex: 1080,
          }}
        >
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <strong style={{ fontSize: 14 }}>Notificaciones</strong>
            {count > 0 && (
              <button
                onClick={marcarTodas}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand)',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {loading && (
            <div className="text-center py-4">
              <Spinner size="sm" style={{ color: 'var(--brand)' }} />
            </div>
          )}

          {!loading && cargado && items.length === 0 && (
            <div className="text-center text-secondary py-4" style={{ fontSize: 13 }}>
              <div style={{ fontSize: 28 }}>🔕</div>
              No tienes notificaciones.
            </div>
          )}

          {!loading &&
            items.map((n) => (
              <div
                key={n.id}
                onClick={() => clickNotificacion(n)}
                style={{
                  padding: '10px 14px',
                  borderBottom: '0.5px solid #f0f0f4',
                  cursor: n.read ? 'default' : 'pointer',
                  background: n.read ? '#fff' : '#f6f5ff',
                  display: 'flex',
                  gap: 8,
                }}
              >
                {!n.read && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--brand)',
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#2a2a33', fontWeight: n.read ? 400 : 500 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: '#9a9aa6', marginTop: 2 }}>
                    {tiempoRelativo(n.createdAt)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
