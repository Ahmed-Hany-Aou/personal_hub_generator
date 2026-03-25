import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * DraggableNode wraps any element so it can be:
 *  - Dragged freely when isFreeform=true
 *  - Clicked to select it for the StyleToolbar
 *
 * On first switch to freeform mode, the element reads its own
 * DOM position via getBoundingClientRect() relative to the canvas
 * container, so it stays exactly where it was in structured mode.
 */
export default function DraggableNode({
  id,
  isFreeform,
  layoutState,
  onLayoutChange,
  onSelect,
  canvasRef,    // ref to the parent canvas container for relative positioning
  children,
}) {
  const nodeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 });

  const current = layoutState[id] || {};
  const hasPosition = current.x !== undefined && current.y !== undefined;

  // ─────────────────────────────────────────────────────────────────────────
  // When freeform mode is first enabled and we don't yet have a position
  // stored for this node, calculate it from the DOM.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFreeform && !hasPosition && nodeRef.current && canvasRef?.current) {
      const nodeRect = nodeRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      // Position relative to the canvas container
      const x = nodeRect.left - canvasRect.left;
      const y = nodeRect.top - canvasRect.top;
      onLayoutChange(id, { ...current, x, y });
    }
    // Only run when freeform first turns on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFreeform]);

  // ─────────────────────────────────────────────────────────────────────────
  // Drag handlers (only active in freeform mode)
  // ─────────────────────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();

    // Fire selection so the StyleToolbar appears
    if (onSelect) onSelect(id, e.currentTarget);

    if (!isFreeform) return;

    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: current.x ?? 0,
      elemY: current.y ?? 0,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [isFreeform, id, onSelect, current.x, current.y]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.mouseX;
    const dy = e.clientY - dragStart.current.mouseY;
    onLayoutChange(id, {
      ...layoutState[id],
      x: dragStart.current.elemX + dx,
      y: dragStart.current.elemY + dy,
    });
  }, [isDragging, id, onLayoutChange, layoutState]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Build inline styles
  // ─────────────────────────────────────────────────────────────────────────
  const style = {};

  if (isFreeform && hasPosition) {
    style.position = 'absolute';
    style.left = `${current.x}px`;
    style.top  = `${current.y}px`;
    style.cursor = isDragging ? 'grabbing' : 'grab';
    style.zIndex = isDragging ? 200 : 10;
    style.userSelect = 'none';
    style.outline = isDragging
      ? '2px dashed rgba(255,255,255,0.7)'
      : '1px solid transparent';
    style.outlineOffset = '3px';
    style.borderRadius = '3px';
  } else if (!isFreeform) {
    style.cursor = 'pointer';
    style.outline = '1px solid transparent';
    style.outlineOffset = '3px';
    style.borderRadius = '3px';
    style.transition = 'outline-color 0.15s';
  }

  // Apply overridden text-level styles
  if (current.color)    style.color    = current.color;
  if (current.fontSize) style.fontSize = `${current.fontSize}px`;
  if (current.fontFamily) style.fontFamily = current.fontFamily;

  return (
    <div
      ref={nodeRef}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      data-node-id={id}
    >
      {children}
    </div>
  );
}
