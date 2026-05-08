'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Z } from '@/lib/agent-types'
import { COLORS } from '@/lib/colors'
import { PanelHeader, SlidingPanel, stopPropagationHandlers } from './shared-ui'
import { useSkills } from '@/hooks/use-skills'
import type { SkillInfo } from '../../../scripts/relay'

interface SkillFlowPanelProps {
  visible: boolean
  onClose: () => void
}

export function SkillFlowPanel({ visible, onClose }: SkillFlowPanelProps) {
  const skills = useSkills()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedDot, setSelectedDot] = useState(0)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const vizRef = useRef<import('@viz-js/viz').Viz | null>(null)
  const panRef = useRef({ tx: 0, ty: 0, scale: 1, dragging: false, ox: 0, oy: 0 })

  useEffect(() => {
    import('@viz-js/viz').then(({ instance }) => instance().then(v => { vizRef.current = v }))
  }, [])

  useEffect(() => {
    const container = svgContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const p = panRef.current
      const f = e.deltaY < 0 ? 1.12 : 0.89
      const rect = container.getBoundingClientRect()
      p.tx = e.clientX - rect.left - (e.clientX - rect.left - p.tx) * f
      p.ty = e.clientY - rect.top - (e.clientY - rect.top - p.ty) * f
      p.scale *= f
      const svg = container.querySelector('svg') as SVGSVGElement | null
      if (svg) {
        svg.style.transform = `translate(${p.tx}px,${p.ty}px) scale(${p.scale})`
        svg.style.transformOrigin = '0 0'
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  const selectedSkill: SkillInfo | undefined = skills[selectedIndex]

  const fitToContainer = useCallback(() => {
    const container = svgContainerRef.current
    const svg = container?.querySelector('svg') as SVGSVGElement | null
    if (!svg || !container) return
    const bb = svg.getBBox()
    if (!bb.width || !bb.height) return
    const scale = Math.min((container.clientWidth - 64) / bb.width, (container.clientHeight - 64) / bb.height, 1)
    const tx = (container.clientWidth - bb.width * scale) / 2 - bb.x * scale
    const ty = (container.clientHeight - bb.height * scale) / 2 - bb.y * scale
    panRef.current = { ...panRef.current, tx, ty, scale }
    svg.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`
    svg.style.transformOrigin = '0 0'
  }, [])

  useEffect(() => {
    const viz = vizRef.current
    const container = svgContainerRef.current
    if (!viz || !container || !selectedSkill) return
    while (container.firstChild) container.removeChild(container.firstChild)
    try {
      const svg = viz.renderSVGElement(selectedSkill.dots[selectedDot])
      svg.style.position = 'relative'
      svg.style.maxWidth = 'none'
      container.appendChild(svg)
      fitToContainer()
    } catch {
      const errDiv = document.createElement('div')
      errDiv.textContent = 'Render error'
      errDiv.style.cssText = 'color:#f85149;padding:16px;font-size:12px'
      container.appendChild(errDiv)
    }
  }, [selectedSkill, selectedDot, fitToContainer])

  if (!visible) return null

  return (
    <SlidingPanel
      visible={visible}
      position={{ right: 0, top: 0, bottom: 0 }}
      axis="X"
      offset={20}
      zIndex={Z.transcriptPanel}
      width={640}
    >
      <div
        className="h-full flex flex-col"
        style={{
          background: COLORS.panelBg,
          backdropFilter: 'blur(24px)',
          borderLeft: `1px solid ${COLORS.holoBorder10}`,
        }}
        {...stopPropagationHandlers}
      >
        <div
          className="flex-shrink-0 px-4 py-2.5"
          style={{ borderBottom: `1px solid ${COLORS.holoBorder08}` }}
        >
          <PanelHeader onClose={onClose} className="">
            <span className="text-[10px] font-mono tracking-widest font-semibold" style={{ color: COLORS.panelLabel }}>
              SKILL FLOWS
            </span>
          </PanelHeader>
        </div>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar: skill list */}
          <div style={{ width: 180, overflowY: 'auto', borderRight: `1px solid ${COLORS.holoBorder08}`, flexShrink: 0, padding: '8px 0' }}>
            {skills.length === 0 && (
              <div style={{ padding: '12px 16px', color: COLORS.textMuted, fontSize: '12px' }}>
                No skills found in workspace
              </div>
            )}
            {skills.map((skill, i) => (
              <button
                key={skill.name}
                onClick={() => { setSelectedIndex(i); setSelectedDot(0) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '6px 14px', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer',
                  borderLeft: `3px solid ${i === selectedIndex ? COLORS.complete : 'transparent'}`,
                  color: i === selectedIndex ? COLORS.complete : COLORS.textMuted,
                }}
              >
                {skill.name}
              </button>
            ))}
          </div>
          {/* Main area: dot diagram */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedSkill && selectedSkill.dots.length > 1 && (
              <div style={{ display: 'flex', gap: 6, padding: '6px 10px', borderBottom: `1px solid ${COLORS.holoBorder08}`, flexShrink: 0 }}>
                {selectedSkill.dots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDot(i)}
                    style={{
                      padding: '2px 10px', fontSize: '11px', borderRadius: 4, cursor: 'pointer',
                      border: `1px solid ${i === selectedDot ? COLORS.complete : COLORS.holoBorder08}`,
                      background: i === selectedDot ? 'rgba(102, 255, 170, 0.08)' : 'transparent',
                      color: i === selectedDot ? COLORS.complete : COLORS.textMuted,
                    }}
                  >
                    Flow {i + 1}
                  </button>
                ))}
              </div>
            )}
            <div
              ref={svgContainerRef}
              style={{ flex: 1, overflow: 'hidden', cursor: 'grab', position: 'relative' }}
              onMouseDown={e => {
                const p = panRef.current
                p.dragging = true
                p.ox = e.clientX - p.tx
                p.oy = e.clientY - p.ty
              }}
              onMouseMove={e => {
                const p = panRef.current
                if (!p.dragging) return
                const svg = svgContainerRef.current?.querySelector('svg') as SVGSVGElement | null
                if (!svg) return
                p.tx = e.clientX - p.ox
                p.ty = e.clientY - p.oy
                svg.style.transform = `translate(${p.tx}px,${p.ty}px) scale(${p.scale})`
                svg.style.transformOrigin = '0 0'
              }}
              onMouseUp={() => { panRef.current.dragging = false }}
              onMouseLeave={() => { panRef.current.dragging = false }}
              onDoubleClick={fitToContainer}
            />
          </div>
        </div>
      </div>
    </SlidingPanel>
  )
}
