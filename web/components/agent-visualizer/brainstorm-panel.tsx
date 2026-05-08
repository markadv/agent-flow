'use client'

import { Z } from '@/lib/agent-types'
import { COLORS } from '@/lib/colors'
import { PanelHeader, SlidingPanel, stopPropagationHandlers } from './shared-ui'

interface BrainstormPanelProps {
  visible: boolean
  html: string | null
  onClose: () => void
}

export function BrainstormPanel({ visible, html, onClose }: BrainstormPanelProps) {
  if (!visible) return null

  return (
    <SlidingPanel
      visible={visible}
      position={{ left: 0, bottom: 0, top: 36 }}
      axis="X"
      offset={-20}
      zIndex={Z.transcriptPanel}
      width={380}
      {...stopPropagationHandlers}
    >
      <div
        className="h-full flex flex-col"
        style={{
          background: COLORS.panelBg,
          backdropFilter: 'blur(24px)',
          borderRight: `1px solid ${COLORS.holoBorder10}`,
        }}
      >
        <div
          className="flex-shrink-0 px-4 py-2.5"
          style={{ borderBottom: `1px solid ${COLORS.holoBorder08}` }}
        >
          <PanelHeader onClose={onClose} className="">
            <span className="text-[10px] font-mono tracking-widest font-semibold" style={{ color: COLORS.panelLabel }}>
              BRAINSTORM
            </span>
          </PanelHeader>
        </div>
        {html ? (
          <iframe
            srcDoc={html}
            sandbox="allow-scripts allow-same-origin"
            style={{ width: '100%', flex: 1, border: 'none', display: 'block' }}
            title="Brainstorm companion"
          />
        ) : (
          <div
            className="flex items-center justify-center flex-1"
            style={{ padding: '24px', color: COLORS.textMuted, fontSize: '13px' }}
          >
            Waiting for brainstorm session…
          </div>
        )}
      </div>
    </SlidingPanel>
  )
}
