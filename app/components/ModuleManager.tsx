"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle, PackageOpen, Save } from "lucide-react";
import { api } from "@/app/lib/api";

type ModuleDefinition = {
  chave: string;
  nome: string;
  descricao: string;
  fase: number;
  dependencia?: string;
};

type ModuleManagerProps = {
  establishment: {
    id: string;
    nome: string;
    modulosAtivos: string[];
  };
  onClose: () => void;
  onSaved: (modules: string[]) => void;
};

export function ModuleManager({ establishment, onClose, onSaved }: ModuleManagerProps) {
  const [catalog, setCatalog] = useState<ModuleDefinition[]>([]);
  const [selected, setSelected] = useState(() => new Set(establishment.modulosAtivos ?? []));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api<{ data: ModuleDefinition[] }>("/modulos")
      .then(response => {
        if (active) setCatalog(response.data);
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar os módulos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const nameByKey = useMemo(
    () => new Map(catalog.map(module => [module.chave, module.nome])),
    [catalog],
  );

  function toggle(key: string) {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
        let changed = true;
        while (changed) {
          changed = false;
          for (const module of catalog) {
            if (module.dependencia === key || (module.dependencia && !next.has(module.dependencia))) {
              changed = next.delete(module.chave) || changed;
            }
          }
        }
      } else {
        next.add(key);
        let dependency = catalog.find(module => module.chave === key)?.dependencia;
        while (dependency) {
          next.add(dependency);
          dependency = catalog.find(module => module.chave === dependency)?.dependencia;
        }
      }
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await api<{ modulosAtivos: string[] }>(`/estabelecimentos/${establishment.id}/modulos`, {
        method: "PATCH",
        body: JSON.stringify({ modulosAtivos: [...selected] }),
      });
      setSelected(new Set(response.modulosAtivos));
      onSaved(response.modulosAtivos);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar os módulos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="inline-form module-manager" aria-label={`Módulos de ${establishment.nome}`}>
      <div className="inline-form-heading">
        <div>
          <h4>Módulos de {establishment.nome}</h4>
          <p>Ative somente as capacidades contratadas. Dependências são habilitadas automaticamente ao salvar.</p>
        </div>
        <button type="button" onClick={onClose} className="text-button">Fechar</button>
      </div>

      {loading ? (
        <div className="module-loading" role="status"><LoaderCircle size={18} className="animate-spin" /> Carregando catálogo…</div>
      ) : catalog.length === 0 && !error ? (
        <div className="module-loading"><PackageOpen size={18} /> Nenhum módulo cadastrado.</div>
      ) : (
        <div className="module-grid">
          {catalog.map(module => {
            const enabled = selected.has(module.chave);
            return (
              <button
                type="button"
                key={module.chave}
                className={`module-option${enabled ? " active" : ""}`}
                aria-pressed={enabled}
                onClick={() => toggle(module.chave)}
              >
                <span className="module-check" aria-hidden="true">{enabled && <Check size={15} />}</span>
                <span className="module-copy">
                  <strong>{module.nome}</strong>
                  <small>Fase {module.fase}</small>
                  <span>{module.descricao}</span>
                  {module.dependencia && <em>Requer {nameByKey.get(module.dependencia) ?? module.dependencia}</em>}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="module-error" role="alert">{error}</p>}
      <div className="module-actions">
        <span>{selected.size} de {catalog.length} módulos selecionados</span>
        <button type="button" className="primary-button" onClick={() => void save()} disabled={loading || saving}>
          {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
          Salvar módulos
        </button>
      </div>
    </section>
  );
}
