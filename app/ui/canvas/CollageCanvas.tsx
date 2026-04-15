"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Image as KonvaImage, Layer, Rect, Stage } from "react-konva";
import type Konva from "konva";
import type { CollageImage } from "@/app/lib/types";
import { useCanvasStore } from "@/app/ui/canvas/useCanvasStore";
import { usePlacementStore } from "@/app/ui/canvas/usePlacementStore";

function useWindowSize() {
  const [size, setSize] = useState({ w: 800, h: 600 });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

function useHTMLImage(src: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const i = new window.Image();
    i.crossOrigin = "anonymous";
    i.src = src;
    i.onload = () => setImg(i);
    return () => {
      setImg(null);
    };
  }, [src]);
  return img;
}

export function CollageCanvas({ images }: { images: CollageImage[] }) {
  const stageRef = useRef<Konva.Stage>(null);
  const { w, h } = useWindowSize();
  const { stageScale, stageX, stageY, setViewport } = useCanvasStore();
  const placement = usePlacementStore();

  const previewImg = useHTMLImage(placement.previewUrl);

  const sorted = useMemo(() => {
    return [...images].sort((a, b) => (a.z_index ?? 0) - (b.z_index ?? 0));
  }, [images]);

  const imageElements = useMemo(() => new Map<string, HTMLImageElement>(), []);
  const [ready, setReady] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const toLoad = sorted.map((i) => i.url);
      await Promise.all(
        toLoad.map(
          (url) =>
            new Promise<void>((resolve) => {
              if (imageElements.has(url)) return resolve();
              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.src = url;
              img.onload = () => {
                imageElements.set(url, img);
                resolve();
              };
              img.onerror = () => resolve();
            }),
        ),
      );
      if (alive) setReady((n) => n + 1);
    })();
    return () => {
      alive = false;
    };
  }, [sorted, imageElements]);

  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.06;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clamped = Math.max(0.15, Math.min(4, newScale));

    const mousePointTo = {
      x: (pointer.x - stageX) / oldScale,
      y: (pointer.y - stageY) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    };

    setViewport({ stageScale: clamped, stageX: newPos.x, stageY: newPos.y });
  };

  return (
    <Stage
      ref={stageRef}
      width={w}
      height={h}
      x={stageX}
      y={stageY}
      scaleX={stageScale}
      scaleY={stageScale}
      draggable
      onDragEnd={(e) => setViewport({ stageX: e.target.x(), stageY: e.target.y() })}
      onWheel={onWheel}
      className="touch-none select-none"
    >
      <Layer>
        <Rect x={-200000} y={-200000} width={400000} height={400000} fill="#000000" opacity={0.0} />
      </Layer>

      <Layer>
        {/* faint grid */}
        <Rect x={-200000} y={-200000} width={400000} height={400000} fill="#0a0a0a" opacity={0} />
      </Layer>

      <Layer>
        {sorted.map((img) => {
          const el = imageElements.get(img.url);
          if (!el) return null;
          return (
            <KonvaImage
              key={img.id}
              image={el}
              x={img.x}
              y={img.y}
              rotation={img.rotation}
              scaleX={img.scale}
              scaleY={img.scale}
              listening={false}
            />
          );
        })}

        {previewImg && placement.file ? (
          <KonvaImage
            image={previewImg}
            x={placement.x}
            y={placement.y}
            rotation={placement.rotation}
            scaleX={placement.scale}
            scaleY={placement.scale}
            draggable={!placement.submitting}
            opacity={0.88}
            onDragMove={(e) => placement.setTransform({ x: e.target.x(), y: e.target.y() })}
            onTransformEnd={() => {
              // transformer is handled in PlacementOverlay
            }}
          />
        ) : null}
      </Layer>

      {/* force redraw when cache ready */}
      <Layer visible={false}>
        <Rect x={0} y={0} width={1} height={1} fill="#000" opacity={ready ? 0 : 0} />
      </Layer>
    </Stage>
  );
}

