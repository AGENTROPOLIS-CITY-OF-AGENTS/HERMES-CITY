window.HERMES_MCP_CONFIG = (() => {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('mcp') || ''
  const fromStorage = window.localStorage.getItem('agentropolis.mcp.baseUrl') || ''
  const configured = fromQuery || fromStorage

  function normalize(value) {
    try {
      const url = new URL(String(value || '').trim().replace(/\/+$/, ''))
      if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) return ''
      return url.toString().replace(/\/$/, '')
    } catch {
      return ''
    }
  }

  function build(baseUrl) {
    return {
      baseUrl,
      healthUrl: baseUrl ? `${baseUrl}/health` : '',
      manifestUrl: baseUrl ? `${baseUrl}/.well-known/mcp.json` : '',
      mcpUrl: baseUrl ? `${baseUrl}/mcp` : '',
      transport: 'streamable-http',
      authority: 'public-read',
      writeDefault: 'deny',
      humanApprovalRequired: true,
      clients: ['HERMES-CITY', 'AGENTROPOLIS-MISSION-CONTROL'],
    }
  }

  const cfg = build(normalize(configured))
  if (fromQuery && cfg.baseUrl) window.localStorage.setItem('agentropolis.mcp.baseUrl', cfg.baseUrl)

  // Public browser-safe config file — explicit deployment configuration.
  // An operator deploys this file with the verified Worker base URL filled in.
  // Failure-tolerant: a missing or empty file keeps query/localStorage order.
  fetch('mcp-config.json', { headers: { accept: 'application/json' } })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      const fileBase = normalize(data && data.baseUrl)
      if (fileBase && fileBase !== cfg.baseUrl) {
        Object.assign(cfg, build(fileBase))
        window.dispatchEvent(new CustomEvent('agentropolis-mcp-config', { detail: cfg }))
      }
    })
    .catch(() => {})

  return cfg
})()
