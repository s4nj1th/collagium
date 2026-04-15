"use client";

import { useEffect, useMemo, useState } from "react";
import type { CollageImage, ImageStatus } from "@/app/lib/types";

type AdminImage = CollageImage;

async function adminFetch<T>(
  password: string,
  input: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "x-collagium-admin-password": password,
      "content-type":
        init?.body && !(init.body instanceof FormData)
          ? "application/json"
          : undefined,
    } as HeadersInit,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<ImageStatus>("pending");
  const [images, setImages] = useState<AdminImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canQuery = password.trim().length > 0;

  const load = async () => {
    if (!canQuery) return;
    setError(null);
    setBusy(true);
    try {
      const data = await adminFetch<{ images: AdminImage[] }>(
        password,
        `/api/admin/images?status=${encodeURIComponent(status)}`,
      );
      setImages(data.images || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const counts = useMemo(() => {
    const pending = images.filter((i) => i.status === "pending").length;
    const approved = images.filter((i) => i.status === "approved").length;
    const rejected = images.filter((i) => i.status === "rejected").length;
    return { pending, approved, rejected };
  }, [images]);

  const patch = async (id: string, body: Record<string, unknown>) => {
    setError(null);
    setBusy(true);
    try {
      await adminFetch<{ image: AdminImage }>(password, `/api/admin/images/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    setError(null);
    setBusy(true);
    try {
      await adminFetch<void>(password, `/api/admin/images/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Collagium
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Moderate submissions and manage the approved canvas.
            </p>
          </div>
          <a className="text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white" href="/">
            Back to canvas
          </a>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Admin password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="COLLAGIUM_ADMIN_PASSWORD"
                type="password"
                className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/40 dark:focus:ring-white/15"
              />
            </label>

            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ImageStatus)}
                className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/10 dark:bg-black/40"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                onClick={() => void load()}
                disabled={!canQuery || busy}
                type="button"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Loaded: {images.length} (pending {counts.pending}, approved {counts.approved}, rejected{" "}
            {counts.rejected})
          </div>
          {error ? <div className="mt-2 text-xs text-red-500">{error}</div> : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{img.id}</div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(img.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-white/90 dark:text-black/80"
                  style={{
                    background:
                      img.status === "approved"
                        ? "rgba(16,185,129,0.25)"
                        : img.status === "rejected"
                          ? "rgba(239,68,68,0.25)"
                          : "rgba(59,130,246,0.25)",
                  }}
                >
                  {img.status}
                </div>
              </div>

              <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">x / y</div>
                  <div className="font-mono">
                    {Math.round(img.x)} / {Math.round(img.y)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">rot / scale</div>
                  <div className="font-mono">
                    {Math.round(img.rotation)}° / {img.scale.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">z</div>
                  <div className="font-mono">{img.z_index}</div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">locked</div>
                  <div className="font-mono">{img.locked ? "true" : "false"}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {img.status !== "approved" ? (
                  <button
                    className="h-9 rounded-xl bg-emerald-500/15 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-200"
                    onClick={() => void patch(img.id, { status: "approved" })}
                    disabled={!canQuery || busy}
                    type="button"
                  >
                    Approve
                  </button>
                ) : null}
                {img.status !== "rejected" ? (
                  <button
                    className="h-9 rounded-xl bg-red-500/15 px-3 text-sm font-semibold text-red-700 hover:bg-red-500/20 disabled:opacity-50 dark:text-red-200"
                    onClick={() => void patch(img.id, { status: "rejected" })}
                    disabled={!canQuery || busy}
                    type="button"
                  >
                    Reject
                  </button>
                ) : null}
                <button
                  className="h-9 rounded-xl bg-black/5 px-3 text-sm font-semibold text-zinc-800 hover:bg-black/10 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                  onClick={() => void patch(img.id, { locked: !img.locked })}
                  disabled={!canQuery || busy}
                  type="button"
                >
                  {img.locked ? "Unlock" : "Lock"}
                </button>
                <button
                  className="h-9 rounded-xl bg-black/5 px-3 text-sm font-semibold text-zinc-800 hover:bg-black/10 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                  onClick={() => void patch(img.id, { z_index: img.z_index + 1 })}
                  disabled={!canQuery || busy}
                  type="button"
                >
                  Z +1
                </button>
                <button
                  className="h-9 rounded-xl bg-black/5 px-3 text-sm font-semibold text-zinc-800 hover:bg-black/10 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                  onClick={() => void patch(img.id, { z_index: img.z_index - 1 })}
                  disabled={!canQuery || busy}
                  type="button"
                >
                  Z -1
                </button>
                <button
                  className="ml-auto h-9 rounded-xl bg-red-500 px-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                  onClick={() => void del(img.id)}
                  disabled={!canQuery || busy}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            No items. Enter password and refresh.
          </div>
        ) : null}
      </div>
    </div>
  );
}

