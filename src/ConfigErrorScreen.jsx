// Rendered instead of the app when required Firebase environment
// variables are missing. Without this, a missing/invalid Firebase
// config throws during module import (before React even mounts),
// producing a silent blank white screen with only a console error.
export default function ConfigErrorScreen({ missing }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.badge}>BC</div>
        <h1 style={styles.h1}>Firebase isn't configured yet</h1>
        <p style={styles.p}>
          BuildConnect needs Firebase credentials to start. The following
          environment variable{missing.length > 1 ? 's are' : ' is'} missing:
        </p>
        <ul style={styles.list}>
          {missing.map((key) => (
            <li key={key} style={styles.li}>{key}</li>
          ))}
        </ul>
        <p style={styles.p}>
          <strong>Local dev:</strong> copy <code style={styles.code}>.env.example</code> to{' '}
          <code style={styles.code}>.env</code> in the project root, fill in your Firebase
          project's web config values, then restart <code style={styles.code}>npm run dev</code>.
        </p>
        <p style={styles.p}>
          <strong>Vercel:</strong> add each variable above under Project Settings →
          Environment Variables, then redeploy.
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    padding: '24px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
  },
  badge: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  h1: { fontSize: '19px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' },
  p: { fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '10px 0' },
  list: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 16px',
    margin: '10px 0',
    fontSize: '13px',
    color: '#0f172a',
  },
  li: { fontFamily: 'ui-monospace, monospace', padding: '2px 0' },
  code: {
    background: '#f1f5f9',
    padding: '1px 6px',
    borderRadius: '5px',
    fontSize: '13px',
    fontFamily: 'ui-monospace, monospace',
  },
}
