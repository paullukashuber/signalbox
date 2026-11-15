/** Renders trusted SVG markup produced by src/signals/draw.ts. */
export function Fig({ markup, className }: { markup: string; className?: string }) {
  return <span className={className} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: markup }} />;
}

/** SVG group with inner markup (for use inside an <svg>). */
export function G({ markup, ...rest }: { markup: string } & React.SVGProps<SVGGElement>) {
  return <g {...rest} dangerouslySetInnerHTML={{ __html: markup }} />;
}
