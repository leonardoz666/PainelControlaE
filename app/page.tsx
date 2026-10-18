"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Blocks,
  Check,
  ChevronDown,
  CircleDollarSign,
  Crown,
  History,
  Database,
  ExternalLink,
  KeyRound,
  LoaderCircle,
  LogOut,
  MonitorCheck,
  Pencil,
  Palette,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { api, ApiError } from "@/app/lib/api";
import {
  establishmentInstallationUrl,
  establishmentLoginUrl,
  normalizeOperationalBaseUrl,
} from "@/app/lib/operational-url";
import { DeleteEstablishmentDialog, deletionConfirmation } from "@/app/components/dashboard/DeleteEstablishmentDialog";
import { Field, FormActions } from "@/app/components/dashboard/FormControls";
import type { Establishment, Status, Summary } from "@/app/components/dashboard/types";

const AuditHistory = dynamic(() => import("@/app/components/AuditHistory").then((module) => module.AuditHistory));
const BrandingEditor = dynamic(() => import("@/app/components/BrandingEditor").then((module) => module.BrandingEditor));
const ModuleManager = dynamic(() => import("@/app/components/ModuleManager").then((module) => module.ModuleManager));

function optionalNumber(form: FormData, name: string): number | null {
  const value = String(form.get(name) ?? "").trim();
  return value === "" ? null : Number(value);
}


const STATUS_LABEL: Record<Status, string> = {
  TESTE: "Em teste",
  ATIVO: "Ativo",
  INADIMPLENTE: "Inadimplente",
  SUSPENSO: "Suspenso",
  CANCELADO: "Cancelado",
};
const STATUS_STYLE: Record<Status, string> = {
  TESTE: "bg-blue-50 text-blue-700",
  ATIVO: "bg-emerald-50 text-emerald-700",
  INADIMPLENTE: "bg-amber-50 text-amber-800",
  SUSPENSO: "bg-red-50 text-red-700",
  CANCELADO: "bg-slate-200 text-slate-700",
};

function Metric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Store;
  tone: "violet" | "green" | "blue" | "amber" | "red";
}) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <span className="metric-icon">
        <Icon size={19} />
      </span>
      <div className="relative z-10 min-w-0">
        <p className="metric-value">{value}</p>
        <p className="metric-label">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"establishments" | "history">("establishments");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [items, setItems] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ownerFor, setOwnerFor] = useState<Establishment | null>(null);
  const [ownerMode, setOwnerMode] = useState<"create" | "reset">("create");
  const [announcement, setAnnouncement] = useState("");
  const [provisioning, setProvisioning] = useState("");
  const [billingFor, setBillingFor] = useState<Establishment | null>(null);
  const [editingFor, setEditingFor] = useState<Establishment | null>(null);
  const [brandingFor, setBrandingFor] = useState<Establishment | null>(null);
  const [modulesFor, setModulesFor] = useState<Establishment | null>(null);
  const [printerToken, setPrinterToken] = useState<{ id: string; value: string } | null>(null);
  const [installationCode, setInstallationCode] = useState<{ id: string; value: string; establishmentUrl: string } | null>(null);
  const [deleteFor, setDeleteFor] = useState<Establishment | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [search, setSearch] = useState("");

  const operationalBase = useMemo(
    () => normalizeOperationalBaseUrl(process.env.NEXT_PUBLIC_OPERATIONAL_URL),
    [],
  );

  const visibleItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return items;
    return items.filter((item) =>
      [item.nome, item.slug, item.email, item.telefone]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(query)),
    );
  }, [items, search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await api("/auth/me");
      const [nextSummary, response] = await Promise.all([
        api<Summary>("/resumo"),
        api<{ data: Establishment[] }>("/estabelecimentos"),
      ]);
      setSummary(nextSummary);
      setItems(response.data);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401)
        return router.replace("/login");
      setError(
        reason instanceof Error ? reason.message : "Falha ao carregar o painel",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
  }

  async function createEstablishment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api("/estabelecimentos", {
        method: "POST",
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
          databaseUrl: form.get("databaseUrl"),
          valorMensal: Number(form.get("valorMensal") || 0),
          proximoVencimento: form.get("proximoVencimento") || null,
        }),
      });
      event.currentTarget.reset();
      setShowCreate(false);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Falha ao cadastrar estabelecimento",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(item: Establishment, status: Status) {
    const previous = item.status;
    setItems((current) =>
      current.map((value) =>
        value.id === item.id ? { ...value, status } : value,
      ),
    );
    try {
      await api(`/estabelecimentos/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (reason) {
      setItems((current) =>
        current.map((value) =>
          value.id === item.id ? { ...value, status: previous } : value,
        ),
      );
      setError(
        reason instanceof Error ? reason.message : "Falha ao alterar acesso",
      );
    }
  }

  async function createOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerFor) return;
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api(`/estabelecimentos/${ownerFor.id}/dono`, {
        method: "POST",
        body: JSON.stringify({
          nome: form.get("nome"),
          login: form.get("login"),
          email: form.get("email") || null,
          senha: form.get("senha"),
        }),
      });
      setOwnerFor(null);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Falha ao criar acesso do Dono",
      );
    } finally {
      setSaving(false);
    }
  }

  async function resetOwnerPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerFor) return;
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api(`/estabelecimentos/${ownerFor.id}/dono/redefinir-senha`, {
        method: "POST",
        body: JSON.stringify({
          login: form.get("login"),
          senha: form.get("senha"),
        }),
      });
      setOwnerFor(null);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Falha ao redefinir a senha do Dono",
      );
    } finally {
      setSaving(false);
    }
  }

  async function provisionDatabase(item: Establishment) {
    setProvisioning(item.id);
    setError("");
    try {
      await api(`/estabelecimentos/${item.id}/provisionar`, { method: "POST" });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao preparar o banco");
    } finally {
      setProvisioning("");
    }
  }

  async function updateSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!billingFor) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      await api(`/estabelecimentos/${billingFor.id}/assinatura`, {
        method: "PATCH",
        body: JSON.stringify({
          valorMensal: Number(form.get("valorMensal") || 0),
          proximoVencimento: form.get("proximoVencimento") || null,
        }),
      });
      setBillingFor(null);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao atualizar mensalidade");
    } finally {
      setSaving(false);
    }
  }

  async function updateEstablishment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingFor) return;
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const databaseUrl = String(form.get("databaseUrl") || "").trim();
    try {
      await api(`/estabelecimentos/${editingFor.id}`, {
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
      setEditingFor(null);
      setAnnouncement(`Cadastro de ${editingFor.nome} atualizado.`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao atualizar o estabelecimento");
    } finally {
      setSaving(false);
    }
  }

  async function generatePrinterToken(item: Establishment) {
    setError("");
    try {
      const result = await api<{ token: string }>(`/estabelecimentos/${item.id}/impressao/token`, { method: "POST" });
      setPrinterToken({ id: item.id, value: result.token });
      const tokenCopied = await navigator.clipboard.writeText(result.token).then(() => true).catch(() => false);
      setAnnouncement(tokenCopied ? "Token de impressão gerado e copiado." : "Token de impressão gerado. Copie-o no painel.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao gerar token de impressão");
      setAnnouncement("Falha ao gerar o token de impressão.");
    }
  }

  async function generateInstallationCode(item: Establishment) {
    setError("");
    try {
      const result = await api<{ code: string }>(`/estabelecimentos/${item.id}/aplicativo/codigo`, { method: "POST" });
      const establishmentUrl = establishmentInstallationUrl(operationalBase, item.slug);
      setInstallationCode({ id: item.id, value: result.code, establishmentUrl });
      const copied = await navigator.clipboard.writeText(`Link único do estabelecimento: ${establishmentUrl}\nCódigo para a primeira ativação: ${result.code}`).then(() => true).catch(() => false);
      setAnnouncement(copied ? "Dados de instalação gerados e copiados." : "Dados de instalação gerados. Copie-os no painel.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao gerar código de ativação");
      setAnnouncement("Falha ao gerar o código de ativação.");
    }
  }

  function openDeleteDialog(item: Establishment) {
    setEditingFor(null);
    setBrandingFor(null);
    setModulesFor(null);
    setBillingFor(null);
    setOwnerFor(null);
    setDeleteConfirmation("");
    setDeleteError("");
    setDeleteFor(item);
  }

  async function deleteEstablishment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deleteFor || deleteConfirmation !== deletionConfirmation(deleteFor.slug)) return;
    setDeleting(true);
    setDeleteError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ backupFile: string }>(`/estabelecimentos/${deleteFor.id}`, {
        method: "DELETE",
        body: JSON.stringify({
          senha: form.get("senha"),
          confirmacao: deleteConfirmation,
        }),
      });
      const removedName = deleteFor.nome;
      setDeleteFor(null);
      setDeleteConfirmation("");
      setAnnouncement(`${removedName} foi excluído após a criação do backup lógico ${result.backupFile}.`);
      await load();
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : "Falha ao remover o estabelecimento");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="ceo-shell">
      <aside className="ceo-sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark"><Crown size={25} strokeWidth={2.1} /></span>
          <div>
            <p className="brand-name">ControlaÊ</p>
            <p className="brand-caption">Painel CEO</p>
          </div>
        </div>

        <button onClick={() => void logout()} className="sidebar-logout">
          <LogOut size={19} /> <span>Sair</span>
        </button>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <button type="button" onClick={() => setActiveView("establishments")} className={`sidebar-nav-item ${activeView === "establishments" ? "sidebar-nav-item--active" : ""}`} aria-current={activeView === "establishments" ? "page" : undefined}>
            <Building2 size={20} /> Estabelecimentos
          </button>
          <button type="button" onClick={() => setActiveView("history")} className={`sidebar-nav-item ${activeView === "history" ? "sidebar-nav-item--active" : ""}`} aria-current={activeView === "history" ? "page" : undefined}>
            <History size={20} /> Histórico
          </button>
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-footer-icon"><Crown size={18} /></span>
          <div><strong>ControlaÊ</strong><small>v1.0.0</small></div>
        </div>
      </aside>

      <main className="ceo-main">
        <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
        <div className="ceo-content">
          <header className="page-header">
            <div>
              <h1>{activeView === "establishments" ? "Estabelecimentos" : "Histórico"}</h1>
              <p>{activeView === "establishments" ? "Controle clientes, disponibilidade e acessos sem misturar os dados operacionais." : "Acompanhe todas as ações administrativas realizadas na plataforma."}</p>
            </div>
            {activeView === "establishments" && <div className="header-actions">
              <button onClick={() => void load()} disabled={loading} aria-label="Atualizar dados" className="refresh-button">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
              <button onClick={() => setShowCreate((value) => !value)} className="primary-button">
                <Plus size={20} /> Novo estabelecimento
              </button>
            </div>}
          </header>

          {error && (
            <div role="alert" className="error-banner">
              <TriangleAlert size={19} />
              <span>{error}</span>
              <button onClick={() => setError("")}>Fechar</button>
            </div>
          )}

          {activeView === "establishments" ? <>
          <section className="metrics-panel" aria-label="Resumo dos estabelecimentos">
            <Metric label="Total" value={summary?.total ?? 0} icon={Building2} tone="violet" />
            <Metric label="Ativos" value={summary?.ativos ?? 0} icon={Check} tone="green" />
            <Metric label="Em teste" value={summary?.testes ?? 0} icon={Users} tone="blue" />
            <Metric label="Pendentes" value={summary?.pendentes ?? 0} icon={CircleDollarSign} tone="amber" />
            <Metric label="Suspensos" value={summary?.suspensos ?? 0} icon={TriangleAlert} tone="red" />
          </section>

          {showCreate && (
            <section className="form-panel">
              <div className="panel-heading">
                <div>
                  <h2>Novo estabelecimento</h2>
                  <p>O link individual será gerado automaticamente a partir do identificador abaixo.</p>
                </div>
                <button type="button" onClick={() => setShowCreate(false)} className="text-button">Fechar</button>
              </div>
              <form onSubmit={createEstablishment} className="form-grid">
                <Field name="nome" label="Nome" required />
                <Field name="slug" label="Link" placeholder="restaurante-exemplo" required />
                <Field name="documento" label="CNPJ ou documento" />
                <Field name="email" label="E-mail comercial" type="email" />
                <Field name="telefone" label="Telefone" />
                <Field name="garcomLatitude" label="Latitude para login de garçons" type="number" placeholder="-12.000000" />
                <Field name="garcomLongitude" label="Longitude para login de garçons" type="number" placeholder="-38.000000" />
                <Field name="garcomRaioMetros" label="Raio permitido (metros)" type="number" placeholder="50" hint="Deixe os três campos vazios para não restringir o login por localização." />
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input name="exigirVinculoGarcom" type="checkbox" className="mt-1 h-4 w-4 accent-violet-600" />
                  <span><strong className="block text-sm text-slate-900">Exigir celular autorizado para garçons</strong><span className="mt-1 block text-xs leading-5 text-slate-600">Quando ativo, cada garçom precisa abrir uma vez o convite individual gerado na tela de usuários.</span></span>
                </label>
                <Field name="valorMensal" label="Mensalidade" type="number" placeholder="0,00" />
                <Field name="proximoVencimento" label="Próximo vencimento" type="date" />
                <Field name="databaseUrl" label="Conexão PostgreSQL" type="password" required />
                <FormActions saving={saving} onCancel={() => setShowCreate(false)} label="Cadastrar estabelecimento" />
              </form>
            </section>
          )}

          <section className="clients-panel">
            <div className="clients-header">
              <div>
                <h2>Clientes da plataforma</h2>
                <p>{items.length} {items.length === 1 ? "estabelecimento cadastrado" : "estabelecimentos cadastrados"}</p>
              </div>
              <label className="search-field">
                <span className="sr-only">Buscar estabelecimento</span>
                <Search size={18} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estabelecimento..." />
              </label>
            </div>

            {loading ? (
              <div className="loading-list" aria-label="Carregando estabelecimentos">
                {[1, 2, 3].map((item) => <div key={item} className="client-skeleton" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <Building2 size={42} />
                <h3>Nenhum estabelecimento cadastrado</h3>
                <p>Cadastre o primeiro cliente para gerar seu link de acesso.</p>
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="empty-state">
                <Search size={38} />
                <h3>Nenhum resultado</h3>
                <p>Tente buscar pelo nome, link, e-mail ou telefone.</p>
              </div>
            ) : (
              <div className="clients-list">
                {visibleItems.map((item) => (
                  <article key={item.id} className="client-card">
                    <div className="client-main">
                      <span className="client-logo"><Crown size={29} /></span>
                      <div className="client-identity">
                        <div className="client-title-line">
                          <h3>{item.nome}</h3>
                          <span className={`status-pill ${STATUS_STYLE[item.status]}`}><span />{STATUS_LABEL[item.status]}</span>
                        </div>
                        <a href={establishmentLoginUrl(operationalBase, item.slug)} target="_blank" rel="noreferrer" className="client-slug">
                          {item.slug}<ExternalLink size={13} aria-hidden="true" />
                        </a>
                        <div className="readiness-list">
                          <span className={item.bancoPronto ? "ready" : "waiting"}>{item.bancoPronto ? "Banco pronto" : "Banco pendente"}</span>
                          <span className="ready">Link pronto</span>
                          <span className={item.donoPronto ? "ready" : "waiting"}>{item.donoPronto ? "Dono criado" : "Dono pendente"}</span>
                          <span className={item.impressaoConfigurada ? "protected" : "waiting"}><ShieldCheck size={13} />{item.impressaoConfigurada ? "Impressão protegida" : "Impressão pendente"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="billing-summary">
                      <span className="billing-icon"><CircleDollarSign size={20} /></span>
                      <div>
                        <small>Mensalidade</small>
                        <strong>{Number(item.assinatura?.valorMensal ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                      </div>
                      <label className="status-select">
                        <span className="sr-only">Situação de {item.nome}</span>
                        <select value={item.status} onChange={(event) => void changeStatus(item, event.target.value as Status)}>
                          <option value="TESTE">Em teste</option>
                          <option value="ATIVO" disabled={!item.bancoPronto || !item.donoPronto}>Ativo</option>
                          <option value="INADIMPLENTE">Inadimplente</option>
                          <option value="SUSPENSO">Suspenso</option>
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                        <ChevronDown size={15} />
                      </label>
                    </div>

                    <div className="client-actions">
                      <button onClick={() => { setEditingFor((current) => current?.id === item.id ? null : item); setBrandingFor(null); setModulesFor(null); setBillingFor(null); setOwnerFor(null); }}>
                        <Pencil size={20} /><span>Editar</span>
                      </button>
                      <button onClick={() => { setBrandingFor((current) => current?.id === item.id ? null : item); setModulesFor(null); setEditingFor(null); setBillingFor(null); setOwnerFor(null); }}>
                        <Palette size={20} /><span>Personalizar</span>
                      </button>
                      <button onClick={() => { setModulesFor((current) => current?.id === item.id ? null : item); setBrandingFor(null); setEditingFor(null); setBillingFor(null); setOwnerFor(null); }}>
                        <Blocks size={20} /><span>Módulos</span>
                      </button>
                      <button onClick={() => void provisionDatabase(item)} disabled={provisioning === item.id} title="Aplicar atualizações no banco">
                        {provisioning === item.id ? <LoaderCircle size={20} className="animate-spin" /> : <Database size={20} />}
                        <span>{item.bancoPronto ? "Atualizar banco" : "Preparar banco"}</span>
                      </button>
                      <button onClick={() => { setBillingFor((current) => current?.id === item.id ? null : item); setModulesFor(null); }}>
                        <CircleDollarSign size={20} /><span>Mensalidade</span>
                      </button>
                      <button onClick={() => void generatePrinterToken(item)}>
                        <ShieldCheck size={20} /><span>Token impressão</span>
                      </button>
                      <button onClick={() => void generateInstallationCode(item)} title={establishmentInstallationUrl(operationalBase, item.slug)}>
                        <MonitorCheck size={20} /><span>Ativar aplicativo</span>
                      </button>
                      <button className="access-button" onClick={() => { setOwnerFor((current) => current?.id === item.id ? null : item); setModulesFor(null); setOwnerMode("create"); }}>
                        <KeyRound size={19} /><span>Dono e senha</span><ArrowRight size={16} aria-hidden />
                      </button>
                    </div>

                    {editingFor?.id === item.id && (
                      <form onSubmit={updateEstablishment} className="inline-form edit-establishment-form">
                        <div className="inline-form-heading">
                          <div>
                            <h4>Editar estabelecimento</h4>
                            <p>O link acompanha o identificador automaticamente. Deixe a conexão vazia para manter o banco atual.</p>
                          </div>
                          <button type="button" onClick={() => setEditingFor(null)} className="text-button">Fechar</button>
                        </div>
                        <div className="form-grid edit-establishment-grid">
                          <Field name="nome" label="Nome" defaultValue={item.nome} required />
                          <Field name="slug" label="Link" defaultValue={item.slug} required />
                          <Field name="documento" label="CNPJ ou documento" defaultValue={item.documento ?? ""} />
                          <Field name="email" label="E-mail comercial" type="email" defaultValue={item.email ?? ""} />
                          <Field name="telefone" label="Telefone" defaultValue={item.telefone ?? ""} />
                          <Field name="garcomLatitude" label="Latitude para login de garçons" type="number" defaultValue={item.garcomLatitude == null ? "" : String(item.garcomLatitude)} />
                          <Field name="garcomLongitude" label="Longitude para login de garçons" type="number" defaultValue={item.garcomLongitude == null ? "" : String(item.garcomLongitude)} />
                          <Field name="garcomRaioMetros" label="Raio permitido (metros)" type="number" defaultValue={item.garcomRaioMetros == null ? "" : String(item.garcomRaioMetros)} hint="Deixe os três campos vazios para não restringir o login por localização." />
                          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <input name="exigirVinculoGarcom" type="checkbox" defaultChecked={item.exigirVinculoGarcom} className="mt-1 h-4 w-4 accent-violet-600" />
                            <span><strong className="block text-sm text-slate-900">Exigir celular autorizado para garçons</strong><span className="mt-1 block text-xs leading-5 text-slate-600">Desative para permitir login normal. Ative para exigir o convite individual por aparelho.</span></span>
                          </label>
                          <Field name="databaseUrl" label="Nova conexão PostgreSQL" type="password" placeholder="Manter conexão atual" hint="Ao trocar o banco, o cliente volta para Em teste e precisa ser preparado novamente." />
                          <FormActions saving={saving} onCancel={() => setEditingFor(null)} label="Salvar alterações" />
                        </div>
                        <div className="danger-zone">
                          <div>
                            <strong>Remover do ControlaÊ</strong>
                            <p>Exclui permanentemente o cadastro, todas as tabelas e dados do banco PostgreSQL e os arquivos deste estabelecimento.</p>
                          </div>
                          <button type="button" className="danger-button" onClick={() => openDeleteDialog(item)}>
                            <Trash2 size={18} /> Remover estabelecimento
                          </button>
                        </div>
                      </form>
                    )}

                    {brandingFor?.id === item.id && (
                      <BrandingEditor
                        establishment={item}
                        onClose={() => setBrandingFor(null)}
                        onSaved={() => setAnnouncement(`Identidade visual de ${item.nome} atualizada.`)}
                      />
                    )}

                    {modulesFor?.id === item.id && (
                      <ModuleManager
                        establishment={modulesFor}
                        onClose={() => setModulesFor(null)}
                        onSaved={(modulosAtivos) => {
                          setItems(current => current.map(existing => existing.id === item.id ? { ...existing, modulosAtivos } : existing));
                          setModulesFor(current => current?.id === item.id ? { ...current, modulosAtivos } : current);
                          setAnnouncement(`Módulos de ${item.nome} atualizados.`);
                        }}
                      />
                    )}

                    {printerToken?.id === item.id && (
                      <div className="token-banner">
                        <strong>Copie agora: este token será mostrado somente desta vez.</strong>
                        <code>{printerToken.value}</code>
                      </div>
                    )}

                    {installationCode?.id === item.id && (
                      <div className="token-banner">
                        <strong>Dados para ativar o aplicativo. O código é válido por 15 minutos.</strong>
                        <span className="token-label">Link único do estabelecimento</span>
                        <code>{installationCode.establishmentUrl}</code>
                        <span className="token-label">Código para a primeira ativação</span>
                        <code>{installationCode.value}</code>
                      </div>
                    )}

                    {billingFor?.id === item.id && (
                      <form onSubmit={updateSubscription} className="inline-form md:grid-cols-2">
                        <Field name="valorMensal" label="Mensalidade" type="number" defaultValue={String(item.assinatura?.valorMensal ?? 0)} required />
                        <Field name="proximoVencimento" label="Próximo vencimento" type="date" defaultValue={item.assinatura?.proximoVencimento?.slice(0, 10) || ""} />
                        <FormActions saving={saving} onCancel={() => setBillingFor(null)} label="Salvar mensalidade" />
                      </form>
                    )}

                    {ownerFor?.id === item.id && (
                      <div className="inline-form">
                        <div className="mode-tabs">
                          <button type="button" onClick={() => setOwnerMode("create")} className={ownerMode === "create" ? "active" : ""}>Criar Dono</button>
                          <button type="button" onClick={() => setOwnerMode("reset")} className={ownerMode === "reset" ? "active" : ""}>Redefinir senha</button>
                        </div>
                        {ownerMode === "create" ? (
                          <form onSubmit={createOwner} className="form-grid form-grid--owner">
                            <Field name="nome" label="Nome do Dono" required />
                            <Field name="login" label="Login" required />
                            <Field name="email" label="E-mail" type="email" />
                            <Field name="senha" label="Senha inicial" type="password" required />
                            <FormActions saving={saving} onCancel={() => setOwnerFor(null)} label="Criar acesso do Dono" />
                          </form>
                        ) : (
                          <form onSubmit={resetOwnerPassword} className="form-grid md:grid-cols-2">
                            <Field name="login" label="Login do Dono" required />
                            <Field name="senha" label="Nova senha" type="password" required />
                            <FormActions saving={saving} onCancel={() => setOwnerFor(null)} label="Redefinir senha" />
                          </form>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
          </> : <AuditHistory />}
        </div>
      </main>
      {deleteFor ? (
        <DeleteEstablishmentDialog
          item={deleteFor}
          confirmation={deleteConfirmation}
          deleting={deleting}
          error={deleteError}
          onConfirmationChange={setDeleteConfirmation}
          onClose={() => { if (!deleting) { setDeleteFor(null); setDeleteError(""); } }}
          onSubmit={deleteEstablishment}
        />
      ) : null}
    </div>
  );
}
