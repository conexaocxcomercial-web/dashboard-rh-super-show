"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FormularioLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const destino = params.get("destino") || "/visao-geral";

  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (r.ok) {
        router.replace(destino);
        router.refresh();
      } else {
        const corpo = await r.json().catch(() => ({}));
        setErro(corpo?.erro ?? "Não foi possível entrar. Tente novamente.");
        setSenha("");
      }
    } catch {
      setErro("Sem conexão com o servidor. Verifique a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <label className="block">
        <span className="text-[0.72rem] font-medium text-[var(--muted)]">Senha</span>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoFocus
          autoComplete="current-password"
          aria-invalid={!!erro}
          aria-describedby={erro ? "erro-login" : undefined}
          className="mt-1.5 w-full bg-[var(--surface)] text-[var(--ink)] rounded-lg px-3 py-2.5
                     border border-[var(--line)] focus:border-[var(--marca)] outline-none
                     transition-colors text-[0.95rem]"
        />
      </label>

      {erro && (
        <p id="erro-login" role="alert"
           className="text-[0.8rem] text-[var(--magenta)] bg-[var(--tint-magenta)] rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || senha.length === 0}
        className="w-full bg-[var(--marca)] text-white rounded-lg py-2.5 font-semibold text-[0.9rem]
                   hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed transition-opacity"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
