/** The Fileo mark: a page with a leaf for its folded corner and two arrows for converting. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        className="logo-mark__page"
        d="M8 2h11l9 9v16a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z"
      />
      <path className="logo-mark__leaf" d="M19 2c0 5.5 3.5 9 9 9 0-5.5-3.5-9-9-9z" />
      <path className="logo-mark__vein" d="M19.6 2.6 27.4 10.4" />
      <path className="logo-mark__arrows" d="M10 16.5h10.5m-3-3 3 3-3 3M22 23.5H11.5m3 3-3-3 3-3" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__name">Fileo</span>
    </span>
  );
}
