"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { usePlacementStore } from "@/app/ui/canvas/usePlacementStore";
import { uploadImageAction } from "@/app/lib/actions";
import { ImageFrame } from "@/app/lib/types";

// STICKERS REMOVED

export function UploadPanel({ onSubmitted }: { onSubmitted: () => void }) {
  const placement = usePlacementStore();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      setOk(null);
      const file = acceptedFiles[0] || null;
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      placement.setFile(file);
    },
    [placement],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
  });

  const submit = async () => {
    setError(null);
    setOk(null);

    const hasContent =
      placement.file || placement.externalUrl || placement.text_content.trim();
    if (!hasContent) return;

    usePlacementStore.setState({ submitting: true });
    try {
      const fd = new FormData();
      if (placement.file) fd.set("file", placement.file);
      if (placement.externalUrl) fd.set("external_url", placement.externalUrl);
      fd.set("element_type", placement.element_type);
      fd.set("text_content", placement.text_content);

      fd.set("x", String(placement.x));
      fd.set("y", String(placement.y));
      fd.set("rotation", String(placement.rotation));
      fd.set("scale", String(placement.scale));
      fd.set("z_index", String(placement.z_index));
      fd.set("frame", placement.frame);

      await uploadImageAction(fd);

      setOk("Submitted for approval.");
      placement.clear();
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      usePlacementStore.setState({ submitting: false });
    }
  };

  const frames = [
    { id: "none", name: "None" },
    { id: "polaroid", name: "Polaroid" },
    { id: "minimal", name: "Minimal" },
    { id: "canvas", name: "Canvas" },
    { id: "modern", name: "Classic" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Switcher */}
      <div className="flex gap-1 rounded-xl bg-black/10 dark:bg-black/40 p-1">
        {(["image", "text"] as const).map((type) => (
          <button
            key={type}
            onClick={() => placement.setElement(type)}
            className={[
              "flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-all",
              placement.element_type === type
                ? "bg-bg-app text-text-main shadow-sm"
                : "text-text-main/40 hover:text-text-main/60",
            ].join(" ")}
          >
            {type === "image" ? "Photo" : type}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="min-h-20">
        {placement.element_type === "image" && (
          <div className="space-y-3">
            <div className="flex gap-1 rounded-lg bg-black/5 dark:bg-white/5 p-1 mb-2">
              <button
                key="file"
                onClick={() => setUploadMode("file")}
                className={`flex-1 rounded py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  uploadMode === "file"
                    ? "bg-bg-app text-text-main shadow-sm"
                    : "text-text-main/40 hover:text-text-main/60"
                }`}
              >
                File
              </button>
              <button
                key="url"
                onClick={() => setUploadMode("url")}
                className={`flex-1 rounded py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  uploadMode === "url"
                    ? "bg-bg-app text-text-main shadow-sm"
                    : "text-text-main/40 hover:text-text-main/60"
                }`}
              >
                Link URL
              </button>
            </div>

            {uploadMode === "file" ? (
              <div
                {...getRootProps()}
                className={[
                  "flex h-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-4 text-sm transition-colors",
                  "border-border-glass bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10",
                  isDragActive
                    ? "border-text-main/40 bg-black/10 dark:bg-white/10"
                    : "",
                ].join(" ")}
              >
                <input {...getInputProps()} />
                <div className="min-w-0">
                  <div className="truncate font-medium text-text-main/90">
                    {placement.file
                      ? placement.file.name
                      : "Choose an image..."}
                  </div>
                  <div className="text-[10px] text-text-main/40">
                    PNG, JPG, or WEBP (Max 10MB)
                  </div>
                </div>
                <div className="shrink-0 rounded-lg bg-black/10 dark:bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-main/60">
                  {placement.file ? "Change" : "Browse"}
                </div>
              </div>
            ) : (
              <input
                type="url"
                placeholder="https://example.com/image.png"
                value={placement.externalUrl || ""}
                onChange={(e) => {
                  const url = e.target.value;
                  if (placement.file) placement.setFile(null);
                  placement.setTransform({
                    externalUrl: url || null,
                    previewUrl: url || null,
                  });
                }}
                className="w-full rounded-xl border border-border-glass bg-black/5 dark:bg-white/5 p-3 text-sm text-text-main outline-none focus:border-text-main/20"
              />
            )}
          </div>
        )}

        {placement.element_type === "image" &&
          (placement.file || placement.externalUrl) && (
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "application/collagium",
                  JSON.stringify({
                    type: "image_move",
                  }),
                );
              }}
              className="mt-3 flex cursor-grab items-center justify-center gap-2 rounded-xl bg-black/10 dark:bg-white/10 py-2 text-xs font-bold uppercase tracking-wider text-text-main hover:bg-black/20 dark:hover:bg-white/20 active:cursor-grabbing"
            >
              <span>⠿</span> Drag to Canvas
            </div>
          )}

        {placement.element_type === "text" && (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={placement.text_content}
                onChange={(e) =>
                  placement.setTransform({
                    text_content: e.target.value.slice(0, 120),
                  })
                }
                placeholder="Write a caption..."
                className="w-full rounded-xl border border-border-glass bg-black/5 dark:bg-white/5 p-3 text-lg text-text-main outline-none focus:border-text-main/20"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                rows={2}
              />
              <div className="absolute bottom-2 right-3 text-[10px] text-text-main/30">
                {placement.text_content.length}/120
              </div>
            </div>
            {placement.text_content.trim() && (
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/collagium",
                    JSON.stringify({
                      type: "text",
                      content: placement.text_content,
                    }),
                  );
                }}
                className="flex cursor-grab items-center justify-center gap-2 rounded-xl bg-black/10 dark:bg-white/10 py-2 text-xs font-bold uppercase tracking-wider text-text-main hover:bg-black/20 dark:hover:bg-white/20 active:cursor-grabbing"
              >
                <span>⠿</span> Drag to Canvas
              </div>
            )}
          </div>
        )}
      </div>

      {/* Frame Selector (only for images) */}
      {placement.element_type === "image" && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">
            Frame Style
          </span>
          <div className="flex gap-2">
            {frames.map((f) => (
              <button
                key={f.id}
                onClick={() =>
                  placement.setTransform({ frame: f.id as ImageFrame })
                }
                className={[
                  "shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all",
                  placement.frame === f.id
                    ? "bg-text-main text-bg-app"
                    : "bg-black/5 dark:bg-white/5 text-text-main/50 hover:bg-black/10 dark:hover:bg-white/10",
                ].join(" ")}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <ControlSlider
            label="Rotate"
            min={-180}
            max={180}
            value={placement.rotation}
            onChange={(v) => placement.setTransform({ rotation: v })}
            disabled={placement.submitting}
          />
          <ControlSlider
            label="Scale"
            min={0.1}
            max={3}
            step={0.01}
            value={placement.scale}
            onChange={(v) => placement.setTransform({ scale: v })}
            disabled={placement.submitting}
          />
          <ControlSlider
            label="Layer"
            min={-20}
            max={20}
            value={placement.z_index}
            onChange={(v) => placement.setTransform({ z_index: v })}
            disabled={placement.submitting}
          />
        </div>

        <div className="flex gap-2">
          <button
            className="h-10 flex-1 rounded-xl bg-black/5 dark:bg-white/5 px-3 text-sm font-semibold text-text-main/70 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50"
            onClick={() => placement.clear()}
            disabled={placement.submitting}
            type="button"
          >
            Clear
          </button>
          <button
            className="h-10 flex-2 rounded-xl bg-text-main px-3 text-sm font-bold text-bg-app hover:opacity-90 disabled:opacity-50"
            onClick={submit}
            disabled={placement.submitting}
            type="button"
          >
            {placement.submitting ? "Submitting..." : "Add to Board"}
          </button>
        </div>
      </div>

      {error && <div className="text-xs font-medium text-red-400">{error}</div>}
      {ok && <div className="text-xs font-medium text-emerald-500">{ok}</div>}
    </div>
  );
}

function ControlSlider({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">
        {label}
      </span>
      <input
        type="range"
        value={value}
        {...props}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full appearance-none rounded-lg bg-black/10 dark:bg-white/10 accent-text-main outline-none cursor-pointer"
      />
    </label>
  );
}
