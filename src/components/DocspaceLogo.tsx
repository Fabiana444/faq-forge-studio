/**
 * Wordmark "DocSpace|" inspirado em docspace.tec.br
 * - "Doc"   em foreground
 * - "Space" em primary
 * - cursor "|" piscando após o nome
 */
export function DocspaceLogo({
  size = "md",
  showTld = true,
}: {
  size?: "sm" | "md" | "lg";
  showTld?: boolean;
}) {
  const cls =
    size === "lg"
      ? "text-2xl"
      : size === "sm"
        ? "text-sm"
        : "text-lg";
  return (
    <span className={`font-extrabold tracking-tight ${cls}`}>
      <span className="text-foreground">Doc</span>
      <span className="text-primary">Space</span>
      <span
        className="ml-0.5 inline-block animate-[blink_1s_steps(2,start)_infinite] text-primary"
        aria-hidden="true"
      >
        |
      </span>
      {showTld && (
        <span className="ml-1 text-[0.55em] font-semibold uppercase tracking-widest text-muted-foreground align-middle">
          .tec
        </span>
      )}
    </span>
  );
}
