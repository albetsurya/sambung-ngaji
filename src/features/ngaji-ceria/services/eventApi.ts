import { callREST } from "../../../services/api";

/** Aksi yang diizinkan backend untuk menambah progres event. */
export type EventActionType = "PLAY_GAME" | "FINISH_QUIZ";

export interface EventInfo {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface EventMission {
  id: string;
  event_id: string;
  title: string;
  action_type: EventActionType;
  target_amount: number;
  reward_coins: number;
  reward_tickets: number;
  reward_hearts: number;
  progress: number;
  is_claimed: boolean;
  is_completed: boolean;
}

export interface ActiveEventResponse {
  event: EventInfo | null;
  missions: EventMission[];
}

export interface ClaimEventMissionResult {
  mission_id: string;
  claimed: boolean;
  coins: number;
  tickets: number;
  hearts: number;
  reward: {
    coins: number;
    tickets: number;
    hearts: number;
  };
}

export const eventApi = {
  getActiveEvent: () => callREST<ActiveEventResponse>("GET", "/api/v1/events/active"),
  trackProgress: (actionType: EventActionType) =>
    callREST<ActiveEventResponse>("POST", "/api/v1/events/progress", {
      action_type: actionType,
    }),
  claimMission: (missionId: string) =>
    callREST<ClaimEventMissionResult>(
      "POST",
      `/api/v1/events/${encodeURIComponent(missionId)}/claim`,
    ),
};
