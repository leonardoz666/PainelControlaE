"use client";
/* eslint-disable @next/next/no-img-element -- a logo é otimizada e armazenada como data URL */

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ImagePlus, LoaderCircle, MonitorCog, Palette, RotateCcw, Save, Trash2 } from "lucide-react";
import { api } from "@/app/lib/api";

type Branding = {
  nome: string;
  nomeExibicao: string;
  slogan: string;
  logoUrl: string;
  logoCompactaUrl: string;
  faviconUrl: string;
  imagemLoginUrl: string;
  corPrimaria: string;
  corSecundaria: string;
  corDestaque: string;
  fonteInterface: "MODERNA" | "SISTEMA" | "CLASSICA";
  temaPadrao: "CLARO" | "ESCURO" | "SISTEMA";
};

type ImageField = "logoUrl" | "logoCompactaUrl" | "faviconUrl" | "imagemLoginUrl";

const DEFAULT_COLORS = {
  corPrimaria: "#ea580c",
  corSecundaria: "#0f172a",
  corDestaque: "#f97316",
};

const PRESETS = [
  { nome: "Laranja da casa", primaria: "#ea580c", secundaria: "#0f172a", destaque: "#f97316" },
  { nome: "Verde cozinha", primaria: "#15803d", secundaria: "#14261b", destaque: "#f59e0b" },
  { nome: "Azul contemporâneo", primaria: "#2563eb", secundaria: "#172554", destaque: "#f59e0b" },
  { nome: "Vinho clássico", primaria: "#9f1239", secundaria: "#27131a", destaque: "#d97706" },
];

function readableTextColor(hex: string): "#ffffff" | "#0f172a" {
  const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : DEFAULT_COLORS.corPrimaria;
  const channels = [1, 3, 5].map((offset) => Number.parseInt(safe.slice(offset, offset + 2), 16) / 255);
  const luminance = channels
    .map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
  return 1.05 / (luminance + 0.05) >= 4.5 ? "#ffffff" : "#0f172a";
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
    <div className="flex min-w-0 flex-col gap-3 rounded-xl bg-violet-50/70 p-4 sm:flex-row sm:items-center">
      <div className={`${wide ? "aspect-[16/9] w-full sm:w-40" : "h-20 w-20"} grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-2 shadow-[0_6px_18px_rgba(45,27,102,0.09)]`}>
        {value ? <img src={value} alt={`Prévia: ${title}`} width={wide ? 640 : 160} height={wide ? 360 : 160} className={`h-full w-full ${wide ? "object-cover" : "object-contain"}`} /> : <ImagePlus size={24} className="text-violet-300" aria-hidden />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-extrabold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-3.5 text-sm font-bold text-white hover:bg-slate-700 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-violet-700">
            <ImagePlus size={16} />{loading ? "Preparando…" : value ? "Trocar" : "Escolher"}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onSelect} disabled={loading} className="sr-only" />
          </label>
          {value && <button type="button" onClick={onRemove} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-red-700 hover:bg-red-50"><Trash2 size={16} />Remover</button>}
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
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void api<{ estabelecimento: Branding }>(`/estabelecimentos/${establishment.id}/branding`)
      .then((response) => { if (active) setForm(response.estabelecimento); })
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
          corPrimaria: form.corPrimaria,
          corSecundaria: form.corSecundaria,
          corDestaque: form.corDestaque,
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
    return <div className="inline-form min-h-40 place-items-center" role="status"><LoaderCircle className="animate-spin text-violet-700" /><span className="sr-only">Carregando personalização</span></div>;
  }

  if (!form) {
    return <div className="inline-form"><p className="m-0 text-sm font-semibold text-red-700">{error || "Não foi possível abrir a personalização."}</p><button type="button" onClick={onClose} className="secondary-button justify-self-start">Fechar</button></div>;
  }

  const previewFont = form.fonteInterface === "CLASSICA"
    ? "Georgia, 'Times New Roman', serif"
    : form.fonteInterface === "SISTEMA"
      ? "'Segoe UI', Arial, sans-serif"
      : "'Manrope Variable', 'Segoe UI', sans-serif";
  const darkPreview = form.temaPadrao === "ESCURO";
  const navigationLogo = form.logoCompactaUrl || form.logoUrl;

  return (
    <form onSubmit={save} className="inline-form branding-editor">
      <div className="inline-form-heading">
        <div>
          <h4>Personalizar {establishment.nome}</h4>
          <p>Somente o Painel CEO pode alterar a identidade exibida no sistema deste estabelecimento.</p>
        </div>
        <button type="button" onClick={onClose} className="text-button">Fechar</button>
      </div>

      {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="field">
              <span>Nome exibido</span>
              <input value={form.nomeExibicao} onChange={(event) => update("nomeExibicao", event.target.value)} maxLength={80} required />
            </label>
            <label className="field">
              <span>Mensagem de entrada</span>
              <input value={form.slogan} onChange={(event) => update("slogan", event.target.value)} maxLength={140} placeholder="Ex.: Atendimento rápido, gestão completa." />
            </label>
          </div>

          <section>
            <div className="mb-3 flex items-center gap-2"><ImagePlus size={18} className="text-violet-700" /><h5 className="m-0 text-sm font-extrabold text-slate-900">Arquivos da marca</h5></div>
            <div className="grid gap-3 lg:grid-cols-2">
              <ImageAsset title="Logo principal" description="Usada no login e em áreas amplas. PNG, JPEG ou WebP." value={form.logoUrl} loading={imageLoading === "logoUrl"} onSelect={(event) => void selectImage("logoUrl", event)} onRemove={() => update("logoUrl", "")} />
              <ImageAsset title="Logo compacta" description="Versão quadrada para menu recolhido e cabeçalhos." value={form.logoCompactaUrl} loading={imageLoading === "logoCompactaUrl"} onSelect={(event) => void selectImage("logoCompactaUrl", event)} onRemove={() => update("logoCompactaUrl", "")} />
              <ImageAsset title="Favicon" description="Ícone exibido na aba do navegador. Prefira uma marca simples." value={form.faviconUrl} loading={imageLoading === "faviconUrl"} onSelect={(event) => void selectImage("faviconUrl", event)} onRemove={() => update("faviconUrl", "")} />
              <ImageAsset title="Imagem do login" description="Capa horizontal da entrada do sistema, otimizada automaticamente." value={form.imagemLoginUrl} loading={imageLoading === "imagemLoginUrl"} wide onSelect={(event) => void selectImage("imagemLoginUrl", event)} onRemove={() => update("imagemLoginUrl", "")} />
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2"><Palette size={18} className="text-violet-700" /><h5 className="m-0 text-sm font-extrabold text-slate-900">Cores da identidade</h5></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {([['corPrimaria', 'Principal'], ['corSecundaria', 'Institucional'], ['corDestaque', 'Destaque']] as const).map(([field, label]) => (
                <label key={field} className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700">
                  {label}
                  <span className="mt-2 flex items-center gap-2">
                    <input type="color" value={form[field]} onChange={(event) => update(field, event.target.value)} className="h-10 w-11 cursor-pointer rounded-lg border border-slate-300 bg-white p-1" aria-label={`Cor ${label.toLowerCase()}`} />
                    <input value={form[field]} onChange={(event) => update(field, event.target.value)} pattern="#[0-9a-fA-F]{6}" maxLength={7} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 font-mono text-xs font-bold uppercase" aria-label={`Cor ${label.toLowerCase()} hexadecimal`} />
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((preset) => <button key={preset.nome} type="button" onClick={() => setForm((current) => current ? { ...current, corPrimaria: preset.primaria, corSecundaria: preset.secundaria, corDestaque: preset.destaque } : current)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-violet-300 hover:bg-violet-50"><span className="flex">{[preset.primaria, preset.secundaria, preset.destaque].map((color) => <i key={color} className="-ml-1 h-5 w-5 first:ml-0 rounded-full border-2 border-white" style={{ backgroundColor: color }} />)}</span>{preset.nome}</button>)}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2"><MonitorCog size={18} className="text-violet-700" /><h5 className="m-0 text-sm font-extrabold text-slate-900">Estilo da interface</h5></div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field">
                <span>Tipografia</span>
                <select value={form.fonteInterface} onChange={(event) => update("fonteInterface", event.target.value as Branding["fonteInterface"])}>
                  <option value="MODERNA">Moderna — Manrope/Geist</option>
                  <option value="SISTEMA">Sistema — Segoe UI</option>
                  <option value="CLASSICA">Clássica — Georgia</option>
                </select>
              </label>
              <label className="field">
                <span>Tema inicial</span>
                <select value={form.temaPadrao} onChange={(event) => update("temaPadrao", event.target.value as Branding["temaPadrao"])}>
                  <option value="SISTEMA">Acompanhar aparelho</option>
                  <option value="CLARO">Sempre claro</option>
                  <option value="ESCURO">Sempre escuro</option>
                </select>
              </label>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">O tema define a primeira abertura. Depois, cada usuário ainda pode escolher claro ou escuro no próprio aparelho.</p>
          </section>
        </div>

        <aside className="grid content-start gap-4" style={{ fontFamily: previewFont }}>
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_12px_30px_rgba(36,19,93,0.12)]">
          <div className="flex min-h-48 flex-col justify-between p-5" style={{ backgroundColor: form.corPrimaria, color: readableTextColor(form.corPrimaria) }}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-white/15 p-2">{navigationLogo ? <img src={navigationLogo} alt="" width={48} height={48} className="h-full w-full object-contain" /> : <strong className="text-xl">{form.nomeExibicao.charAt(0).toUpperCase() || "R"}</strong>}</div>
              <strong>{form.nomeExibicao || establishment.nome}</strong>
            </div>
            <p className="m-0 text-2xl font-extrabold leading-tight tracking-[-0.03em]">{form.slogan || "Sua mensagem aparece aqui."}</p>
          </div>
          <div className="p-5" style={{ backgroundColor: darkPreview ? "#111c2e" : "#ffffff", color: darkPreview ? "#f8fafc" : form.corSecundaria }}>
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-slate-500">Prévia do sistema</p>
            <div className="mt-4 flex items-center justify-between gap-3"><div><strong className="block">Mesa 08</strong><small className="text-slate-500">Em atendimento</small></div><span className="rounded-lg px-3 py-2 text-xs font-bold" style={{ backgroundColor: form.corPrimaria, color: readableTextColor(form.corPrimaria) }}>Abrir mesa</span></div>
            <div className="mt-4 h-1.5 rounded-full" style={{ backgroundColor: form.corDestaque }} />
          </div>
          </div>

          <div className="relative min-h-56 overflow-hidden rounded-xl shadow-[0_12px_30px_rgba(36,19,93,0.12)]" style={{ backgroundColor: form.corPrimaria, backgroundImage: form.imagemLoginUrl ? `url(${form.imagemLoginUrl})` : undefined, backgroundPosition: "center", backgroundSize: "cover" }}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 grid min-h-56 place-items-center p-6 text-center text-white">
              <div>
                <div className="mx-auto grid h-16 w-24 place-items-center overflow-hidden rounded-xl bg-white/15 p-2 backdrop-blur-sm">{form.logoUrl ? <img src={form.logoUrl} alt="" width={96} height={64} className="h-full w-full object-contain" /> : <strong className="text-2xl">{form.nomeExibicao.charAt(0).toUpperCase() || "R"}</strong>}</div>
                <strong className="mt-3 block text-xl">{form.nomeExibicao || establishment.nome}</strong>
                <span className="mt-1 block text-xs text-white/80">{form.slogan || "Sua mensagem aparece aqui."}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setForm({ ...form, nomeExibicao: form.nome, slogan: "Operação, atendimento e gestão em um só lugar.", logoUrl: "", logoCompactaUrl: "", faviconUrl: "", imagemLoginUrl: "", fonteInterface: "MODERNA", temaPadrao: "SISTEMA", ...DEFAULT_COLORS })} disabled={saving} className="secondary-button inline-flex items-center justify-center gap-2"><RotateCcw size={16} />Restaurar padrão</button>
        <button disabled={saving || Boolean(imageLoading)} className="primary-button"><Save size={17} />{saving ? "Salvando…" : "Salvar personalização"}</button>
      </div>
    </form>
  );
}
