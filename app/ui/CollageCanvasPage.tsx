"use client";

import { useEffect, useState } from "react";
import { CollageCanvas, CollageCanvasHandle } from "@/app/ui/canvas/CollageCanvas";
import { UploadPanel } from "@/app/ui/canvas/UploadPanel";
import type { CollageImage } from "@/app/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useRef } from "react";
import { Lightbox } from "@/app/ui/canvas/Lightbox";

export function CollageCanvasPage() {
  const canvasRef = useRef<CollageCanvasHandle>(null);
  const [approved, setApproved] = useState<CollageImage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="relative flex-1 bg-zinc-950 text-zinc-50 overflow-hidden flex flex-col">
      <CollageCanvas ref={canvasRef} images={approved} />
      
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-3 sm:p-5">
        <div className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl shadow-black/80 backdrop-blur-3xl transition-all duration-500 ease-in-out">
          <div className="flex items-center justify-between gap-3 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white"
              >
                <div className={`transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </button>
              <div className="text-lg font-bold tracking-tight text-white">
                Collagium
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => canvasRef.current?.download()}
                className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                Snapshot
              </button>
              <a
                className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                href="/admin"
              >
                Admin
              </a>
            </div>
          </div>

          <div 
            className={`grid transition-all duration-500 ease-in-out ${
              isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-white/5 px-6 pb-6 pt-4">
                <UploadPanel onSubmitted={() => setRefreshKey((k) => k + 1)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Lightbox />
    </div>
  );
}
