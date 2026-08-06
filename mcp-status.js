(() => {
  const cfg = window.HERMES_MCP_CONFIG || {}
  const panel = document.createElement('section')
  panel.className = 'mcp-glass'
  panel.setAttribute('aria-live', 'polite')
  panel.innerHTML = `
    <div class="mcp-glass__head">
      <div><span class="mcp-led"></span><strong>AGENTROPOLIS MCP</strong></div>
      <span class="mcp-mode">PUBLIC READ</span>
    </div>
    <p class="mcp-copy">One governed capability membrane for HERMES CITY and Mission Control.</p>
    <div class="mcp-facts">
      <span>Runtime</span><strong id="mcpRuntime">${cfg.baseUrl ? 'CHECKING' : 'NOT CONFIGURED'}</strong>
      <span>Tools</span><strong id="mcpTools">—</strong>
      <span>Authority</span><strong>READ ONLY</strong>
    </div>
    <div class="mcp-actions">
      <button id="mcpCheck" type="button">CHECK GRID</button>
      <button id="mcpConfigure" type="button">CONFIGURE</button>
      <a href="https://wiredchaos.github.io/AGENTROPOLIS-AGENT-MCP/3d/" target="_blank" rel="noreferrer">OPEN MCP CITY</a>
    </div>
  `
  document.body.appendChild(panel)

  const runtime = panel.querySelector('#mcpRuntime')
  const tools = panel.querySelector('#mcpTools')
  const check = panel.querySelector('#mcpCheck')
  const configure = panel.querySelector('#mcpConfigure')

  async function verify() {
    if (!cfg.baseUrl) {
      runtime.textContent = 'NOT CONFIGURED'
      panel.dataset.state = 'warning'
      return
    }
    runtime.textContent = 'CHECKING'
    panel.dataset.state = 'checking'
    try {
      const [healthResponse, manifestResponse] = await Promise.all([
        fetch(cfg.healthUrl, { headers: { accept: 'application/json' } }),
        fetch(cfg.manifestUrl, { headers: { accept: 'application/json' } }),
      ])
      if (!healthResponse.ok || !manifestResponse.ok) {
        throw new Error(`health=${healthResponse.status}, manifest=${manifestResponse.status}`)
      }
      const health = await healthResponse.json()
      const manifest = await manifestResponse.json()
      runtime.textContent = String(health.status || 'ONLINE').toUpperCase()
      tools.textContent = String(manifest?.tools?.length ?? manifest?.capabilities?.tools?.length ?? '—')
      panel.dataset.state = 'online'
    } catch (error) {
      runtime.textContent = 'UNREACHABLE'
      tools.textContent = '—'
      panel.dataset.state = 'offline'
      panel.title = error instanceof Error ? error.message : 'MCP check failed'
    }
  }

  configure.addEventListener('click', () => {
    const current = cfg.baseUrl || ''
    const value = window.prompt('Agentropolis MCP Worker base URL', current)
    if (!value) return
    try {
      const url = new URL(value.trim().replace(/\/+$/, ''))
      if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error()
      window.localStorage.setItem('agentropolis.mcp.baseUrl', url.toString().replace(/\/$/, ''))
      window.location.reload()
    } catch {
      window.alert('Use a valid HTTPS Worker base URL.')
    }
  })
  check.addEventListener('click', verify)
  verify()
})()
