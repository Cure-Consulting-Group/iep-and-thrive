'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * SignatureCanvas — HTML5 canvas-based signature pad.
 *
 * Captures a drawn signature with mouse + touch + pointer input. Calls
 * onChange(dataUrl) every time the signer lifts their input device with
 * a base64 PNG data URL of the signature. onClear resets the pad and
 * fires onChange('').
 *
 * Shared between E3 (enrollment agreement) and B6 (photo release). Keep
 * the API stable: { onChange(dataUrl: string), value?: string }.
 */
export interface SignatureCanvasProps {
  onChange: (dataUrl: string) => void
  value?: string
  width?: number
  height?: number
  ariaLabel?: string
}

export default function SignatureCanvas({
  onChange,
  value,
  width = 480,
  height = 160,
  ariaLabel = 'Draw your signature',
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const [hasInk, setHasInk] = useState(!!value)

  // Setup + DPR scaling.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2
    ctx.strokeStyle = '#1B4332'
    // Cream background so the PNG is legible against any background.
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
  }, [width, height])

  function pointFromEvent(e: PointerEvent | TouchEvent | MouseEvent) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number
    if ('touches' in e && e.touches.length) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = (e as PointerEvent | MouseEvent).clientX
      clientY = (e as PointerEvent | MouseEvent).clientY
    } else {
      return null
    }
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function startStroke(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    drawingRef.current = true
    const p = pointFromEvent(e.nativeEvent)
    if (p) lastRef.current = p
    canvasRef.current?.setPointerCapture?.(e.pointerId)
  }

  function continueStroke(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const p = pointFromEvent(e.nativeEvent)
    if (!p) return
    const last = lastRef.current ?? p
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    lastRef.current = p
    if (!hasInk) setHasInk(true)
  }

  function endStroke(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    drawingRef.current = false
    lastRef.current = null
    canvasRef.current?.releasePointerCapture?.(e.pointerId)
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    onChange(dataUrl)
  }

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    setHasInk(false)
    onChange('')
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel}
        className="border border-border rounded-lg bg-white touch-none cursor-crosshair"
        onPointerDown={startStroke}
        onPointerMove={continueStroke}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        onPointerCancel={endStroke}
      />
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-text-muted">
          {hasInk ? 'Signature captured' : 'Sign with your mouse or finger above'}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-forest underline hover:no-underline"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
