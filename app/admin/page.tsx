"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteImageAction, updateImageAction } from "@/app/lib/actions";
import type { CollageImage, ImageStatus } from "@/app/lib/types";
import { useThemeStore } from "@/app/lib/useThemeStore";
import Link from "next/link";

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
  const { theme, toggleTheme } = useThemeStore();

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
      await updateImageAction(id, body, password);
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
      await deleteImageAction(id, password);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const bringToFront = async (id: string) => {
    const maxZ =
      images.length > 0 ? Math.max(...images.map((i) => i.z_index)) : 0;
    await patch(id, { z_index: maxZ + 1 });
  };

  const sendToBack = async (id: string) => {
    const minZ =
      images.length > 0 ? Math.min(...images.map((i) => i.z_index)) : 0;
    await patch(id, { z_index: minZ - 1 });
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-main transition-colors duration-300">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold opacity-50">Collagium</div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="mt-1 text-sm opacity-60">
              Moderate submissions and manage the approved canvas.
            </p>
          </div>
          <Link
            className="text-sm opacity-60 hover:opacity-100 hover:underline transition-all"
            href="/"
          >
            Back to canvas
          </Link>
        </div>

        <div className="rounded-2xl border border-border-glass bg-bg-glass p-4 shadow-sm backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-xs opacity-50">Admin password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="COLLAGIUM_ADMIN_PASSWORD"
                type="password"
                className="h-10 rounded-xl border border-border-glass bg-black/5 dark:bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
              />
            </label>

            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ImageStatus)}
                className="h-10 rounded-xl border border-border-glass bg-black/5 dark:bg-white/5 px-3 text-sm outline-none"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-text-main/70 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-text-main"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M22 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </button>
              <button
                className="h-10 rounded-xl bg-text-main px-4 text-sm font-bold text-bg-app hover:opacity-90 disabled:opacity-50"
                onClick={() => void load()}
                disabled={!canQuery || busy}
                type="button"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs opacity-50">
            Loaded: {images.length} (pending {counts.pending}, approved{" "}
            {counts.approved}, rejected {counts.rejected})
          </div>
          {error ? (
            <div className="mt-2 text-xs text-red-500">{error}</div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="rounded-2xl border border-border-glass bg-bg-glass p-4 transition-all hover:border-text-main/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold opacity-90">
                    {img.id}
                  </div>
                  <div className="mt-1 text-xs opacity-50">
                    {new Date(img.created_at).toLocaleString()}
                  </div>
                </div>
                <div
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider text-white/90 dark:text-black/80"
                  style={{
                    background:
                      img.status === "approved"
                        ? "rgba(16,185,129,0.8)"
                        : img.status === "rejected"
                          ? "rgba(239,68,68,0.8)"
                          : "rgba(59,130,246,0.8)",
                  }}
                >
                  {img.status}
                </div>
              </div>

              <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/30 flex items-center justify-center p-4">
                {img.element_type === "text" ? (
                  <div
                    className="text-center text-xl"
                    style={{ fontFamily: "var(--font-caveat)" }}
                  >
                    {img.text_content}
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="rounded bg-black/5 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  {img.element_type}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs opacity-70">
                <div>
                  <div className="text-[11px] opacity-60">x / y</div>
                  <div className="font-mono">
                    {Math.round(img.x)} / {Math.round(img.y)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] opacity-60">rot / scale</div>
                  <div className="font-mono">
                    {Math.round(img.rotation)}° / {img.scale.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] opacity-60">z</div>
                  <div className="font-mono">{img.z_index}</div>
                </div>
                <div>
                  <div className="text-[11px] opacity-60">locked</div>
                  <div className="font-mono">
                    {img.locked ? "true" : "false"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] opacity-60">frame</div>
                  <div className="font-mono capitalize">
                    {img.frame || "none"}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {img.status !== "approved" ? (
                  <button
                    className="h-9 rounded-xl bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                    onClick={() => void patch(img.id, { status: "approved" })}
                    disabled={!canQuery || busy}
                    type="button"
                  >
                    Approve
                  </button>
                ) : null}
                {img.status !== "rejected" ? (
                  <button
                    className="h-9 rounded-xl bg-red-500/10 px-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    onClick={() => void patch(img.id, { status: "rejected" })}
                    disabled={!canQuery || busy}
                    type="button"
                  >
                    Reject
                  </button>
                ) : null}
                <button
                  className="h-9 rounded-xl bg-black/5 dark:bg-white/5 px-3 text-sm font-semibold opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50"
                  onClick={() => void patch(img.id, { locked: !img.locked })}
                  disabled={!canQuery || busy}
                  type="button"
                >
                  {img.locked ? "Unlock" : "Lock"}
                </button>
                <button
                  className="h-9 rounded-xl bg-black/5 dark:bg-white/5 px-3 text-sm font-semibold opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50"
                  onClick={() => void bringToFront(img.id)}
                  disabled={!canQuery || busy}
                  type="button"
                >
                  Bring Front
                </button>
                <button
                  className="h-9 rounded-xl bg-black/5 dark:bg-white/5 px-3 text-sm font-semibold opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50"
                  onClick={() => void sendToBack(img.id)}
                  disabled={!canQuery || busy}
                  type="button"
                >
                  Send Back
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
          <div className="rounded-2xl border border-border-glass bg-bg-glass p-6 text-sm opacity-60">
            No items. Enter password and refresh.
          </div>
        ) : null}
      </div>
    </div>
  );
}
