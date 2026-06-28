import { Link } from 'react-router-dom';

interface Item {
  label: string;
  href?: string;
}

interface Props {
  items: Item[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i}>
            {item.href && !last ? (
              <Link to={item.href} className="brand-link" style={{ fontSize: 13 }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: last ? 'var(--brand-dark)' : '#888', fontWeight: last ? 500 : 400 }}>
                {item.label}
              </span>
            )}
            {!last && <span style={{ margin: '0 6px', color: '#ccc' }}>/</span>}
          </span>
        );
      })}
    </nav>
  );
}
