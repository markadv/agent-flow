'use client'

import { useState, useEffect } from 'react'
import { useBrainstorm } from './use-brainstorm'
import { useSkills } from './use-skills'
import type { SkillInfo } from '../../scripts/relay'

export type RightPanelTab = 'brainstorm' | 'skills'

export interface RightPanelState {
  visible: boolean
  activeTab: RightPanelTab
  brainstormHtml: string | null
  skills: SkillInfo[]
  setVisible: (v: boolean) => void
  setActiveTab: (t: RightPanelTab) => void
}

export function useRightPanel(): RightPanelState {
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<RightPanelTab>('brainstorm')
  const brainstorm = useBrainstorm()
  const skills = useSkills()

  useEffect(() => {
    if (!brainstorm.hasContent) return
    setActiveTab('brainstorm')
    setVisible(true)
  }, [brainstorm.hasContent])

  useEffect(() => {
    if (!skills.length) return
    setVisible(prev => {
      if (prev) return prev
      setActiveTab('skills')
      return true
    })
  }, [skills.length])

  return { visible, activeTab, brainstormHtml: brainstorm.html, skills, setVisible, setActiveTab }
}
