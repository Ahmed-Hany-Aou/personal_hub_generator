import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * DraggableNode wraps any element so it can be:
 *  - Dragged freely when isFreeform=true
 *  - Clicked to select it for the StyleToolbar
 *
 * Links inside the node remain functional — a drag is only registered
 * after the pointer has moved >4px, so short taps/clicks still work.
 */
export default function DraggableNode({
  id,
  isFreeform,
  layoutState,
  onLayoutChange,
  onSelect,
  canvasRef,
  children,
}) {
  const nodeRef  = useRef(null);
  const dragRef  = useRef({ active: false, moved: false, mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const current    = layoutState[id] || {};
  const hasPosition = current.x !== undefined && current.y !== undefined;

  // When freeform mode first activates, seed position from DOM
  useEffect(() => {
    if (isFreeform && !hasPosition && nodeRef.current && canvasRef?.current) {
      const nodeRect   = nodeRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      onLayoutChange(id, { ...current, x: nodeRect.left - canvasRect.left, y: nodeRect.top - canvasRect.top });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFreeform]);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    onSelect?.(id, e.currentTarget);

    if (!isFreeform) return;

    dragRef.current = {
      active: true,
      moved:  false,
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX:  current.x ?? 0,
      elemY:  current.y ?? 0,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [isFreeform, id, onSelect, current.x, current.y]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.mouseX;
    const dy = e.clientY - dragRef.current.mouseY;

    // Only start dragging after 4px movement (preserves link clicks)
    if (!dragRef.current.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;

    dragRef.current.moved = true;
    setIsDragging(true);
    onLayoutChange(id, {
      ...layoutState[id],
      x: dragRef.current.elemX + dx,
      y: dragRef.current.elemY + dy,
    });
  }, [id, onLayoutChange, layoutState]);

  const handlePointerUp = useCallback((e) => {
    const wasDragging = dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.moved  = false;
    setIsDragging(false);

    // If we never actually dragged, treat as a click — allow link navigation
    if (!wasDragging) {
      const link = e.target.closest('a');
      if (link && link.href) {
        window.open(link.href, link.target || '_blank', 'noopener,noreferrer');
      }
    }
  }, []);

  // Build styles
  const style = {};
  if (isFreeform && hasPosition) {
    style.position   = 'absolute';
    style.left       = `${current.x}px`;
    style.top        = `${current.y}px`;
    style.cursor     = isDragging ? 'grabbing' : 'grab';
    style.zIndex     = isDragging ? 200 : 10;
    style.userSelect = 'none';
    style.outline    = isDragging ? '2px dashed rgba(255,255,255,0.7)' : '1px solid transparent';
    style.outlineOffset = '3px';
    style.borderRadius  = '3px';
  } else if (!isFreeform) {
    style.cursor        = 'pointer';
    style.outline       = '1px solid transparent';
    style.outlineOffset = '3px';
    style.borderRadius  = '3px';
    style.transition    = 'outline-color 0.15s';
  }

  if (current.color)      style.color      = current.color;
  if (current.fontSize)   style.fontSize   = `${current.fontSize}px`;
  if (current.fontFamily) style.fontFamily = current.fontFamily;
  if (current.opacity !== undefined) style.opacity = current.opacity;
  if (current.letterSpacing) style.letterSpacing = `${current.letterSpacing}px`;
  if (current.lineHeight)    style.lineHeight    = current.lineHeight;
  if (current.textAlign)     style.textAlign     = current.textAlign;
  if (current.fontWeight)    style.fontWeight    = current.fontWeight;
  if (current.fontStyle)     style.fontStyle     = current.fontStyle;
  if (current.textDecoration) style.textDecoration = current.textDecoration;

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
