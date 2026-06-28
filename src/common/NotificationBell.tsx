import { useCallback, useEffect, useRef, useState } from 'react';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { NotificationApi } from '../api/NotificationApi';
import type { NotificationResponse } from '../api/types/Notification';

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

  const refrescarContador = useCallback(() => {
    NotificationApi.unreadCount().then(setCount).catch(() => {});
  }, []);

  useEffect(() => {
    refrescarContador();
    const id = window.setInterval(refrescarContador, 45000);
    return () => window.clearInterval(id);
  }, [refrescarContador]);

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
    if (next) cargarLista();
  }

  async function clickNotificacion(n: NotificationResponse) {
    if (n.read) return;
    try {
      await NotificationApi.markRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setCount((c) => Math.max(0, c - 1));
    } catch {

    }
  }

  async function marcarTodas() {
    try {
      await NotificationApi.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setCount(0);
    } catch {

    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <OverlayTrigger placement="bottom" overlay={<Tooltip>Ver notificaciones</Tooltip>}>
        <button
          onClick={toggle}
          aria-label="Notificaciones"
          aria-expanded={open}
          aria-haspopup="dialog"
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
          {'\u{1F514}'}
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
      </OverlayTrigger>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '115%',
            width: 340,
            maxHeight: 440,
            overflowY: 'auto',
            background: 'var(--app-surface-raised)',
            border: '0.5px solid var(--app-border)',
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
                aria-label="Marcar todas las notificaciones como leídas"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand)',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Marcar todas como leidas
              </button>
            )}
          </div>

          {loading && (
            <div className="text-center py-4" aria-live="polite">
              <Spinner size="sm" style={{ color: 'var(--brand)' }} role="status" />
              <span className="visually-hidden">Cargando notificaciones</span>
            </div>
          )}

          {!loading && cargado && items.length === 0 && (
            <div className="text-center text-secondary py-4" style={{ fontSize: 13 }}>
              <div style={{ fontSize: 28 }}>{'\u{1F515}'}</div>
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
                  borderBottom: '0.5px solid var(--app-border-soft)',
                  cursor: n.read ? 'default' : 'pointer',
                  background: n.read ? 'var(--app-surface-raised)' : 'var(--brand-light)',
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
                  <div style={{ fontSize: 13, color: 'var(--app-text)', fontWeight: n.read ? 400 : 500 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--app-muted)', marginTop: 2 }}>
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
