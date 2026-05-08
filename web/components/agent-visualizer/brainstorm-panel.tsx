'use client'

import { COLORS } from '@/lib/colors'

interface BrainstormPanelProps {
  visible: boolean
  html: string | null
}

export function BrainstormPanel({ visible, html }: BrainstormPanelProps) {
  if (!visible) return null

  return (
    <div className="h-full flex flex-col" style={{ overflow: 'hidden' }}>
      {html ? (
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
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
  )
}
