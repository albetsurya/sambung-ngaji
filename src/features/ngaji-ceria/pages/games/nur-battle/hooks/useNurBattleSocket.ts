import { Client, type Room } from "colyseus.js";
import { useCallback, useEffect, useRef, useState } from "react";

export interface NurBattleSocketState {
  connected: boolean;
  roomId: string | null;
  error: string | null;
  lastState: Record<string, unknown> | null;
  join: (roomId: string) => void;
  answer: (questionId: string, answer: string) => void;
  ready: () => void;
  leave: () => void;
}

const endpoint = (import.meta.env.VITE_COLYSEUS_URL as string | undefined)?.trim();

export function useNurBattleSocket(): NurBattleSocketState {
  const roomRef = useRef<Room<Record<string, unknown>> | null>(null);
  const [state, setState] = useState<NurBattleSocketState>({ connected: false, roomId: null, error: null, lastState: null, join: () => undefined, answer: () => undefined, ready: () => undefined, leave: () => undefined });

  const leave = useCallback(() => {
    const room = roomRef.current;
    roomRef.current = null;
    if (room) void room.leave();
    setState((current) => ({ ...current, connected: false, roomId: null }));
  }, []);
  const join = useCallback((requestedRoomId: string) => {
    leave();
    if (!endpoint) {
      setState((current) => ({ ...current, roomId: requestedRoomId, error: "Offline fallback aktif." }));
      return;
    }
    const client = new Client(endpoint);
    void client.joinOrCreate<Record<string, unknown>>("nur_battle", { roomId: requestedRoomId })
      .then((room) => {
        roomRef.current = room;
        room.onStateChange((nextState) => setState((current) => ({ ...current, connected: true, roomId: room.roomId, lastState: nextState, error: null })));
        room.onError((_code, message) => setState((current) => ({ ...current, error: message ?? "Room multiplayer mengalami error." })));
        room.onLeave(() => { roomRef.current = null; setState((current) => ({ ...current, connected: false, roomId: null })); });
        setState((current) => ({ ...current, connected: true, roomId: room.roomId, error: null }));
      })
      .catch((error: unknown) => setState((current) => ({ ...current, connected: false, roomId: requestedRoomId, error: error instanceof Error ? error.message : "Server multiplayer belum tersedia." })));
  }, [leave]);
  const send = useCallback((type: string, message?: Record<string, string>) => { roomRef.current?.send(type, message); }, []);
  const answer = useCallback((questionId: string, answerValue: string) => send("answer", { questionId, answer: answerValue }), [send]);
  const ready = useCallback(() => send("ready"), [send]);

  useEffect(() => () => { if (roomRef.current) void roomRef.current.leave(); }, []);
  return { ...state, join, answer, ready, leave };
}
