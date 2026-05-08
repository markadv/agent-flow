'use client'

import { BrainstormPanel } from './brainstorm-panel'
import { MainChatPanel } from './chat-panel'
import { SkillFlowPanel } from './skill-flow-panel'
import type { RightPanelTab } from '@/hooks/use-right-panel'
import type { ConversationMessage } from '@/hooks/simulation/types'
import { COLORS } from '@/lib/colors'

interface RightPanelProps {
  visible: boolean
  activeTab: RightPanelTab
  brainstormHtml: string | null
  mainConversation: ConversationMessage[]
  onTabChange: (tab: RightPanelTab) => void
  onSend: (message: string) => void
  onClose: () => void
}

const TABS: { id: RightPanelTab; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'brainstorm', label: 'Brainstorm' },
  { id: 'skills', label: 'Skill Flows' },
]

export function RightPanel({
  visible, activeTab, brainstormHtml, mainConversation,
  onTabChange, onSend, onClose,
}: RightPanelProps) {
  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 420,
        background: COLORS.panelBg,
        borderLeft: `1px solid ${COLORS.holoBorder10}`,
        display: 'flex', flexDirection: 'column', zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.holoBorder10}`, flexShrink: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1, padding: '10px 0', fontSize: '12px', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${activeTab === tab.id ? COLORS.complete : 'transparent'}`,
              color: activeTab === tab.id ? COLORS.complete : COLORS.textMuted,
            }}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{ padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textMuted, fontSize: '18px', lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      {/* display:none preserves component state (skill selection, pan position) without unmounting */}
      <div style={{ flex: 1, overflow: 'hidden', display: activeTab === 'chat' ? 'flex' : 'none', flexDirection: 'column' }}>
        <MainChatPanel visible={activeTab === 'chat'} conversation={mainConversation} onSend={onSend} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: activeTab === 'brainstorm' ? 'flex' : 'none', flexDirection: 'column' }}>
        <BrainstormPanel visible html={brainstormHtml} onClose={onClose} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: activeTab === 'skills' ? 'flex' : 'none', flexDirection: 'column' }}>
        <SkillFlowPanel visible onClose={onClose} />
      </div>
    </div>
  )
}
