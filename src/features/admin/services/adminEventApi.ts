import { restPost } from "../../../services/apiClient";

export type AdminEventActionType = "PLAY_GAME" | "FINISH_QUIZ";

export interface AdminEventMissionPayload {
  title: string;
  action_type: AdminEventActionType;
  target_amount: number;
  reward_coins: number;
  reward_tickets: number;
  reward_hearts: number;
}

export interface CreateAdminEventPayload {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  missions: AdminEventMissionPayload[];
}

export interface AdminEventMission {
  id: string;
  event_id: string;
  title: string;
  action_type: string;
  target_amount: number;
  reward_coins: number;
  reward_tickets: number;
  reward_hearts: number;
}

export interface AdminEvent {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  missions: AdminEventMission[];
}

export const adminEventApi = {
  createEvent: (payload: CreateAdminEventPayload) =>
    restPost<AdminEvent>("/api/admin/events", payload),
};
