"use client";

import { create } from "zustand";
import type { ImageFrame } from "@/app/lib/types";

type PlacementState = {
  file: File | null;
  previewUrl: string | null;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  z_index: number;
  frame: ImageFrame;
  submitting: boolean;
  setFile: (file: File | null) => void;
  setTransform: (t: Partial<Pick<PlacementState, "x" | "y" | "rotation" | "scale" | "z_index" | "frame">>) => void;
  clear: () => void;
};

export const usePlacementStore = create<PlacementState>((set, get) => ({
  file: null,
  previewUrl: null,
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  z_index: 0,
  frame: "none",
  submitting: false,
  setFile: (file) => {
    const prev = get().previewUrl;
    if (prev) URL.revokeObjectURL(prev);
    if (!file) {
      set({ file: null, previewUrl: null });
      return;
    }
    const url = URL.createObjectURL(file);
    set({
      file,
      previewUrl: url,
      x: 400,
      y: 300,
      rotation: 0,
      scale: 1,
      z_index: 0,
      frame: "none",
    });
  },
  setTransform: (t) => set(t),
  clear: () => {
    const prev = get().previewUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ file: null, previewUrl: null, submitting: false });
  },
}));

