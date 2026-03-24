export default function OfflinePage() {
  return (
    <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>You’re offline</h1>
      <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
        BBrains can’t reach the network right now. Check your connection and try again.
      </p>
    </main>
  )
}
