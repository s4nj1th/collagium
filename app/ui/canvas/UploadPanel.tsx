"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { usePlacementStore } from "@/app/ui/canvas/usePlacementStore";
import { uploadImageAction } from "@/app/lib/actions";

// STICKERS REMOVED

export function UploadPanel({ onSubmitted }: { onSubmitted: () => void }) {
  const placement = usePlacementStore();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

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
    
    const hasContent = placement.file || placement.text_content.trim();
    if (!hasContent) return;

    usePlacementStore.setState({ submitting: true });
    try {
      const fd = new FormData();
      if (placement.file) fd.set("file", placement.file);
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
      <div className="flex gap-1 rounded-xl bg-black/20 p-1">
        {(["image", "text"] as const).map((type) => (
          <button
            key={type}
            onClick={() => placement.setElement(type)}
            className={[
              "flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-all",
              placement.element_type === type
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/60",
            ].join(" ")}
          >
            {type === "image" ? "Photo" : type}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="min-h-[80px]">
        {placement.element_type === "image" && (
          <div
            {...getRootProps()}
            className={[
              "flex h-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-4 text-sm transition-colors",
              "border-white/10 bg-white/5 hover:bg-white/10",
              isDragActive ? "border-white/40 bg-white/10" : "",
            ].join(" ")}
          >
            <input {...getInputProps()} />
            <div className="min-w-0">
              <div className="truncate font-medium text-white/90">
                {placement.file ? placement.file.name : "Choose an image..."}
              </div>
              <div className="text-[10px] text-white/40">
                PNG, JPG, or WEBP (Max 10MB)
              </div>
            </div>
            <div className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
              {placement.file ? "Change" : "Browse"}
            </div>
          </div>
        )}

        {placement.element_type === "text" && (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={placement.text_content}
                onChange={(e) => placement.setTransform({ text_content: e.target.value.slice(0, 100) })}
                placeholder="Write a caption..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-lg text-white outline-none focus:border-white/20"
                style={{ fontFamily: "var(--font-caveat)" }}
                rows={2}
              />
              <div className="absolute bottom-2 right-3 text-[10px] text-white/30">
                {placement.text_content.length}/100
              </div>
            </div>
            {placement.text_content.trim() && (
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/collagium", JSON.stringify({
                    type: "text",
                    content: placement.text_content
                  }));
                }}
                className="flex cursor-grab items-center justify-center gap-2 rounded-xl bg-white/10 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 active:cursor-grabbing"
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Frame Style</span>
          <div className="flex gap-2">
            {frames.map((f) => (
              <button
                key={f.id}
                onClick={() => placement.setTransform({ frame: f.id as any })}
                className={[
                  "shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all",
                  placement.frame === f.id
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/50 hover:bg-white/10",
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
            className="h-10 flex-1 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
            onClick={() => placement.clear()}
            disabled={placement.submitting}
            type="button"
          >
            Clear
          </button>
          <button
            className="h-10 flex-[2] rounded-xl bg-white px-3 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-50"
            onClick={submit}
            disabled={placement.submitting}
            type="button"
          >
            {placement.submitting ? "Submitting..." : "Add to Board"}
          </button>
        </div>
      </div>

      {error && <div className="text-xs font-medium text-red-400">{error}</div>}
      {ok && <div className="text-xs font-medium text-emerald-400">{ok}</div>}
    </div>
  );
}

function ControlSlider({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</span>
      <input
        type="range"
        {...props}
        onChange={(e) => props.onChange?.(Number(e.target.value) as any)}
        className="h-1.5 w-full appearance-none rounded-lg bg-white/10 accent-white outline-none cursor-pointer"
      />
    </label>
  );
}

