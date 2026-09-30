import { useEffect, useState, useSyncExternalStore } from 'react'
import { getOrdens, subscribe } from './data/store'

// Roteamento por hash (#/rota) — compatível com GitHub Pages sem configuração extra
export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || '/')
  useEffect(() => {
    const fn = () => setHash(window.location.hash.slice(1) || '/')
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  return hash
}

let cache = null
const snapshot = () => (cache ??= getOrdens())
const sub = (fn) => subscribe(() => { cache = null; fn() })

// Lista de ordens reativa (atualiza ao vivo, inclusive entre abas)
export function useOrdens() {
  return useSyncExternalStore(sub, snapshot)
}
