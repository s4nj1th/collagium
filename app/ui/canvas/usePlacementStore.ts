"use client";

import { create } from "zustand";
import type { ElementType, ImageFrame } from "@/app/lib/types";

type PlacementState = {
  file: File | null;
  previewUrl: string | null;
  element_type: ElementType;
  text_content: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  z_index: number;
  frame: ImageFrame;
  submitting: boolean;
  setFile: (file: File | null) => void;
  setElement: (type: ElementType, content?: string, url?: string, x?: number, y?: number) => void;
  setTransform: (t: Partial<Pick<PlacementState, "x" | "y" | "rotation" | "scale" | "z_index" | "frame" | "text_content" | "element_type">>) => void;
  clear: () => void;
};

export const usePlacementStore = create<PlacementState>((set, get) => ({
  file: null,
  previewUrl: null,
  element_type: "image",
  text_content: "",
  x: 400,
  y: 300,
  rotation: 0,
  scale: 1,
  z_index: 0,
  frame: "none",
  submitting: false,
  setFile: (file) => {
    const prev = get().previewUrl;
    if (prev) URL.revokeObjectURL(prev);
    if (!file) {
      set({ file: null, previewUrl: null, element_type: "image" });
      return;
    }
    const url = URL.createObjectURL(file);
    set({
      file,
      previewUrl: url,
      element_type: "image",
      x: 400,
      y: 300,
      rotation: 0,
      scale: 1,
      z_index: 0,
      frame: "none",
    });
  },
  setElement: (type, content, url, x, y) => {
    const prev = get().previewUrl;
    if (prev && !get().file) {
        // Only revoke if it's not a local file blob
    }
    set({
        element_type: type,
        text_content: content || "",
        previewUrl: url || null,
        file: null,
        x: x ?? 400,
        y: y ?? 300,
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
    set({ file: null, previewUrl: null, element_type: "image", text_content: "", submitting: false });
  },
}));
