import { Button, Form } from 'react-bootstrap';

interface Props {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  itemsInPage: number;
  first: boolean;
  last: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSizeChange: (size: number) => void;
  sizeOptions?: number[];
}

export default function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  itemsInPage,
  first,
  last,
  onPrev,
  onNext,
  onSizeChange,
  sizeOptions = [10, 25, 50],
}: Props) {
  const desde = totalElements === 0 ? 0 : page * pageSize + 1;
  const hasta = page * pageSize + itemsInPage;

  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4">
      <div className="d-flex align-items-center gap-2">
        <span className="text-secondary" style={{ fontSize: 13 }}>Por página:</span>
        <Form.Select
          size="sm"
          value={pageSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          style={{ width: 80 }}
        >
          {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </Form.Select>
      </div>

      <span className="text-secondary" style={{ fontSize: 13 }}>
        Mostrando {desde}–{hasta} de {totalElements}
      </span>

      <div className="d-flex align-items-center gap-2">
        <Button variant="outline-secondary" size="sm" disabled={first} onClick={onPrev}>
          ← Anterior
        </Button>
        <span className="text-secondary" style={{ fontSize: 13 }}>
          {page + 1} / {Math.max(1, totalPages)}
        </span>
        <Button variant="outline-secondary" size="sm" disabled={last} onClick={onNext}>
          Siguiente →
        </Button>
      </div>
    </div>
  );
}
