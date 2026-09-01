import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useRef, useState } from "react";

function ResizableImageView(props: any) {
  const { node, updateAttributes, selected, editor } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const startResize = (e: React.MouseEvent | React.TouchEvent, dir: "left" | "right") => {
    e.preventDefault();
    e.stopPropagation();
    const startX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const startWidth = wrapperRef.current?.querySelector("img")?.getBoundingClientRect().width || 0;
    const maxWidth = wrapperRef.current?.parentElement?.getBoundingClientRect().width || 800;
    setDragging(true);

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const clientX = "touches" in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
      const delta = dir === "right" ? clientX - startX : startX - clientX;
      const next = Math.max(80, Math.min(maxWidth, startWidth + delta));
      updateAttributes({ width: Math.round(next) });
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  const width = node.attrs.width;
  const editable = editor?.isEditable;

  return (
    <NodeViewWrapper
      as="div"
      className="relative my-4"
      style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}
      ref={wrapperRef}
      data-drag-handle
    >
      <img
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        title={node.attrs.title || undefined}
        className="h-auto w-full rounded-lg"
        draggable={false}
      />
      {editable && (selected || dragging) && (
        <>
          <span
            onMouseDown={(e) => startResize(e, "left")}
            onTouchStart={(e) => startResize(e, "left")}
            className="absolute left-[-6px] top-1/2 h-8 w-3 -translate-y-1/2 cursor-ew-resize rounded bg-primary"
          />
          <span
            onMouseDown={(e) => startResize(e, "right")}
            onTouchStart={(e) => startResize(e, "right")}
            className="absolute right-[-6px] top-1/2 h-8 w-3 -translate-y-1/2 cursor-ew-resize rounded bg-primary"
          />
          <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-primary" />
        </>
      )}
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const w = element.getAttribute("width") || element.style.width;
          if (!w) return null;
          const n = parseInt(String(w), 10);
          return Number.isFinite(n) ? n : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width:${attributes.width}px;max-width:100%;height:auto;`,
          };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
