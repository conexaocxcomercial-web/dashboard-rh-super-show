/** Logos aplicados como máscara CSS: o PNG define só o recorte, e a cor vem do
 *  tema. Assim um único arquivo serve para claro, escuro e versões tingidas,
 *  sem precisar trocar de imagem nem manter duas cópias. */

type Props = { className?: string; titulo: string };

const mascara = (arquivo: string) => ({
  WebkitMaskImage: `url(${arquivo})`,
  maskImage: `url(${arquivo})`,
  WebkitMaskRepeat: "no-repeat" as const,
  maskRepeat: "no-repeat" as const,
  WebkitMaskSize: "contain" as const,
  maskSize: "contain" as const,
  WebkitMaskPosition: "left center" as const,
  maskPosition: "left center" as const,
});

/** Logo do produto: c‿x | RHestratégico */
export function LogoRhEstrategico({ className = "", titulo }: Props) {
  return (
    <span
      role="img"
      aria-label={titulo}
      className={`block bg-current ${className}`}
      style={{ ...mascara("/rh-estrategico.png"), aspectRatio: "2600 / 358" }}
    />
  );
}

/** Logo da empresa: conexão.cx */
export function LogoConexao({ className = "", titulo }: Props) {
  return (
    <span
      role="img"
      aria-label={titulo}
      className={`block bg-current ${className}`}
      style={{ ...mascara("/conexao-cx.png"), aspectRatio: "1079 / 144" }}
    />
  );
}

/** Símbolo isolado — o sorriso formado por c e x */
export function SimboloCx({ className = "", titulo }: Props) {
  return (
    <span
      role="img"
      aria-label={titulo}
      className={`block bg-current ${className}`}
      style={{ ...mascara("/simbolo-cx.png"), aspectRatio: "625 / 357" }}
    />
  );
}
