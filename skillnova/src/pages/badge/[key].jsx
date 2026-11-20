import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function PublicBadge() {
  const router = useRouter()
  const { key } = router.query
  const [badge, setBadge] = useState(null)

  useEffect(() => {
    if (!key) return
    fetch(`/api/badges/${key}`)
      .then(res => res.json())
      .then(setBadge)
      .catch(console.error)
  }, [key])

  if (!badge) return <p>Loading…</p>

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h1>{badge.title}</h1>
      <img
        src={badge.icon || '/images/default-badge.svg'}
        alt={badge.title}
        style={{ width: '220px', maxWidth: '90%', objectFit: 'contain' }}
      />
      <p>{badge.description}</p>
    </div>
  )
}
