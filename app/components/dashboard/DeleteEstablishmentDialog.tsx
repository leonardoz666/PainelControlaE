"use client";

import { FormEvent, useEffect, useRef } from "react";
import { LoaderCircle, LockKeyhole, Trash2, TriangleAlert } from "lucide-react";
import type { Establishment } from "./types";

export function deletionConfirmation(slug: string): string {
  return `EXCLUIR ${slug}`;
}

export function DeleteEstablishmentDialog({
  item,
  confirmation,
  deleting,
  error,
  onConfirmationChange,
  onClose,
  onSubmit,
}: {
  item: Establishment;
  confirmation: string;
  deleting: boolean;
  error: string;
  onConfirmationChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requiredConfirmation = deletionConfirmation(item.slug);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog ref={dialogRef} className="delete-dialog" aria-labelledby="delete-dialog-title" onCancel={(event) => { event.preventDefault(); if (!deleting) onClose(); }}>
      <form onSubmit={onSubmit} className="delete-dialog-card">
        <div className="delete-dialog-icon"><Trash2 size={24} /></div>
        <div>
          <h2 id="delete-dialog-title">Excluir {item.nome} definitivamente?</h2>
          <p className="delete-dialog-lead">Esta ação destrói os dados do estabelecimento e não pode ser desfeita.</p>
        </div>

        <div className="delete-impact" role="note">
          <strong>O que acontece</strong>
          <ul>
            <li>O link <b>{item.slug}</b>, todos os logins e o agente de impressão deixam de funcionar.</li>
            <li>Pedidos, produtos, usuários, relatórios, dados financeiros e biometrias são apagados do banco PostgreSQL.</li>
            <li>As imagens enviadas, a assinatura e todas as configurações são removidas.</li>
            <li>Não existe recuperação automática. Apenas o registro administrativo da exclusão permanece.</li>
          </ul>
        </div>

        {error ? <div className="delete-dialog-error" role="alert"><TriangleAlert size={18} />{error}</div> : null}

        <label className="field">
          <span>Digite o link para confirmar</span>
          <input value={confirmation} onChange={(event) => onConfirmationChange(event.target.value)} placeholder={requiredConfirmation} autoComplete="off" spellCheck={false} required autoFocus />
          <small className="field-hint">Digite exatamente: <b>{requiredConfirmation}</b></small>
        </label>

        <label className="field">
          <span>Senha do administrador do painel</span>
          <span className="password-field">
            <LockKeyhole size={18} aria-hidden="true" />
            <input name="senha" type="password" minLength={8} maxLength={200} autoComplete="current-password" required />
          </span>
        </label>

        <div className="delete-dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={deleting}>Cancelar</button>
          <button type="submit" className="danger-button danger-button--solid" disabled={deleting || confirmation !== requiredConfirmation}>
            {deleting ? <LoaderCircle size={18} className="animate-spin" /> : <Trash2 size={18} />}
            {deleting ? "Excluindo tudo…" : "Excluir tudo definitivamente"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
