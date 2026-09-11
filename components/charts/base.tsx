"use client";

import { useEffect, useState } from "react";

/** Recharts não lê CSS custom properties, então resolvemos as cores do tema
 *  no cliente e reagimos à troca claro/escuro. */
export function useCoresTema() {
  const [cores, setCores] = useState({
    marca: "#7371ff", lima: "#bef533", magenta: "#ff43c0",
    lavanda: "#dbbfff", ink: "#1e1e1e", muted: "#6b6b73",
    grid: "rgba(30,30,30,0.08)", surface: "#ffffff",
  });

  useEffect(() => {
    const ler = () => {
      const s = getComputedStyle(document.documentElement);
      const v = (n: string) => s.getPropertyValue(n).trim();
      setCores({
        marca: v("--marca"), lima: v("--lima"), magenta: v("--magenta"),
        lavanda: v("--lavanda"), ink: v("--ink"), muted: v("--muted"),
        grid: v("--grid"), surface: v("--surface"),
      });
    };
    ler();
    const obs = new MutationObserver(ler);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return cores;
}

export function estiloTooltip(cores: ReturnType<typeof useCoresTema>) {
  return {
    contentStyle: {
      background: cores.surface,
      border: `1px solid ${cores.grid}`,
      borderRadius: 8,
      fontSize: 12,
      color: cores.ink,
      boxShadow: "none",
    },
    labelStyle: { color: cores.muted, fontSize: 11, marginBottom: 2 },
    itemStyle: { color: cores.ink },
  };
}

export const eixo = (cores: ReturnType<typeof useCoresTema>) => ({
  tick: { fill: cores.muted, fontSize: 11 },
  axisLine: { stroke: cores.grid },
  tickLine: false as const,
});
