export function HintButton({ left, disabled, onClick }: { left: number; disabled: boolean; onClick: () => void }) {
  return <button className="game-button border border-emerald-300/30 bg-emerald-500/10" disabled={disabled || left <= 0} onClick={onClick}>Hint ({left})</button>;
}
