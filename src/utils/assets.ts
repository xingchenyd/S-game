const publicBase = new URL(
  import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`,
  typeof window === 'undefined' ? 'http://localhost/' : window.location.href,
)

/** Resolve files from public/ for both local Vite and GitHub Pages sub-path hosting. */
export function assetUrl(path: string) {
  return new URL(path.replace(/^\/+/, ''), publicBase).href
}

