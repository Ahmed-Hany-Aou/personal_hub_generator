import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './DraggableNode.module.css';

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
  alwaysDraggable,
  layoutState,
  onLayoutChange,
  onSelect,
  canvasRef,
  children,
}) {
  // alwaysDraggable: treat as freeform even when isFreeform=false (for custom icon nodes)
  const effectiveFreeform = isFreeform || alwaysDraggable;
  const nodeRef  = useRef(null);
  const dragRef  = useRef({ active: false, moved: false, mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const current    = layoutState[id] || {};
  const hasPosition = current.x !== undefined && current.y !== undefined;

  // When freeform mode first activates, seed position from DOM
  useEffect(() => {
    if (effectiveFreeform && !hasPosition && nodeRef.current && canvasRef?.current) {
      const nodeRect   = nodeRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate scale to decouple screen pixels from canvas pixels
      let scale = 1;
      const transform = window.getComputedStyle(canvasRef.current).transform;
      if (transform && transform !== 'none') {
        const matrix = transform.match(/^matrix\((.+)\)$/);
        if (matrix) scale = parseFloat(matrix[1].split(', ')[0]);
      }
      
      onLayoutChange(id, { 
        ...current, 
        x: (nodeRect.left - canvasRect.left) / scale, 
        y: (nodeRect.top - canvasRect.top) / scale 
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveFreeform]);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    onSelect?.(id, e.currentTarget);

    if (!effectiveFreeform) return;

    // To handle scale transforms correctly during dragging
    let scale = 1;
    if (canvasRef.current) {
      const transform = window.getComputedStyle(canvasRef.current).transform;
      if (transform && transform !== 'none') {
        const matrix = transform.match(/^matrix\((.+)\)$/);
        if (matrix) scale = parseFloat(matrix[1].split(', ')[0]);
      }
    }

    dragRef.current = {
      active: true,
      moved:  false,
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX:  current.x ?? 0,
      elemY:  current.y ?? 0,
      scale,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [effectiveFreeform, id, onSelect, current.x, current.y]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const dx = (e.clientX - dragRef.current.mouseX) / (dragRef.current.scale || 1);
    const dy = (e.clientY - dragRef.current.mouseY) / (dragRef.current.scale || 1);

    // Only start dragging after 4px movement (preserves link clicks)
    if (!dragRef.current.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;

    dragRef.current.moved = true;
    setIsDragging(true);

    let newX = dragRef.current.elemX + dx;
    let newY = dragRef.current.elemY + dy;

    // Viewport-aware boundaries: Clamp position within canvas if possible
    if (canvasRef?.current && nodeRef.current) {
      const parentRect = canvasRef.current.getBoundingClientRect();
      const nodeRect   = nodeRef.current.getBoundingClientRect();
      const pW = parentRect.width / (dragRef.current.scale || 1);
      const pH = parentRect.height / (dragRef.current.scale || 1);
      const nW = nodeRect.width / (dragRef.current.scale || 1);
      const nH = nodeRect.height / (dragRef.current.scale || 1);

      newX = Math.max(0, Math.min(newX, pW - nW));
      newY = Math.max(0, Math.min(newY, pH - nH));
    }

    onLayoutChange(id, {
      ...layoutState[id],
      x: newX,
      y: newY,
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
  if (effectiveFreeform && hasPosition) {
    style.position   = 'absolute';
    style.left       = `${current.x}px`;
    style.top        = `${current.y}px`;
    style.cursor     = isDragging ? 'grabbing' : 'grab';
    style.zIndex     = isDragging ? 200 : 10;
    style.userSelect = 'none';
    style.outline    = isDragging ? '2px dashed rgba(255,255,255,0.7)' : '1px solid transparent';
    style.outlineOffset = '3px';
    style.borderRadius  = '3px';
  } else if (!effectiveFreeform) {
    style.cursor        = 'pointer';
    style.position      = 'static';
    style.outline       = '1px solid transparent';
    style.outlineOffset = '4px';
    style.borderRadius  = '4px';
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
      className={effectiveFreeform ? styles.nodeFreeform : styles.node}
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
