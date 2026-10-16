import type { Card as CardData } from "../data/match-pairs";
import { Card } from "./Card";

export function Board({ cards, disabled, onFlip }: { cards: CardData[]; disabled: boolean; onFlip: (id: string) => void }) {
  return <div className="grid grid-cols-4 gap-2" aria-label="Papan 16 kartu">{cards.map((card, index) => <Card key={card.id} card={card} index={index} disabled={disabled} onFlip={() => onFlip(card.id)} />)}</div>;
}
