import { ApiError } from './api'

export type DatabaseProvisioningProgress = {
  stage: 'checking' | 'backup' | 'migrating' | 'finalizing' | 'complete'
  step: number
  percent: number
  message: string
  completedMigrations?: number
  totalMigrations?: number
}

export class DatabaseProvisioningError extends ApiError {
  constructor(
    public code: string,
    message: string,
    public action: string,
    status: number = 500,
    public correlationId?: string,
  ) {
    super(message, status)
    this.name = 'DatabaseProvisioningError'
  }
}

type FailurePayload = { code?: string; message?: string; error?: string; action?: string; correlationId?: string; statusCode?: number }

function responseError(payload: FailurePayload | null, status: number): DatabaseProvisioningError {
  if (typeof payload?.code === 'string' && typeof payload.message === 'string' && typeof payload.action === 'string'
    && !/^(internal (?:server )?error|unexpected error|erro interno(?: do servidor)?)[.!]?$/i.test(payload.message.trim())) {
    return new DatabaseProvisioningError(payload.code, payload.message, payload.action, status, payload.correlationId)
  }
  const failures: Record<number, [string, string, string]> = {
    400: ['PROVISIONING_REQUEST_INVALID', 'O servidor não aceitou os dados da operação do banco.', 'Revise o cadastro e a conexão PostgreSQL do estabelecimento antes de tentar novamente.'],
    401: ['CEO_SESSION_EXPIRED', 'Sua sessão do Painel CEO expirou ou não está autorizada.', 'Entre novamente no Painel CEO antes de executar a operação.'],
    403: ['CEO_ACCESS_DENIED', 'Seu acesso não permite preparar ou atualizar este banco.', 'Confira se está usando um acesso ativo de CEO da plataforma.'],
    404: ['PROVISIONING_NOT_FOUND', 'O estabelecimento ou o recurso de preparação não foi encontrado.', 'Atualize a lista de estabelecimentos e confira se o backend está atualizado.'],
    409: ['PROVISIONING_CONFLICT', 'O estado atual do banco impede iniciar esta operação.', 'Atualize o painel e confira se já existe uma preparação ou atualização em andamento.'],
    422: ['DATABASE_CONFIGURATION_INVALID', 'A configuração do banco precisa de correção.', 'Revise a conexão PostgreSQL nas configurações do estabelecimento.'],
    429: ['PROVISIONING_RATE_LIMITED', 'O servidor recebeu tentativas demais em pouco tempo.', 'Aguarde alguns instantes e confira o estado do banco antes de tentar novamente.'],
    502: ['BACKEND_UNAVAILABLE', 'O painel não conseguiu obter a confirmação do servidor.', 'Confira a disponibilidade do backend e recarregue o painel para verificar o banco antes de repetir.'],
    503: ['BACKEND_UNAVAILABLE', 'O serviço de preparação do banco está indisponível.', 'Confira o deploy e a configuração de conexão do Painel CEO com o backend.'],
    504: ['PROVISIONING_RESPONSE_TIMEOUT', 'O painel não recebeu a confirmação dentro do tempo permitido.', 'A operação pode continuar no servidor. Recarregue o painel para conferir o banco antes de repetir.'],
  }
  const [code, message, action] = failures[status] ?? ['PROVISIONING_UNCONFIRMED', 'Não foi possível confirmar a conclusão da operação do banco.', 'Recarregue o painel e confira o estado do banco. Consulte os logs do backend antes de repetir a operação.']
  return new DatabaseProvisioningError(code, message, action, status, payload?.correlationId)
}

type ProvisioningEvent =
  | ({ type: 'progress' } & DatabaseProvisioningProgress)
  | { type: 'complete' }
  | { type: 'heartbeat' }
  | ({ type: 'error' } & FailurePayload)

export async function provisionDatabaseWithProgress(
  id: string,
  onProgress: (progress: DatabaseProvisioningProgress) => void,
): Promise<void> {
  const interrupted = () => new DatabaseProvisioningError('PROVISIONING_STREAM_INTERRUPTED', 'A conexão de acompanhamento foi interrompida antes da confirmação.', 'A operação pode continuar no servidor. Recarregue o painel para conferir o banco antes de repetir.', 502)
  const response = await fetch(`/api/ceo/estabelecimentos/${encodeURIComponent(id)}/provisionar`, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { Accept: 'application/x-ndjson' },
  }).catch(() => { throw new DatabaseProvisioningError('BACKEND_UNREACHABLE', 'Não foi possível conectar ao servidor.', 'Confira a conexão de internet e a disponibilidade do backend. Recarregue o painel para conferir o banco antes de tentar novamente.', 503) })
  if (!response.ok || !response.headers.get('content-type')?.includes('application/x-ndjson')) {
    const payload = await response.json().catch(() => null)
    if (!response.ok) throw responseError(payload, response.status)
    // Supports the previous backend while the two apps deploy independently.
    if (payload?.success === true) return
    throw new DatabaseProvisioningError('PROVISIONING_INVALID_RESPONSE', 'O servidor enviou uma resposta que não confirma a operação.', 'Confira se o backend está atualizado e recarregue o painel para verificar o banco.', 502)
  }
  if (!response.body) throw interrupted()
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completed = false
  const consume = (line: string) => {
    if (!line.trim()) return
    const event = JSON.parse(line) as ProvisioningEvent
    if (event.type === 'progress') onProgress(event)
    if (event.type === 'complete') completed = true
    if (event.type === 'error') {
      throw responseError(event, event.statusCode ?? 500)
    }
  }
  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      const lines = buffer.split('\n')
      buffer = lines.pop()!
      for (const line of lines) {
        consume(line)
        if (completed) return
      }
      if (done) { consume(buffer); break }
    }
    if (!completed) throw interrupted()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw interrupted()
  } finally {
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
}
