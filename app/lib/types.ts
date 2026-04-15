export type ImageStatus = "pending" | "approved" | "rejected";

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
  created_at: string;
};

