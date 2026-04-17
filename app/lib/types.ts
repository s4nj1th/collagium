export type ImageStatus = "pending" | "approved" | "rejected";
export type ImageFrame = "none" | "polaroid" | "minimal" | "canvas" | "modern";

export type CollageImage = {
  id: string;
  url: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  z_index: number;
  locked: boolean;
  status: ImageStatus;
  frame?: ImageFrame;
  created_at: string;
};

