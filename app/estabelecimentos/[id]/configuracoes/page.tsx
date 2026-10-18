"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Crown,
  Database,
  LoaderCircle,
  LogOut,
  MapPin,
  Settings2,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { api, ApiError } from "@/app/lib/api";
import { DeleteEstablishmentDialog, deletionConfirmation } from "@/app/components/dashboard/DeleteEstablishmentDialog";
import { Field, FormActions } from "@/app/components/dashboard/FormControls";
import type { Establishment } from "@/app/components/dashboard/types";

function optionalNumber(form: FormData, name: string): number | null {
  const value = String(form.get(name) ?? "").trim();
  return value === "" ? null : Number(value);
}

export default function EstablishmentSettingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const establishmentId = String(params.id);
  const [item, setItem] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await api("/auth/me");
      const response = await api<{ data: Establishment[] }>("/estabelecimentos");
      const establishment = response.data.find((candidate) => candidate.id === establishmentId);
      if (!establishment) {
        setError("Estabelecimento não encontrado.");
        return;
      }
      setItem(establishment);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        router.replace("/login");
        return;
      }
      setError(reason instanceof Error ? reason.message : "Falha ao carregar as configurações");
    } finally {
      setLoading(false);
    }
  }, [establishmentId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
  }

  async function updateEstablishment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;
    setSaving(true);
    setError("");
    setSavedMessage("");
    const form = new FormData(event.currentTarget);
    const databaseUrl = String(form.get("databaseUrl") || "").trim();

    try {
      await api(`/estabelecimentos/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nome: form.get("nome"),
          slug: form.get("slug"),
          documento: form.get("documento") || null,
          email: form.get("email") || null,
          telefone: form.get("telefone") || null,
          garcomLatitude: optionalNumber(form, "garcomLatitude"),
          garcomLongitude: optionalNumber(form, "garcomLongitude"),
          garcomRaioMetros: optionalNumber(form, "garcomRaioMetros"),
          exigirVinculoGarcom: form.get("exigirVinculoGarcom") === "on",
          ...(databaseUrl ? { databaseUrl } : {}),
        }),
      });
      setSavedMessage("Configurações salvas com sucesso.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao atualizar o estabelecimento");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEstablishment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item || deleteConfirmation !== deletionConfirmation(item.slug)) return;
    setDeleting(true);
    setDeleteError("");
    const form = new FormData(event.currentTarget);
    try {
      await api(`/estabelecimentos/${item.id}`, {
        method: "DELETE",
        body: JSON.stringify({
          senha: form.get("senha"),
          confirmacao: deleteConfirmation,
        }),
      });
      router.replace("/");
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : "Falha ao remover o estabelecimento");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="ceo-shell">
      <a href="#settings-content" className="skip-link">Pular para as configurações</a>
      <aside className="ceo-sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark"><Crown size={25} strokeWidth={2.1} aria-hidden="true" /></span>
          <div>
            <p className="brand-name">ControlaÊ</p>
            <p className="brand-caption">Painel CEO</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <Link href="/" className="sidebar-nav-item">
            <Building2 size={20} aria-hidden="true" /> Estabelecimentos
          </Link>
          <span className="sidebar-nav-item sidebar-nav-item--active" aria-current="page">
            <Settings2 size={20} aria-hidden="true" /> Configurações
          </span>
        </nav>

        <button type="button" onClick={() => void logout()} className="sidebar-logout">
          <LogOut size={19} aria-hidden="true" /> <span>Sair</span>
        </button>

        <div className="sidebar-footer">
          <span className="sidebar-footer-icon"><Crown size={18} aria-hidden="true" /></span>
          <div><strong>ControlaÊ</strong><small>v1.0.0</small></div>
        </div>
      </aside>

      <main id="settings-content" className="ceo-main settings-main">
        <div className="ceo-content settings-content">
          <Link href="/" className="settings-back"><ArrowLeft size={17} aria-hidden="true" /> Voltar aos estabelecimentos</Link>

          <header className="settings-header">
            <div>
              <h1>Configurações do estabelecimento</h1>
              <p>{item ? `${item.nome} · ${item.slug}` : "Carregando dados do estabelecimento…"}</p>
            </div>
            {item ? <span className="settings-status">{item.status === "ATIVO" ? "Ativo" : item.status === "TESTE" ? "Em teste" : item.status.toLocaleLowerCase("pt-BR")}</span> : null}
          </header>

          {error ? (
            <div role="alert" className="error-banner">
              <TriangleAlert size={19} aria-hidden="true" />
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>Fechar</button>
            </div>
          ) : null}

          {savedMessage ? <div className="settings-success" role="status">{savedMessage}</div> : null}

          {loading ? (
            <div className="settings-loading"><LoaderCircle size={22} className="animate-spin" aria-hidden="true" /> Carregando configurações…</div>
          ) : item ? (
            <div className="settings-layout">
              <nav className="settings-section-nav" aria-label="Seções das configurações">
                <a href="#dados"><Building2 size={17} aria-hidden="true" /> Dados gerais</a>
                <a href="#acesso"><ShieldCheck size={17} aria-hidden="true" /> Acesso dos garçons</a>
                <a href="#infraestrutura"><Database size={17} aria-hidden="true" /> Infraestrutura</a>
                <a href="#exclusao" className="settings-section-nav-danger"><Trash2 size={17} aria-hidden="true" /> Exclusão</a>
              </nav>

              <div className="settings-workspace">
                <form onSubmit={updateEstablishment} className="settings-form">
                  <section id="dados" className="settings-section">
                    <div className="settings-section-heading">
                      <Building2 size={19} aria-hidden="true" />
                      <div><h2>Dados gerais</h2><p>Identificação comercial e endereço permanente de acesso.</p></div>
                    </div>
                    <div className="settings-fields settings-fields--identity">
                      <Field name="nome" label="Nome" defaultValue={item.nome} required />
                      <Field name="slug" label="Link do estabelecimento" defaultValue={item.slug} required />
                      <Field name="documento" label="CNPJ ou documento" defaultValue={item.documento ?? ""} />
                      <Field name="email" label="E-mail comercial" type="email" defaultValue={item.email ?? ""} />
                      <Field name="telefone" label="Telefone" defaultValue={item.telefone ?? ""} />
                    </div>
                  </section>

                  <section id="acesso" className="settings-section">
                    <div className="settings-section-heading">
                      <ShieldCheck size={19} aria-hidden="true" />
                      <div><h2>Acesso dos garçons</h2><p>Defina a autorização de aparelhos e, se necessário, limite o login ao endereço do restaurante.</p></div>
                    </div>
                    <label className="policy-toggle settings-policy-toggle">
                      <input name="exigirVinculoGarcom" type="checkbox" defaultChecked={item.exigirVinculoGarcom} />
                      <span className="policy-switch" aria-hidden="true"><span /></span>
                      <span className="policy-copy"><strong>Exigir celular autorizado</strong><small>Quando desligado, o garçom entra normalmente com login e senha.</small></span>
                    </label>
                    <div className="location-heading"><MapPin size={16} aria-hidden="true" /><span>Limite por localização</span></div>
                    <div className="settings-fields settings-fields--location">
                      <Field name="garcomLatitude" label="Latitude" type="number" defaultValue={item.garcomLatitude == null ? "" : String(item.garcomLatitude)} />
                      <Field name="garcomLongitude" label="Longitude" type="number" defaultValue={item.garcomLongitude == null ? "" : String(item.garcomLongitude)} />
                      <Field name="garcomRaioMetros" label="Raio em metros" type="number" defaultValue={item.garcomRaioMetros == null ? "" : String(item.garcomRaioMetros)} />
                    </div>
                    <p className="settings-note">Deixe os três campos vazios para permitir login de qualquer localização.</p>
                  </section>

                  <section id="infraestrutura" className="settings-section">
                    <div className="settings-section-heading">
                      <Database size={19} aria-hidden="true" />
                      <div><h2>Infraestrutura</h2><p>A conexão atual permanece protegida e nunca é exibida.</p></div>
                    </div>
                    <div className="settings-database-field">
                      <Field name="databaseUrl" label="Nova conexão PostgreSQL" type="password" placeholder="Manter conexão atual" />
                    </div>
                    <div className="database-warning"><TriangleAlert size={17} aria-hidden="true" /><span>Trocar o banco devolve o cliente ao status <strong>Em teste</strong> e exige nova preparação.</span></div>
                  </section>

                  <div className="settings-actions">
                    <p>Alterações de acesso entram em vigor no próximo login.</p>
                    <FormActions saving={saving} onCancel={() => router.push("/")} label="Salvar alterações" />
                  </div>
                </form>

                <section id="exclusao" className="settings-danger-zone">
                  <div>
                    <h2>Excluir estabelecimento</h2>
                    <p>Remove permanentemente o cadastro, o banco PostgreSQL e todos os arquivos deste estabelecimento.</p>
                  </div>
                  <button type="button" className="danger-button" onClick={() => setShowDelete(true)}>
                    <Trash2 size={18} aria-hidden="true" /> Excluir estabelecimento
                  </button>
                </section>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {showDelete && item ? (
        <DeleteEstablishmentDialog
          item={item}
          confirmation={deleteConfirmation}
          deleting={deleting}
          error={deleteError}
          onConfirmationChange={setDeleteConfirmation}
          onClose={() => { if (!deleting) { setShowDelete(false); setDeleteError(""); setDeleteConfirmation(""); } }}
          onSubmit={deleteEstablishment}
        />
      ) : null}
    </div>
  );
}
