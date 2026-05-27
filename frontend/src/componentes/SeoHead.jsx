import { useEffect } from 'react'

const SITE_URL = 'https://oticaolhodehorus.com.br'
const DEFAULT_TITLE = 'Ótica Olho de Hórus | Ótica em Guanhães - MG'
const DEFAULT_DESCRIPTION = 'Ótica Olho de Hórus em Guanhães - MG com óculos de grau, óculos de sol, armações e atendimento local com apoio online.'
const DEFAULT_IMAGE = `${SITE_URL}/logo-completa.png`

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value == null || value === false) {
      element.removeAttribute(key)
      return
    }

    element.setAttribute(key, value)
  })
}

function ensureLink(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function normalizeCanonical(canonical) {
  if (!canonical) return SITE_URL
  if (canonical.startsWith('http://') || canonical.startsWith('https://')) return canonical
  return `${SITE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
}

export function SeoHead({
  title,
  description,
  canonical = '/',
  image = DEFAULT_IMAGE,
  noindex = false,
  ogType = 'website',
  schema = null,
}) {
  useEffect(() => {
    const resolvedTitle = title || DEFAULT_TITLE
    const resolvedDescription = description || DEFAULT_DESCRIPTION
    const resolvedCanonical = normalizeCanonical(canonical)
    const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow'

    document.title = resolvedTitle

    ensureMeta('meta[name="description"]', {
      name: 'description',
      content: resolvedDescription,
    })
    ensureMeta('meta[name="robots"]', {
      name: 'robots',
      content: robotsContent,
    })
    ensureMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: resolvedTitle,
    })
    ensureMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: resolvedDescription,
    })
    ensureMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: ogType,
    })
    ensureMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: resolvedCanonical,
    })
    ensureMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: image,
    })
    ensureMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: 'pt_BR',
    })
    ensureMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    })
    ensureMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: resolvedTitle,
    })
    ensureMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: resolvedDescription,
    })
    ensureMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: image,
    })
    ensureLink('link[rel="canonical"]', {
      rel: 'canonical',
      href: resolvedCanonical,
    })

    document.head.querySelectorAll('script[data-seo-jsonld="true"]').forEach((node) => node.remove())

    const schemas = Array.isArray(schema) ? schema.filter(Boolean) : (schema ? [schema] : [])
    schemas.forEach((entry) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.seoJsonld = 'true'
      script.text = JSON.stringify(entry)
      document.head.appendChild(script)
    })
  }, [canonical, description, image, noindex, ogType, schema, title])

  return null
}

export const seoDefaults = {
  siteUrl: SITE_URL,
  defaultImage: DEFAULT_IMAGE,
}
