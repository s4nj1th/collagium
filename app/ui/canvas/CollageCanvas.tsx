"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text as KonvaText } from "react-konva";
import type Konva from "konva";
import type { CollageImage, ImageFrame, ElementType } from "@/app/lib/types";

export interface CollageCanvasHandle {
  download: () => void;
}

function FramedImage({
  image,
  text_content,
  element_type = "image",
  x,
  y,
  rotation,
  scale,
  frame = "none",
  opacity = 1,
  draggable = false,
  onDragMove,
  onClick,
}: {
  image?: HTMLImageElement;
  text_content?: string;
  element_type?: ElementType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  frame?: ImageFrame;
  opacity?: number;
  draggable?: boolean;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onClick?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const width = element_type === "text" ? 200 : (image?.width || 100);
  const height = element_type === "text" ? 60 : (image?.height || 100);

  const renderFrame = () => {
    if (element_type === "text") return null;
    switch (frame) {
      case "polaroid":
        return (
          <Rect
            x={-width / 2 - width * 0.05}
            y={-height / 2 - height * 0.05}
            width={width * 1.1}
            height={height * 1.25}
            fill="white"
            shadowBlur={10}
            shadowColor="black"
            shadowOpacity={0.3}
            shadowOffset={{ x: 5, y: 5 }}
          />
        );
      case "minimal":
        return (
          <Rect
            x={-width / 2 - 2}
            y={-height / 2 - 2}
            width={width + 4}
            height={height + 4}
            fill="white"
            shadowBlur={5}
            shadowOpacity={0.2}
          />
        );
      case "canvas":
        return (
          <Rect
            x={-width / 2 - 15}
            y={-height / 2 - 15}
            width={width + 30}
            height={height + 30}
            fill="white"
            shadowBlur={15}
            shadowOpacity={0.4}
          />
        );
      case "modern":
        return (
          <Rect
            x={-width / 2 - 15}
            y={-height / 2 - 15}
            width={width + 30}
            height={height + 30}
            fill="#111"
            shadowBlur={15}
            shadowOpacity={0.6}
          />
        );
      default:
        return null;
    }
  };

  const finalScale = isHovered ? scale * 1.05 : scale;

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      scaleX={finalScale}
      scaleY={finalScale}
      draggable={draggable}
      onDragMove={onDragMove}
      onClick={onClick}
      onTap={onClick}
      opacity={opacity}
      onMouseEnter={(e) => {
        setIsHovered(true);
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = draggable ? "move" : "pointer";
        }
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = "default";
        }
      }}
    >
      {renderFrame()}
      {element_type === "text" && (
        <Rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          fill="rgba(0,0,0,0)"
          listening={!draggable}
        />
      )}
      {element_type === "text" ? (
        <KonvaText
          text={text_content}
          x={-width / 2}
          y={-height / 2}
          width={width}
          fontSize={24}
          fontFamily="var(--font-caveat)"
          fill="white"
          align="center"
          shadowBlur={5}
          shadowColor="black"
          shadowOpacity={0.5}
          listening={false}
        />
      ) : image ? (
        <KonvaImage
          image={image}
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          listening={!draggable}
        />
      ) : null}
    </Group>
  );
}
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

export const CollageCanvas = forwardRef<CollageCanvasHandle, { images: CollageImage[] }>(
  ({ images }, ref) => {
    const stageRef = useRef<Konva.Stage>(null);
    const { w, h } = useWindowSize();
    const { stageScale, stageX, stageY, setViewport, setViewingElement } = useCanvasStore();
    const placement = usePlacementStore();

    useImperativeHandle(ref, () => ({
      download: () => {
        const stage = stageRef.current;
        if (!stage) return;
        
        // Temporarily reset zoom to 1 for high-res export or export at current zoom
        const dataURL = stage.toDataURL({ pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `collagium-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    }));

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
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        // Calculate drop position
        const rect = e.currentTarget.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const dropY = e.clientY - rect.top;

        // Map to canvas coords
        const canvasX = (dropX - stageX) / stageScale;
        const canvasY = (dropY - stageY) / stageScale;

        // Check for files first
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            placement.setElement("image", undefined, undefined, canvasX, canvasY);
            placement.setFile(file);
          }
          return;
        }

        // Get custom drop data
        const raw = e.dataTransfer.getData("application/collagium");
        if (!raw) return;
        try {
          const data = JSON.parse(raw);
          if (data.type === "text") {
            placement.setElement("text", data.content, undefined, canvasX, canvasY);
          }
        } catch (err) {
          console.error("Drop error", err);
        }
      }}
      className="relative flex-1 overflow-hidden"
    >
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
            const isText = img.element_type === "text";
            const el = !isText ? imageElements.get(img.url || "") : undefined;
            if (!isText && !el) return null;
            return (
              <FramedImage
                key={img.id}
                image={el}
                text_content={img.text_content}
                element_type={img.element_type}
                x={img.x}
                y={img.y}
                rotation={img.rotation}
                scale={img.scale}
                frame={img.frame}
                onClick={() => setViewingElement(img)}
              />
            );
          })}

          {placement.previewUrl || placement.element_type === "text" ? (
            <FramedImage
              image={previewImg || undefined}
              text_content={placement.text_content}
              element_type={placement.element_type}
              x={placement.x}
              y={placement.y}
              rotation={placement.rotation}
              scale={placement.scale}
              frame={placement.frame}
              draggable={!placement.submitting}
              opacity={0.88}
              onDragMove={(e) => placement.setTransform({ x: e.target.x(), y: e.target.y() })}
            />
          ) : null}
        </Layer>

        {/* force redraw when cache ready */}
        <Layer visible={false}>
          <Rect x={0} y={0} width={1} height={1} fill="#000" opacity={ready ? 0 : 0} />
        </Layer>
      </Stage>
    </div>
  );
  }
);

CollageCanvas.displayName = "CollageCanvas";

