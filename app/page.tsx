"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Blocks,
  Check,
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
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { api, ApiError } from "@/app/lib/api";
import {
  establishmentInstallationUrl,
  establishmentLoginUrl,
  normalizeOperationalBaseUrl,
} from "@/app/lib/operational-url";
import { Field, FormActions } from "@/app/components/dashboard/FormControls";
import { StatusSelect } from "@/app/components/dashboard/StatusSelect";
import type { Establishment, Status, Summary } from "@/app/components/dashboard/types";

const AuditHistory = dynamic(() => import("@/app/components/AuditHistory").then((module) => module.AuditHistory));
const BrandingEditor = dynamic(() => import("@/app/components/BrandingEditor").then((module) => module.BrandingEditor));
const ModuleManager = dynamic(() => import("@/app/components/ModuleManager").then((module) => module.ModuleManager));

function optionalNumber(form: FormData, name: string): number | null {
  const value = String(form.get(name) ?? "").trim();
  return value === "" ? null : Number(value);
}


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
        <Icon size={19} aria-hidden="true" />
      </span>
      <div className="metric-copy">
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
  const [brandingFor, setBrandingFor] = useState<Establishment | null>(null);
  const [modulesFor, setModulesFor] = useState<Establishment | null>(null);
  const [printerToken, setPrinterToken] = useState<{ id: string; value: string } | null>(null);
  const [installationCode, setInstallationCode] = useState<{ id: string; value: string; establishmentUrl: string } | null>(null);
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

  return (
    <div className="ceo-shell">
      <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
      <aside className="ceo-sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark"><Crown size={25} strokeWidth={2.1} aria-hidden="true" /></span>
          <div>
            <p className="brand-name">ControlaÊ</p>
            <p className="brand-caption">Painel CEO</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <button type="button" onClick={() => setActiveView("establishments")} className={`sidebar-nav-item ${activeView === "establishments" ? "sidebar-nav-item--active" : ""}`} aria-current={activeView === "establishments" ? "page" : undefined}>
            <Building2 size={20} aria-hidden="true" /> Estabelecimentos
          </button>
          <button type="button" onClick={() => setActiveView("history")} className={`sidebar-nav-item ${activeView === "history" ? "sidebar-nav-item--active" : ""}`} aria-current={activeView === "history" ? "page" : undefined}>
            <History size={20} aria-hidden="true" /> Histórico
          </button>
        </nav>

        <button type="button" onClick={() => void logout()} className="sidebar-logout">
          <LogOut size={19} aria-hidden="true" /> <span>Sair</span>
        </button>

        <div className="sidebar-footer">
          <span className="sidebar-footer-icon"><Crown size={18} aria-hidden="true" /></span>
          <div><strong>ControlaÊ</strong><small>v1.0.0</small></div>
        </div>
      </aside>

      <main id="main-content" className="ceo-main">
        <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
        <div className="ceo-content">
          <header className="page-header">
            <div>
              <h1>{activeView === "establishments" ? "Estabelecimentos" : "Histórico"}</h1>
              <p>{activeView === "establishments" ? "Controle clientes, disponibilidade e acessos sem misturar os dados operacionais." : "Acompanhe todas as ações administrativas realizadas na plataforma."}</p>
            </div>
            {activeView === "establishments" && <div className="header-actions">
              <button type="button" onClick={() => void load()} disabled={loading} aria-label="Atualizar dados" className="refresh-button">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setShowCreate((value) => !value)} className="primary-button">
                <Plus size={20} aria-hidden="true" /> Novo estabelecimento
              </button>
            </div>}
          </header>

          {error && (
            <div role="alert" className="error-banner">
              <TriangleAlert size={19} aria-hidden="true" />
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>Fechar</button>
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
                <label className="create-policy">
                  <input name="exigirVinculoGarcom" type="checkbox" />
                  <span><strong>Exigir celular autorizado para garçons</strong><small>Quando ativo, cada garçom precisa abrir uma vez o convite individual gerado na tela de usuários.</small></span>
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
                <Search size={18} aria-hidden="true" />
                <input type="search" name="busca-estabelecimento" autoComplete="off" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estabelecimento…" />
              </label>
            </div>

            {loading ? (
              <div className="loading-list" role="status" aria-label="Carregando estabelecimentos">
                {[1, 2, 3].map((item) => <div key={item} className="client-skeleton" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <Building2 size={42} aria-hidden="true" />
                <h3>Nenhum estabelecimento cadastrado</h3>
                <p>Cadastre o primeiro cliente para gerar seu link de acesso.</p>
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="empty-state">
                <Search size={38} aria-hidden="true" />
                <h3>Nenhum resultado</h3>
                <p>Tente buscar pelo nome, link, e-mail ou telefone.</p>
              </div>
            ) : (
              <div className="clients-list">
                {visibleItems.map((item) => (
                  <article key={item.id} className="client-card">
                    <div className="client-main">
                      <span className="client-logo"><Crown size={29} aria-hidden="true" /></span>
                      <div className="client-identity">
                        <div className="client-title-line">
                          <h3>{item.nome}</h3>
                        </div>
                        <a href={establishmentLoginUrl(operationalBase, item.slug)} target="_blank" rel="noreferrer" className="client-slug">
                          {item.slug}<ExternalLink size={13} aria-hidden="true" />
                        </a>
                        <div className="readiness-list">
                          <span className={item.bancoPronto ? "ready" : "waiting"}>{item.bancoPronto ? "Banco pronto" : "Banco pendente"}</span>
                          <span className="ready">Link pronto</span>
                          <span className={item.donoPronto ? "ready" : "waiting"}>{item.donoPronto ? "Dono criado" : "Dono pendente"}</span>
                          <span className={item.impressaoConfigurada ? "protected" : "waiting"}><ShieldCheck size={13} aria-hidden="true" />{item.impressaoConfigurada ? "Impressão protegida" : "Impressão pendente"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="billing-summary">
                      <span className="billing-icon"><CircleDollarSign size={18} aria-hidden="true" /></span>
                      <div>
                        <small>Mensalidade</small>
                        <strong>{Number(item.assinatura?.valorMensal ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                      </div>
                    </div>

                    <div className="client-status">
                      <small>Situação</small>
                      <StatusSelect
                        name={item.nome}
                        value={item.status}
                        canActivate={item.bancoPronto && item.donoPronto}
                        onChange={(status) => void changeStatus(item, status)}
                      />
                    </div>

                    <div className="client-actions">
                      <button type="button" onClick={() => router.push(`/estabelecimentos/${encodeURIComponent(item.id)}/configuracoes`)}>
                        <Pencil size={20} aria-hidden="true" /><span>Editar</span>
                      </button>
                      <button type="button" onClick={() => { setBrandingFor((current) => current?.id === item.id ? null : item); setModulesFor(null); setBillingFor(null); setOwnerFor(null); }}>
                        <Palette size={20} aria-hidden="true" /><span>Personalizar</span>
                      </button>
                      <button type="button" onClick={() => { setModulesFor((current) => current?.id === item.id ? null : item); setBrandingFor(null); setBillingFor(null); setOwnerFor(null); }}>
                        <Blocks size={20} aria-hidden="true" /><span>Módulos</span>
                      </button>
                      <button type="button" onClick={() => void provisionDatabase(item)} disabled={provisioning === item.id} title="Aplicar atualizações no banco">
                        {provisioning === item.id ? <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> : <Database size={20} aria-hidden="true" />}
                        <span>{item.bancoPronto ? "Atualizar banco" : "Preparar banco"}</span>
                      </button>
                      <button type="button" onClick={() => { setBillingFor((current) => current?.id === item.id ? null : item); setModulesFor(null); }}>
                        <CircleDollarSign size={20} aria-hidden="true" /><span>Mensalidade</span>
                      </button>
                      <button type="button" onClick={() => void generatePrinterToken(item)}>
                        <ShieldCheck size={20} aria-hidden="true" /><span>Token impressão</span>
                      </button>
                      <button type="button" onClick={() => void generateInstallationCode(item)} title={establishmentInstallationUrl(operationalBase, item.slug)}>
                        <MonitorCheck size={20} aria-hidden="true" /><span>Gerar ativação</span>
                      </button>
                      <button type="button" className="access-button" onClick={() => { setOwnerFor((current) => current?.id === item.id ? null : item); setModulesFor(null); setOwnerMode("create"); }}>
                        <KeyRound size={19} aria-hidden="true" /><span>Dono e senha</span><ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </div>

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
                      <form onSubmit={updateSubscription} className="inline-form inline-form--two-columns">
                        <Field name="valorMensal" label="Mensalidade" type="number" defaultValue={String(item.assinatura?.valorMensal ?? 0)} required />
                        <Field name="proximoVencimento" label="Próximo vencimento" type="date" defaultValue={item.assinatura?.proximoVencimento?.slice(0, 10) || ""} />
                        <FormActions saving={saving} onCancel={() => setBillingFor(null)} label="Salvar mensalidade" />
                      </form>
                    )}

                    {ownerFor?.id === item.id && (
                      <div className="inline-form">
                        <div className="mode-tabs" role="tablist" aria-label="Tipo de acesso do dono">
                          <button type="button" role="tab" aria-selected={ownerMode === "create"} onClick={() => setOwnerMode("create")} className={ownerMode === "create" ? "active" : ""}>Criar dono</button>
                          <button type="button" role="tab" aria-selected={ownerMode === "reset"} onClick={() => setOwnerMode("reset")} className={ownerMode === "reset" ? "active" : ""}>Redefinir senha</button>
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
                          <form onSubmit={resetOwnerPassword} className="form-grid form-grid--compact">
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
    </div>
  );
}
