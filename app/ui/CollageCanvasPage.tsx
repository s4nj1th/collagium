"use client";

import { useEffect, useState } from "react";
import { CollageCanvas } from "@/app/ui/canvas/CollageCanvas";
import { UploadPanel } from "@/app/ui/canvas/UploadPanel";
import type { CollageImage } from "@/app/lib/types";
import { createClient } from "@/utils/supabase/client";

export function CollageCanvasPage() {
  const [approved, setApproved] = useState<CollageImage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Initial fetch
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

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("images_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "images",
        },
        () => {
          // Refresh the list when any change occurs (approved/new/etc)
          setRefreshKey((k) => k + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative flex-1 bg-zinc-950 text-zinc-50">
      <CollageCanvas images={approved} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-3 sm:p-5">
        <div className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3 px-6 py-4">
            <div className="text-lg font-bold tracking-tight text-white">
              Collagium
            </div>
            <a
              className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              href="/admin"
            >
              Admin
            </a>
          </div>
          <div className="border-t border-white/5 px-6 py-4">
            <UploadPanel onSubmitted={() => setRefreshKey((k) => k + 1)} />
          </div>
        </div>
      </div>
    </div>
  );
}
