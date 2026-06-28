import { useRef, useState } from 'react';
import { Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';

interface Props {
  ofertaId: number;
  titulo: string;
}

export default function OfertaQR({ ofertaId, titulo }: Props) {
  const [show, setShow] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const url = `${window.location.origin}/ofertas/${ofertaId}`;

  function descargar() {
    const canvas = contenedorRef.current?.querySelector('canvas');
    if (!canvas) return;
    const enlace = document.createElement('a');
    enlace.href = canvas.toDataURL('image/png');
    enlace.download = `oferta-${ofertaId}-qr.png`;
    enlace.click();
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {

    }
  }

  return (
    <>
      <OverlayTrigger placement="top" overlay={<Tooltip>Mostrar codigo QR para compartir la oferta</Tooltip>}>
        <Button variant="outline-secondary" size="sm" onClick={() => setShow(true)}>
          Generar QR
        </Button>
      </OverlayTrigger>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 18 }}>Compartir oferta por QR</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p className="text-secondary" style={{ fontSize: 14 }}>
            Escanea este código para ver <strong>{titulo}</strong>.
          </p>

          <div ref={contenedorRef} className="d-flex justify-content-center my-3">
            <div className="qr-surface">
              <QRCodeCanvas
                value={url}
                size={220}
                level="M"
                marginSize={2}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          <div className="text-secondary text-break" style={{ fontSize: 12 }}>
            {url}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={copiarEnlace}>
            {copiado ? '¡Copiado!' : 'Copiar enlace'}
          </Button>
          <Button variant="primary" onClick={descargar}>
            Descargar QR
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
