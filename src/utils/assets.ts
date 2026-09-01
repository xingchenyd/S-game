const publicBase = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`

/** Resolve files from public/ for both local Vite and GitHub Pages sub-path hosting. */
export function assetUrl(path: string) {
  return `${publicBase}${path.replace(/^\/+/, '')}`
}

