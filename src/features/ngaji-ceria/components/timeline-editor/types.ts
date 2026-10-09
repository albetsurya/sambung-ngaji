export type Selection = { type: "audio" | "text"; id: string } | null;
export type DragData = { type: "asset" | "audio" | "text"; id: string };
export type TouchDrag = {
  data: DragData;
  startX: number;
  startY: number;
  moved: boolean;
  ghost: HTMLDivElement;
};

export const SNAP_PX = 14;
export const SNAP_EPSILON = 0.001;
