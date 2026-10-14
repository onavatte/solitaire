import { useRegisterSW } from 'virtual:pwa-register/react'

/** Bandeau affiché quand une nouvelle version est disponible (évite un rechargement en pleine partie). */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="update-banner" role="status">
      <span>Nouvelle version disponible</span>
      <button type="button" onClick={() => updateServiceWorker(true)}>
        Recharger
      </button>
    </div>
  )
}

