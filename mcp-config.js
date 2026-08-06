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

  const baseUrl = normalize(configured)
  if (fromQuery && baseUrl) window.localStorage.setItem('agentropolis.mcp.baseUrl', baseUrl)

  return {
    baseUrl,
    healthUrl: baseUrl ? `${baseUrl}/health` : '',
    manifestUrl: baseUrl ? `${baseUrl}/.well-known/mcp.json` : '',
    mcpUrl: baseUrl ? `${baseUrl}/mcp` : '',
    authority: 'public-read',
    clients: ['HERMES-CITY', 'AGENTROPOLIS-MISSION-CONTROL'],
  }
})()
