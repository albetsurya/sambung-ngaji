import type { ReactNode } from "react";
import { ImmersiveGameLayout } from "./ImmersiveGameLayout";
import type { GameAccent, GamePhase } from "./types";
import { GameTutorialModal } from "../../../components/GameTutorialModal";
import "./games.css";
import type { TilawatiAudioRequest } from "../../../services/tilawatiAudio";

/**
 * Cangkang game lawas — kini diteruskan ke ImmersiveGameLayout agar seluruh
 * game otomatis imersif (100dvh, header mengambang, tanpa bottom nav).
 */
export function GameShell({ title, phase, onPause, onResume, accent, tutorialGameId, children, fitViewport, recitation, recitationKey }: {
  title: string;
  phase: GamePhase;
  onPause: () => void;
  onResume: () => void;
  accent: GameAccent;
  tutorialGameId?: string;
  children: ReactNode;
  fitViewport?: boolean;
  recitation?: TilawatiAudioRequest;
  recitationKey?: string;
}) {
  return <ImmersiveGameLayout title={title} phase={phase} onPause={onPause} onResume={onResume} accent={accent} fitViewport={fitViewport} recitation={recitation} recitationKey={recitationKey}>{children}{tutorialGameId && <GameTutorialModal gameId={tutorialGameId} />}</ImmersiveGameLayout>;
}
