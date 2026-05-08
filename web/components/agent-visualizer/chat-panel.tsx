'use client'

import { useState, useCallback } from 'react'
import { CARD, Z, type AgentState } from '@/lib/agent-types'
import { COLORS, getStateColor } from '@/lib/colors'
import { TranscriptMessage } from './transcript-message'
import type { ConversationMessage } from '@/hooks/simulation/types'
import { PanelHeader, SlidingPanel, stopPropagationHandlers } from './shared-ui'
import { useAutoScroll } from '@/hooks/use-auto-scroll'

interface ChatPanelProps {
  visible: boolean
  agentName: string
  agentState: AgentState
  conversation: ConversationMessage[]
  onClose: () => void
}

export function AgentChatPanel({
  visible,
  agentName,
  agentState,
  conversation,
  onClose,
}: ChatPanelProps) {
  const { ref: logRef } = useAutoScroll(conversation.length, visible)

  const stateColor = getStateColor(agentState)

  return (
    <SlidingPanel
      visible={visible}
      position={{ bottom: 64, right: 12 }}
      zIndex={Z.chatPanel}
      width={CARD.chat.width}
      {...stopPropagationHandlers}
    >
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: CARD.chat.maxHeight }}>
        <PanelHeader onClose={onClose} className="mb-2 flex-shrink-0">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: stateColor, boxShadow: `0 0 6px ${stateColor}` }}
          />
          <span className="text-[10px] font-mono tracking-wider" style={{ color: COLORS.textPrimary }}>
            {agentName.toUpperCase()}
          </span>
          <span className="text-[9px] font-mono capitalize" style={{ color: stateColor + '90' }}>
            {agentState}
          </span>
        </PanelHeader>

        {/* Messages */}
        <div
          ref={logRef}
          className="flex-1 overflow-y-auto space-y-1.5 mb-2"
          style={{ minHeight: CARD.chat.messagesMinHeight, maxHeight: CARD.chat.messagesMaxHeight }}
        >
          {conversation.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[10px] font-mono" style={{ color: COLORS.textMuted }}>
                No messages yet...
              </p>
            </div>
          ) : (
            conversation.map((msg) => (
              <TranscriptMessage key={msg.id} message={msg} />
            ))
          )}
        </div>

      </div>
    </SlidingPanel>
  )
}

interface MainChatPanelProps {
  conversation: ConversationMessage[]
  onSend: (message: string) => void
}

export function MainChatPanel({ conversation, onSend }: MainChatPanelProps) {
  const [draft, setDraft] = useState('')
  const { ref: logRef, handleScroll } = useAutoScroll(conversation.length, true)

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    onSend(trimmed)
    setDraft('')
  }, [draft, onSend])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={logRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-1.5 p-3"
        style={{ minHeight: 0 }}
      >
        {conversation.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[10px] font-mono" style={{ color: COLORS.textMuted }}>
              No messages yet…
            </p>
          </div>
        ) : (
          conversation.map((msg) => (
            <TranscriptMessage key={msg.id} message={msg} />
          ))
        )}
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.holoBorder10}`, padding: '8px', flexShrink: 0 }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Claude… (Enter to send, Shift+Enter for newline)"
          rows={3}
          style={{
            width: '100%', resize: 'none', background: 'transparent',
            border: `1px solid ${COLORS.holoBorder10}`, borderRadius: 6,
            padding: '8px 10px', fontSize: '12px', color: COLORS.textPrimary,
            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  )
}
