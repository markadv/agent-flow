'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBrainstorm } from './use-brainstorm'
import { useSkills } from './use-skills'
import type { SkillInfo } from '../../scripts/relay'
import type { ConversationMessage } from './simulation/types'

export type RightPanelTab = 'chat' | 'brainstorm' | 'skills'

const RELAY_PORT = process.env.NEXT_PUBLIC_RELAY_PORT ?? '3001'
const CHAT_URL = `http://127.0.0.1:${RELAY_PORT}/chat`

export interface RightPanelState {
  visible: boolean
  activeTab: RightPanelTab
  brainstormHtml: string | null
  skills: SkillInfo[]
  mainConversation: ConversationMessage[]
  setVisible: (v: boolean) => void
  setActiveTab: (t: RightPanelTab) => void
  onSend: (message: string) => void
}

export function useRightPanel(mainConversation: ConversationMessage[]): RightPanelState {
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<RightPanelTab>('chat')
  const brainstorm = useBrainstorm()
  const skills = useSkills()

  useEffect(() => {
    if (!brainstorm.hasContent) return
    setActiveTab('brainstorm')
    setVisible(true)
  }, [brainstorm.hasContent])

  const hasSkills = skills.length > 0

  useEffect(() => {
    if (!hasSkills) return
    setActiveTab('skills')
    setVisible(true)
  }, [hasSkills])

  const onSend = useCallback(async (message: string) => {
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        console.error('[chat] send failed:', data.error)
      }
    } catch (err) {
      console.error('[chat] relay unreachable:', err)
    }
  }, [])

  return {
    visible, activeTab, brainstormHtml: brainstorm.html, skills,
    mainConversation, setVisible, setActiveTab, onSend,
  }
}
