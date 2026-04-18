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

const getInitialOffset = (axis: 'x' | 'y') => {
  if (typeof window === "undefined") return 0;
  return axis === 'x' ? window.innerWidth * 0.3 : window.innerHeight * 0.3;
};

export const useCanvasStore = create<CanvasState>((set) => ({
  stageScale: 0.3,
  stageX: getInitialOffset('x'),
  stageY: getInitialOffset('y'),
  viewingElement: null,
  setViewport: (v) => set(v),
  setViewingElement: (el) => set({ viewingElement: el }),
}));

