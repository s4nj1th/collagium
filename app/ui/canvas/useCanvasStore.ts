"use client";

import { create } from "zustand";

type CanvasState = {
  stageScale: number;
  stageX: number;
  stageY: number;
  setViewport: (v: Partial<Pick<CanvasState, "stageScale" | "stageX" | "stageY">>) => void;
};

export const useCanvasStore = create<CanvasState>((set) => ({
  stageScale: 1,
  stageX: 0,
  stageY: 0,
  setViewport: (v) => set(v),
}));

