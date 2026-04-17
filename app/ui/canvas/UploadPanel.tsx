"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { usePlacementStore } from "@/app/ui/canvas/usePlacementStore";
import { uploadImageAction } from "@/app/lib/actions";

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

  const hint = useMemo(() => {
    if (placement.file) return placement.file.name;
    return isDragActive ? "Drop image…" : "Drop image here, or click to upload";
  }, [placement.file, isDragActive]);

  const submit = async () => {
    setError(null);
    setOk(null);
    if (!placement.file) return;
    usePlacementStore.setState({ submitting: true });
    try {
      const fd = new FormData();
      fd.set("file", placement.file);
      fd.set("x", String(placement.x));
      fd.set("y", String(placement.y));
      fd.set("rotation", String(placement.rotation));
      fd.set("scale", String(placement.scale));
      fd.set("z_index", String(placement.z_index));
      fd.set("frame", placement.frame);

      // Use Server Action instead of API route
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

  const frames: { id: string; name: string }[] = [
    { id: "none", name: "None" },
    { id: "polaroid", name: "Polaroid" },
    { id: "minimal", name: "Minimal" },
    { id: "canvas", name: "Canvas" },
    { id: "modern", name: "Classic" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={[
          "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm",
          "border-white/15 bg-white/5 hover:bg-white/10",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <div className="min-w-0">
          <div className="truncate text-white/90">{hint}</div>
          <div className="text-xs text-white/50">
            Tip: drag to place on canvas, use sliders to rotate/scale.
          </div>
        </div>
        <div className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-xs text-white/70">
          Upload
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-white/60">Choose Frame</span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {frames.map((f) => (
            <button
              key={f.id}
              onClick={() => placement.setTransform({ frame: f.id as any })}
              className={[
                "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                placement.frame === f.id
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/15",
              ].join(" ")}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Rotate
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={placement.rotation}
            onChange={(e) => placement.setTransform({ rotation: Number(e.target.value) })}
            className="accent-white"
            disabled={!placement.file || placement.submitting}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Scale
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.01}
            value={placement.scale}
            onChange={(e) => placement.setTransform({ scale: Number(e.target.value) })}
            className="accent-white"
            disabled={!placement.file || placement.submitting}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Z
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={placement.z_index}
            onChange={(e) => placement.setTransform({ z_index: Number(e.target.value) })}
            className="accent-white"
            disabled={!placement.file || placement.submitting}
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            className="h-9 flex-1 rounded-xl bg-white/15 px-3 text-sm text-white hover:bg-white/20 disabled:opacity-50"
            onClick={() => placement.clear()}
            disabled={!placement.file || placement.submitting}
            type="button"
          >
            Clear
          </button>
          <button
            className="h-9 flex-1 rounded-xl bg-white px-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
            onClick={submit}
            disabled={!placement.file || placement.submitting}
            type="button"
          >
            Submit
          </button>
        </div>
      </div>

      {error ? <div className="text-xs text-red-300">{error}</div> : null}
      {ok ? <div className="text-xs text-emerald-300">{ok}</div> : null}
    </div>
  );
}

