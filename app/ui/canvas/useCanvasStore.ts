"use client";

import { create } from "zustand";
import type { CollageImage } from "@/app/lib/types";

type CanvasState = {
  stageScale: number;
  stageX: number;
  stageY: number;
  viewingElement: CollageImage | null;
  setViewport: (v: Partial<Pick<CanvasState, "stageScale" | "stageX" | "stageY">>) => void;
  setViewingElement: (el: CollageImage | null) => void;
};

export const useCanvasStore = create<CanvasState>((set) => ({
  stageScale: 1,
  stageX: 0,
  stageY: 0,
  viewingElement: null,
  setViewport: (v) => set(v),
  setViewingElement: (el) => set({ viewingElement: el }),
}));

