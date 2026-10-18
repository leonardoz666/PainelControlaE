"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle, PackageOpen, Save } from "lucide-react";
import { api } from "@/app/lib/api";

type ModuleDefinition = {
  chave: string;
  nome: string;
  descricao: string;
  grupo: string;
  fase: number;
  dependencias?: string[];
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

  const modulesByGroup = useMemo(() => {
    const groups = new Map<string, ModuleDefinition[]>();
    for (const module of catalog) {
      const current = groups.get(module.grupo) ?? [];
      current.push(module);
      groups.set(module.grupo, current);
    }
    return [...groups.entries()];
  }, [catalog]);

  function toggle(key: string) {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
        let changed = true;
        while (changed) {
          changed = false;
          for (const module of catalog) {
            if (module.dependencias?.some(dependency => dependency === key || !next.has(dependency))) {
              changed = next.delete(module.chave) || changed;
            }
          }
        }
      } else {
        next.add(key);
        const pending = [...(catalog.find(module => module.chave === key)?.dependencias ?? [])];
        while (pending.length > 0) {
          const dependency = pending.shift()!;
          if (next.has(dependency)) continue;
          next.add(dependency);
          pending.push(...(catalog.find(module => module.chave === dependency)?.dependencias ?? []));
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
        <div className="module-loading" role="status"><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Carregando catálogo…</div>
      ) : catalog.length === 0 && !error ? (
        <div className="module-loading"><PackageOpen size={18} aria-hidden="true" /> Nenhum módulo cadastrado.</div>
      ) : (
        <div className="module-groups">
          {modulesByGroup.map(([group, modules]) => (
            <section key={group} className="module-group" aria-labelledby={`module-group-${group}`}>
              <h5 id={`module-group-${group}`}>{group}</h5>
              <div className="module-grid">
                {modules.map(module => {
                  const enabled = selected.has(module.chave);
                  const dependencies = module.dependencias?.map(dependency => nameByKey.get(dependency) ?? dependency) ?? [];
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
                        <span>{module.descricao}</span>
                        {dependencies.length > 0 && <em>Requer {dependencies.join(", ")}</em>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {error && <p className="module-error" role="alert">{error}</p>}
      {!loading && catalog.length > 0 && (
        <div className="module-bulk-actions" aria-label="Ações para todos os módulos">
          <button type="button" className="text-button" onClick={() => setSelected(new Set(catalog.map(module => module.chave)))}>Ativar todos</button>
          <button type="button" className="text-button" onClick={() => setSelected(new Set())}>Desativar todos</button>
        </div>
      )}
      <div className="module-actions">
        <span>{selected.size} de {catalog.length} módulos selecionados</span>
        <button type="button" className="primary-button" onClick={() => void save()} disabled={loading || saving}>
          {saving ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
          Salvar módulos
        </button>
      </div>
    </section>
  );
}
