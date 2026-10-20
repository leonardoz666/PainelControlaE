const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

// Execute the actual TypeScript reader with a mocked HTTP transport.
function loadSource(relative, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const result = { exports: {} }
  new Function('module', 'exports', 'require', compiled)(result, result.exports, name => dependencies[name] ?? require(name))
  return result.exports
}
const { provisionDatabaseWithProgress } = loadSource('app/lib/provisioning.ts', { './api': loadSource('app/lib/api.ts') })
const encoder = new TextEncoder()
const originalFetch = global.fetch
const progress = { type: 'progress', stage: 'migrating', step: 3, percent: 25, message: 'Aplicação em execução…', completedMigrations: 0, totalMigrations: 2 }

async function main() {
  try {
    let controller
    let observed
    const firstProgress = new Promise(resolve => { observed = resolve })
    global.fetch = async (_url, options) => {
      assert.equal(options.method, 'POST')
      assert.equal(options.headers.Accept, 'application/x-ndjson')
      return new Response(new ReadableStream({ start(value) { controller = value } }), { headers: { 'content-type': 'application/x-ndjson' } })
    }
    let finished = false
    const task = provisionDatabaseWithProgress('fixture', observed).then(() => { finished = true })
    await new Promise(resolve => setImmediate(resolve))
    const first = encoder.encode(JSON.stringify(progress) + '\n')
    // Byte-sized chunks split JSON, lines and multibyte Portuguese characters.
    for (const byte of first) controller.enqueue(new Uint8Array([byte]))
    assert.deepEqual(await firstProgress, progress)
    assert.equal(finished, false, 'progresso deve chegar antes do término da resposta')
    controller.enqueue(encoder.encode('{"type":"heartbeat"}\n{"type":"complete"}'))
    controller.close()
    await task
    assert(finished)

    for (const [body, expected] of [
      [JSON.stringify(progress) + '\n', /conexão de acompanhamento foi interrompida/],
      [JSON.stringify(progress) + '\n' + JSON.stringify({ type: 'error', code: 'MIGRATION_FAILED', message: 'Falha no banco', action: 'Revise a atualização nos logs.', correlationId: 'fixture-id' }) + '\n', /Falha no banco/],
    ]) {
      global.fetch = async () => new Response(body, { headers: { 'content-type': 'application/x-ndjson' } })
      await assert.rejects(() => provisionDatabaseWithProgress('fixture', () => {}), expected)
    }
    global.fetch = async () => Response.json({ success: true })
    await provisionDatabaseWithProgress('fixture', () => { throw new Error('backend antigo não transmite progresso') })
    global.fetch = async () => Response.json({ error: 'Acesso CEO não autorizado' }, { status: 401 })
    await assert.rejects(() => provisionDatabaseWithProgress('fixture', () => {}), /sessão do Painel CEO/)
    global.fetch = async () => new Response(new ReadableStream({ start(controller) { controller.error(new Error('socket closed')) } }), { headers: { 'content-type': 'application/x-ndjson' } })
    await assert.rejects(() => provisionDatabaseWithProgress('fixture', () => {}), /conexão de acompanhamento foi interrompida/)
    for (const status of [400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504]) {
      global.fetch = async () => Response.json({ message: 'Internal Server Error' }, { status })
      await assert.rejects(() => provisionDatabaseWithProgress('fixture', () => {}), error => {
        assert(!error.message.includes('Internal Server Error'))
        assert(error.code)
        assert(error.action.length > 20)
        return true
      })
    }
    global.fetch = async () => Response.json({ code: 'INTERNAL_ERROR', message: 'Internal Server Error', action: 'Contact support' }, { status: 500 })
    await assert.rejects(() => provisionDatabaseWithProgress('fixture', () => {}), error => !error.message.includes('Internal Server Error') && error.action.includes('Recarregue'))
    const structured = { type: 'error', code: 'DATABASE_AUTHENTICATION_FAILED', statusCode: 422, message: 'O banco recusou as credenciais.', action: 'Confira usuário e senha nas configurações.', correlationId: 'fixture-id' }
    global.fetch = async () => new Response(JSON.stringify(structured) + '\n', { headers: { 'content-type': 'application/x-ndjson' } })
    await assert.rejects(() => provisionDatabaseWithProgress('fixture', () => {}), error => {
      assert.equal(error.code, structured.code)
      assert.equal(error.action, structured.action)
      assert.equal(error.correlationId, structured.correlationId)
      assert.equal(error.status, 422)
      return true
    })
    console.log('✓ progresso antes de concluir, UTF-8 fragmentado, heartbeat, erro, interrupção, 401 e compatibilidade com backend anterior')
  } finally {
    global.fetch = originalFetch
  }
}
void main().catch(error => { console.error(error); process.exitCode = 1 })
