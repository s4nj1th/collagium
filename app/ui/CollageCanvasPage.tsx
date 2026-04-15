"use client";

import { useEffect, useState } from "react";
import { CollageCanvas } from "@/app/ui/canvas/CollageCanvas";
import { UploadPanel } from "@/app/ui/canvas/UploadPanel";
import type { CollageImage } from "@/app/lib/types";

export function CollageCanvasPage() {
  const [approved, setApproved] = useState<CollageImage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/images", { cache: "no-store" });
      const json = (await res.json()) as { images: CollageImage[] };
      if (!cancelled) setApproved(json.images || []);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="relative flex-1 bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <CollageCanvas images={approved} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-3">
        <div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-col">
              <div className="text-sm font-semibold">Collagium</div>
              <div className="text-xs text-white/60">
                Upload → place → submit (moderated)
              </div>
            </div>
            <a
              className="text-xs text-white/70 hover:text-white"
              href="/admin"
            >
              Admin
            </a>
          </div>
          <div className="border-t border-white/10 px-4 py-3">
            <UploadPanel onSubmitted={() => setRefreshKey((k) => k + 1)} />
          </div>
        </div>
      </div>
    </div>
  );
}

