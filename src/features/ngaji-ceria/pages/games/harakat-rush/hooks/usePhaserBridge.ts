import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Phaser from "phaser";
import { useBestScore } from "../../_shared/hooks";
import { playSfx } from "../../_shared/audio";
import { initialRush, type RushSnapshot } from "../phaser/HarakatRushScene";
import { rushConfig } from "../phaser/config";

export function usePhaserBridge() {
  const hostRef = useRef<HTMLDivElement>(null);
  const bridge = useMemo(() => new Phaser.Events.EventEmitter(), []);
  const [state, setState] = useState(initialRush);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const record = useBestScore("harakat-rush", state.phase, state.score);
  useEffect(() => {
    if (!started || !hostRef.current) return;
    const receive = (snapshot: RushSnapshot) => setState(snapshot);
    const loaded = () => setReady(true);
    bridge.on("state", receive); bridge.on("ready", loaded); bridge.on("sfx", playSfx);
    let game: Phaser.Game | undefined;
    try { game = new Phaser.Game(rushConfig(hostRef.current, bridge)); } catch { setFailed(true); }
    return () => { bridge.off("state", receive); bridge.off("ready", loaded); bridge.off("sfx", playSfx); game?.destroy(true); };
  }, [started, bridge]);
  const start = useCallback(() => {
    playSfx("pop"); setState({ ...initialRush(), phase: "playing" });
    if (started) bridge.emit("start"); else setStarted(true);
  }, [started, bridge]);
  const pause = useCallback(() => bridge.emit("pause"), [bridge]);
  const resume = useCallback(() => bridge.emit("resume"), [bridge]);
  const moveLane = useCallback((lane: number) => bridge.emit("lane", lane), [bridge]);
  return { ...state, ...record, hostRef, ready, failed, start, pause, resume, moveLane };
}
