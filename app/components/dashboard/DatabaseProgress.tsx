import { Check, LoaderCircle, TriangleAlert } from 'lucide-react'
import type { DatabaseProvisioningProgress } from '@/app/lib/provisioning'

export type DatabaseProgressState = DatabaseProvisioningProgress & {
  status: 'running' | 'success' | 'error'
  operation: 'Preparar banco' | 'Atualizar banco'
  recovery?: { action: string; code: string; correlationId?: string }
}

export function DatabaseProgress({ progress }: { progress: DatabaseProgressState }) {
  const Icon = progress.status === 'success' ? Check : progress.status === 'error' ? TriangleAlert : LoaderCircle
  return (
    <div className="database-progress" data-state={progress.status}>
      <div className="database-progress-heading">
        <strong><Icon size={17} className={progress.status === 'running' ? 'animate-spin' : undefined} aria-hidden="true" />{progress.operation}</strong>
        <span>{progress.status === 'success' ? 'Concluído' : progress.status === 'error' ? 'Não concluído' : `Etapa ${progress.step} de 4`}</span>
      </div>
      <progress max={100} value={progress.percent} aria-label={`${progress.operation}: ${progress.message}`} />
      <p role={progress.status === 'error' ? 'alert' : 'status'}>{progress.message}</p>
      {progress.recovery ? (
        <>
          <p><strong>Como resolver:</strong> {progress.recovery.action}</p>
          <small>Código do erro: {progress.recovery.code}{progress.recovery.correlationId ? ` · Atendimento: ${progress.recovery.correlationId}` : ''}</small>
        </>
      ) : null}
      {progress.totalMigrations != null && progress.totalMigrations > 0 ? (
        <small>{progress.completedMigrations ?? 0} de {progress.totalMigrations} alterações aplicadas</small>
      ) : null}
    </div>
  )
}
