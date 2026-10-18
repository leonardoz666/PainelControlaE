"use client";
/* eslint-disable @next/next/no-img-element -- a logo é otimizada e armazenada como data URL */

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ImagePlus, LoaderCircle, Monitor, MonitorCog, Palette, RotateCcw, Save, Smartphone, Trash2 } from "lucide-react";
import { api } from "@/app/lib/api";

type Branding = {
  nome: string;
  nomeExibicao: string;
  slogan: string;
  logoUrl: string;
  logoCompactaUrl: string;
  faviconUrl: string;
  imagemLoginUrl: string;
  imagemLoginPosicao: "ESQUERDA" | "CENTRO" | "DIREITA";
  corPrimaria: string;
  corSecundaria: string;
  corDestaque: string;
  corNavegacao: string;
  fonteInterface: "MODERNA" | "SISTEMA" | "CLASSICA";
  temaPadrao: "CLARO" | "ESCURO" | "SISTEMA";
};

type ImageField = "logoUrl" | "logoCompactaUrl" | "faviconUrl" | "imagemLoginUrl";

const DEFAULT_COLORS = {
  corPrimaria: "#ea580c",
  corSecundaria: "#0f172a",
  corDestaque: "#f97316",
  corNavegacao: "#e9f0f7",
};

const PRESETS = [
  { nome: "Laranja da casa", primaria: "#ea580c", secundaria: "#0f172a", destaque: "#f97316", navegacao: "#e9f0f7" },
  { nome: "Verde cozinha", primaria: "#15803d", secundaria: "#14261b", destaque: "#f59e0b", navegacao: "#e8f1eb" },
  { nome: "Azul contemporâneo", primaria: "#2563eb", secundaria: "#172554", destaque: "#f59e0b", navegacao: "#e8eef8" },
  { nome: "Vinho clássico", primaria: "#9f1239", secundaria: "#27131a", destaque: "#d97706", navegacao: "#f3e9ec" },
];

const LOGIN_IMAGE_POSITIONS: Record<Branding["imagemLoginPosicao"], string> = {
  ESQUERDA: "left center",
  CENTRO: "center",
  DIREITA: "right center",
};

function readableTextColor(hex: string): "#ffffff" | "#0f172a" {
  const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : DEFAULT_COLORS.corPrimaria;
  const channels = [1, 3, 5].map((offset) => Number.parseInt(safe.slice(offset, offset + 2), 16) / 255);
  const luminance = channels
    .map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
  return 1.05 / (luminance + 0.05) >= 4.5 ? "#ffffff" : "#0f172a";
}

function relativeLuminance(hex: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return 0;
  return [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(first: string, second: string): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

const IMAGE_RULES: Record<ImageField, { width: number; height: number; maxLength: number; format: "image/png" | "image/webp"; quality?: number }> = {
  logoUrl: { width: 520, height: 240, maxLength: 68_000, format: "image/webp", quality: .82 },
  logoCompactaUrl: { width: 192, height: 192, maxLength: 52_000, format: "image/webp", quality: .84 },
  faviconUrl: { width: 64, height: 64, maxLength: 28_000, format: "image/png" },
  imagemLoginUrl: { width: 1400, height: 900, maxLength: 170_000, format: "image/webp", quality: .78 },
};

function processImage(file: File, field: ImageField): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return Promise.reject(new Error("Escolha uma imagem PNG, JPEG ou WebP."));
  }
  if (file.size > 4_000_000) return Promise.reject(new Error("A imagem original deve ter no máximo 4 MB."));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("O arquivo de imagem é inválido."));
      image.onload = () => {
        const rule = IMAGE_RULES[field];
        const scale = Math.min(1, rule.width / image.width, rule.height / image.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("O navegador não conseguiu preparar a logo."));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const encoded = canvas.toDataURL(rule.format, rule.quality);
        if (encoded.length > rule.maxLength) return reject(new Error("A imagem continua muito pesada. Use uma imagem mais simples ou menor."));
        resolve(encoded);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function ImageAsset({
  title,
  description,
  value,
  loading,
  wide = false,
  onSelect,
  onRemove,
}: {
  title: string;
  description: string;
  value: string;
  loading: boolean;
  wide?: boolean;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className={`brand-asset${wide ? " brand-asset--wide" : ""}`}>
      <div className="brand-asset-preview">
        {value ? <img src={value} alt={`Prévia: ${title}`} width={wide ? 640 : 160} height={wide ? 360 : 160} className={`brand-asset-image${wide ? " brand-asset-image--cover" : ""}`} /> : <ImagePlus size={24} aria-hidden="true" />}
      </div>
      <div className="brand-asset-copy">
        <strong>{title}</strong>
        <p>{description}</p>
        <div className="brand-asset-actions">
          <label className="brand-upload-button">
            <ImagePlus size={16} aria-hidden="true" />{loading ? "Preparando…" : value ? "Trocar" : "Escolher"}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onSelect} disabled={loading} className="sr-only" />
          </label>
          {value && <button type="button" onClick={onRemove} className="brand-remove-button"><Trash2 size={16} aria-hidden="true" />Remover</button>}
        </div>
      </div>
    </div>
  );
}

export function BrandingEditor({
  establishment,
  onClose,
  onSaved,
}: {
  establishment: { id: string; nome: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState<ImageField | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"DESKTOP" | "MOBILE">("DESKTOP");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void api<{ estabelecimento: Branding }>(`/estabelecimentos/${establishment.id}/branding`)
      .then((response) => {
        if (active) setForm({ ...response.estabelecimento, imagemLoginPosicao: response.estabelecimento.imagemLoginPosicao || "CENTRO" });
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Falha ao carregar a identidade visual"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [establishment.id]);

  function update<K extends keyof Branding>(field: K, value: Branding[K]) {
    setForm((current) => current ? { ...current, [field]: value } : current);
  }

  async function selectImage(field: ImageField, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageLoading(field);
    setError("");
    try {
      update(field, await processImage(file, field));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível preparar a logo");
    } finally {
      setImageLoading(null);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const response = await api<{ estabelecimento: Branding }>(`/estabelecimentos/${establishment.id}/branding`, {
        method: "PATCH",
        body: JSON.stringify({
          nomeExibicao: form.nomeExibicao,
          slogan: form.slogan,
          logoUrl: form.logoUrl,
          logoCompactaUrl: form.logoCompactaUrl,
          faviconUrl: form.faviconUrl,
          imagemLoginUrl: form.imagemLoginUrl,
          imagemLoginPosicao: form.imagemLoginPosicao,
          corPrimaria: form.corPrimaria,
          corSecundaria: form.corSecundaria,
          corDestaque: form.corDestaque,
          corNavegacao: form.corNavegacao,
          fonteInterface: form.fonteInterface,
          temaPadrao: form.temaPadrao,
        }),
      });
      setForm(response.estabelecimento);
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar a personalização");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="inline-form branding-state" role="status"><LoaderCircle className="animate-spin" aria-hidden="true" /><span>Carregando personalização…</span></div>;
  }

  if (!form) {
    return <div className="inline-form branding-state branding-state--error"><p>{error || "Não foi possível abrir a personalização."}</p><button type="button" onClick={onClose} className="secondary-button">Fechar</button></div>;
  }

  const previewFont = form.fonteInterface === "CLASSICA"
    ? "Georgia, 'Times New Roman', serif"
    : form.fonteInterface === "SISTEMA"
      ? "'Segoe UI', Arial, sans-serif"
      : "'Manrope Variable', 'Segoe UI', sans-serif";
  const darkPreview = form.temaPadrao === "ESCURO";
  const navigationLogo = form.logoCompactaUrl || form.logoUrl;
  const contrastChecks = [
    { label: "Texto institucional sobre fundo claro", ratio: contrastRatio(form.corSecundaria, "#ffffff") },
    { label: "Texto da barra lateral", ratio: contrastRatio(readableTextColor(form.corNavegacao), form.corNavegacao) },
    { label: "Texto de ações principais", ratio: contrastRatio(readableTextColor(form.corPrimaria), form.corPrimaria) },
    { label: "Texto de destaque", ratio: contrastRatio(readableTextColor(form.corDestaque), form.corDestaque) },
  ];
  const contrastWarnings = contrastChecks.filter((check) => check.ratio < 4.5);

  return (
    <form onSubmit={save} className="inline-form branding-editor">
      <div className="inline-form-heading">
        <div>
          <h4>Personalizar {establishment.nome}</h4>
          <p>Somente o Painel CEO pode alterar a identidade exibida no sistema deste estabelecimento.</p>
        </div>
        <button type="button" onClick={onClose} className="text-button">Fechar</button>
      </div>

      {error && <div role="alert" className="branding-error">{error}</div>}

      <div className="branding-layout">
        <div className="branding-fields">
          <div className="branding-field-row">
            <label className="field">
              <span>Nome exibido</span>
              <input name="nomeExibicao" value={form.nomeExibicao} onChange={(event) => update("nomeExibicao", event.target.value)} maxLength={80} required />
            </label>
            <label className="field">
              <span>Mensagem de entrada</span>
              <input name="slogan" value={form.slogan} onChange={(event) => update("slogan", event.target.value)} maxLength={140} placeholder="Ex.: Atendimento rápido, gestão completa." />
            </label>
          </div>

          <section className="branding-section">
            <div className="branding-section-title"><ImagePlus size={18} aria-hidden="true" /><h5>Arquivos da marca</h5></div>
            <div className="branding-asset-grid">
              <ImageAsset title="Logo principal" description="Usada no login e em áreas amplas. PNG, JPEG ou WebP." value={form.logoUrl} loading={imageLoading === "logoUrl"} onSelect={(event) => void selectImage("logoUrl", event)} onRemove={() => update("logoUrl", "")} />
              <ImageAsset title="Logo compacta" description="Versão quadrada para menu recolhido e cabeçalhos." value={form.logoCompactaUrl} loading={imageLoading === "logoCompactaUrl"} onSelect={(event) => void selectImage("logoCompactaUrl", event)} onRemove={() => update("logoCompactaUrl", "")} />
              <ImageAsset title="Favicon" description="Ícone exibido na aba do navegador. Prefira uma marca simples." value={form.faviconUrl} loading={imageLoading === "faviconUrl"} onSelect={(event) => void selectImage("faviconUrl", event)} onRemove={() => update("faviconUrl", "")} />
              <ImageAsset title="Imagem do login" description="Capa horizontal da entrada do sistema, otimizada automaticamente." value={form.imagemLoginUrl} loading={imageLoading === "imagemLoginUrl"} wide onSelect={(event) => void selectImage("imagemLoginUrl", event)} onRemove={() => update("imagemLoginUrl", "")} />
            </div>
          </section>

          <section className="branding-section">
            <div className="branding-section-title"><Palette size={18} aria-hidden="true" /><h5>Cores da identidade</h5></div>
            <div className="branding-color-grid">
              {([['corPrimaria', 'Principal'], ['corSecundaria', 'Institucional'], ['corDestaque', 'Destaque'], ['corNavegacao', 'Barra lateral']] as const).map(([field, label]) => (
                <label key={field} className="branding-color-field">
                  {label}
                  <span className="branding-color-controls">
                    <input type="color" name={field} value={form[field]} onChange={(event) => update(field, event.target.value)} className="branding-color-swatch" aria-label={`Cor ${label.toLowerCase()}`} />
                    <input name={`${field}-hex`} value={form[field]} onChange={(event) => update(field, event.target.value)} pattern="#[0-9a-fA-F]{6}" maxLength={7} className="branding-color-code" aria-label={`Cor ${label.toLowerCase()} hexadecimal`} spellCheck={false} autoComplete="off" />
                  </span>
                </label>
              ))}
            </div>
            <div className="branding-presets">
              {PRESETS.map((preset) => <button key={preset.nome} type="button" onClick={() => setForm((current) => current ? { ...current, corPrimaria: preset.primaria, corSecundaria: preset.secundaria, corDestaque: preset.destaque, corNavegacao: preset.navegacao } : current)} className="branding-preset"><span className="branding-preset-swatches" aria-hidden="true">{[preset.primaria, preset.secundaria, preset.destaque, preset.navegacao].map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span>{preset.nome}</button>)}
            </div>
            <div className={`branding-contrast${contrastWarnings.length > 0 ? " branding-contrast--warning" : " branding-contrast--ok"}`} role="status" aria-live="polite">
              {contrastWarnings.length > 0 ? <AlertTriangle size={17} aria-hidden="true" /> : <CheckCircle2 size={17} aria-hidden="true" />}
              <div>
                <strong>{contrastWarnings.length > 0 ? "Revise o contraste" : "Contraste aprovado"}</strong>
                <span>{contrastWarnings.length > 0
                  ? contrastWarnings.map((check) => `${check.label} (${check.ratio.toFixed(1)}:1)`).join(" · ")
                  : "As combinações de texto alcançam o mínimo de 4,5:1."}</span>
              </div>
            </div>
          </section>

          <section className="branding-section">
            <div className="branding-section-title"><MonitorCog size={18} aria-hidden="true" /><h5>Estilo da interface</h5></div>
            <div className="branding-field-row">
              <label className="field">
                <span>Tipografia</span>
                <select name="fonteInterface" value={form.fonteInterface} onChange={(event) => update("fonteInterface", event.target.value as Branding["fonteInterface"])}>
                  <option value="MODERNA">Moderna — Manrope/Geist</option>
                  <option value="SISTEMA">Sistema — Segoe UI</option>
                  <option value="CLASSICA">Clássica — Georgia</option>
                </select>
              </label>
              <label className="field">
                <span>Tema inicial</span>
                <select name="temaPadrao" value={form.temaPadrao} onChange={(event) => update("temaPadrao", event.target.value as Branding["temaPadrao"])}>
                  <option value="SISTEMA">Acompanhar aparelho</option>
                  <option value="CLARO">Sempre claro</option>
                  <option value="ESCURO">Sempre escuro</option>
                </select>
              </label>
            </div>
            <fieldset className="branding-position-field">
              <legend>Posição da imagem de login</legend>
              <div className="branding-position-options">
                {([['ESQUERDA', 'Esquerda'], ['CENTRO', 'Centro'], ['DIREITA', 'Direita']] as const).map(([value, label]) => (
                  <label key={value} className={form.imagemLoginPosicao === value ? "active" : ""}>
                    <input type="radio" name="imagemLoginPosicao" value={value} checked={form.imagemLoginPosicao === value} onChange={() => update("imagemLoginPosicao", value)} />
                    {label}
                  </label>
                ))}
              </div>
              <p>A posição define qual parte da foto permanece visível em telas largas.</p>
            </fieldset>
            <p className="branding-note">O tema define a primeira abertura. Depois, cada usuário ainda pode escolher claro ou escuro no próprio aparelho.</p>
          </section>
        </div>

        <aside className={`branding-preview branding-preview--${previewDevice.toLowerCase()}`} style={{ fontFamily: previewFont }}>
          <div className="branding-preview-toolbar">
            <strong>Prévia</strong>
            <div role="group" aria-label="Dispositivo da prévia">
              <button type="button" className={previewDevice === "DESKTOP" ? "active" : ""} aria-pressed={previewDevice === "DESKTOP"} onClick={() => setPreviewDevice("DESKTOP")}><Monitor size={15} aria-hidden="true" />Computador</button>
              <button type="button" className={previewDevice === "MOBILE" ? "active" : ""} aria-pressed={previewDevice === "MOBILE"} onClick={() => setPreviewDevice("MOBILE")}><Smartphone size={15} aria-hidden="true" />Celular</button>
            </div>
          </div>
          <div className="brand-preview-card">
          <div className="brand-preview-hero" style={{ backgroundColor: form.corPrimaria, color: readableTextColor(form.corPrimaria) }}>
            <div className="brand-preview-identity">
              <div className="brand-preview-logo">{navigationLogo ? <img src={navigationLogo} alt="" width={48} height={48} /> : <strong>{form.nomeExibicao.charAt(0).toUpperCase() || "R"}</strong>}</div>
              <strong>{form.nomeExibicao || establishment.nome}</strong>
            </div>
            <p className="brand-preview-slogan">{form.slogan || "Sua mensagem aparece aqui."}</p>
          </div>
          <div className="brand-preview-content" style={{ backgroundColor: darkPreview ? "#111c2e" : "#ffffff", color: darkPreview ? "#f8fafc" : form.corSecundaria }}>
            <p>Prévia do sistema</p>
            <div className="brand-preview-navigation" style={{ backgroundColor: form.corNavegacao }}><span style={{ backgroundColor: form.corDestaque, color: readableTextColor(form.corDestaque) }}>Início</span><span>Atendimento</span><span>Financeiro</span></div>
            <div className="brand-preview-table"><div><strong>Mesa 08</strong><small>Em atendimento</small></div><span style={{ backgroundColor: form.corPrimaria, color: readableTextColor(form.corPrimaria) }}>Abrir mesa</span></div>
            <div className="brand-preview-accent" style={{ backgroundColor: form.corDestaque }} />
          </div>
          </div>

          <div className="brand-login-preview" style={{ backgroundColor: form.corPrimaria, backgroundImage: form.imagemLoginUrl ? `url(${form.imagemLoginUrl})` : undefined, backgroundPosition: LOGIN_IMAGE_POSITIONS[form.imagemLoginPosicao] || "center", backgroundSize: "cover" }}>
            <div className="brand-login-overlay" />
            <div className="brand-login-content">
              <div>
                <div className="brand-login-logo">{form.logoUrl ? <img src={form.logoUrl} alt="" width={96} height={64} /> : <strong>{form.nomeExibicao.charAt(0).toUpperCase() || "R"}</strong>}</div>
                <strong className="brand-login-name">{form.nomeExibicao || establishment.nome}</strong>
                <span className="brand-login-slogan">{form.slogan || "Sua mensagem aparece aqui."}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="branding-footer">
        <button type="button" onClick={() => setForm({ ...form, nomeExibicao: form.nome, slogan: "Operação, atendimento e gestão em um só lugar.", logoUrl: "", logoCompactaUrl: "", faviconUrl: "", imagemLoginUrl: "", imagemLoginPosicao: "CENTRO", fonteInterface: "MODERNA", temaPadrao: "SISTEMA", ...DEFAULT_COLORS })} disabled={saving} className="secondary-button"><RotateCcw size={16} aria-hidden="true" />Restaurar padrão</button>
        <button type="submit" disabled={saving || Boolean(imageLoading)} className="primary-button"><Save size={17} aria-hidden="true" />{saving ? "Salvando…" : "Salvar personalização"}</button>
      </div>
    </form>
  );
}
