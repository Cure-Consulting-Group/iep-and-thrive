'use client'

/**
 * HTML5 canvas signature pad. Pointer-event-based so it works for mouse,
 * pen, and finger. Exports `toDataURL("image/png")` via an imperative ref.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

export interface SignatureCanvasHandle {
  getDataUrl(): string | null
  clear(): void
  hasSignature(): boolean
}

interface SignatureCanvasProps {
  width?: number
  height?: number
  ariaLabel?: string
  onChange?: (hasSignature: boolean) => void
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  function SignatureCanvas(
    { width = 500, height = 180, ariaLabel = 'Signature canvas', onChange },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const drawingRef = useRef(false)
    const lastPointRef = useRef<{ x: number; y: number } | null>(null)
    const hasStrokeRef = useRef(false)
    const [, setTick] = useState(0)

    const getCtx = useCallback(() => {
      const c = canvasRef.current
      if (!c) return null
      return c.getContext('2d')
    }, [])

    const initCanvas = useCallback(() => {
      const c = canvasRef.current
      if (!c) return
      const dpr = window.devicePixelRatio || 1
      c.width = width * dpr
      c.height = height * dpr
      c.style.width = width + 'px'
      c.style.height = height + 'px'
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#1B4332'
      ctx.fillStyle = '#FDFAF4'
      ctx.fillRect(0, 0, width, height)
    }, [width, height])

    useEffect(() => {
      initCanvas()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height])

    const pointAt = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
      const c = canvasRef.current
      if (!c) return { x: 0, y: 0 }
      const rect = c.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }, [])

    const onPointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        const c = canvasRef.current
        if (!c) return
        c.setPointerCapture(e.pointerId)
        drawingRef.current = true
        lastPointRef.current = pointAt(e)
      },
      [pointAt]
    )

    const onPointerMove = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return
        const ctx = getCtx()
        if (!ctx) return
        const last = lastPointRef.current
        const next = pointAt(e)
        if (last) {
          ctx.beginPath()
          ctx.moveTo(last.x, last.y)
          ctx.lineTo(next.x, next.y)
          ctx.stroke()
        }
        lastPointRef.current = next
        if (!hasStrokeRef.current) {
          hasStrokeRef.current = true
          setTick((t) => t + 1)
          onChange?.(true)
        }
      },
      [getCtx, pointAt, onChange]
    )

    const onPointerUp = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        const c = canvasRef.current
        if (c) {
          try { c.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
        }
        drawingRef.current = false
        lastPointRef.current = null
      },
      []
    )

    const clearCanvas = useCallback(() => {
      hasStrokeRef.current = false
      initCanvas()
      setTick((t) => t + 1)
      onChange?.(false)
    }, [initCanvas, onChange])

    useImperativeHandle(
      ref,
      () => ({
        getDataUrl() {
          if (!hasStrokeRef.current) return null
          const c = canvasRef.current
          if (!c) return null
          return c.toDataURL('image/png')
        },
        clear() { clearCanvas() },
        hasSignature() { return hasStrokeRef.current },
      }),
      [clearCanvas]
    )

    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-border bg-cream p-1">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={ariaLabel}
            className="touch-none rounded-lg block w-full max-w-full"
            style={{ width, height }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-body text-text-muted">
            Sign above using your mouse, finger, or stylus.
          </p>
          <button
            type="button"
            onClick={clearCanvas}
            disabled={!hasStrokeRef.current}
            className="text-xs font-body font-semibold text-forest disabled:text-text-muted hover:underline disabled:no-underline disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>
    )
  }
)

export default SignatureCanvas
