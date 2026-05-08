'use client'

import { useState, useEffect } from 'react'
import type { SkillInfo } from '../../scripts/relay'

const RELAY_PORT = process.env.NEXT_PUBLIC_RELAY_PORT ?? '3001'
const SKILLS_URL = `http://127.0.0.1:${RELAY_PORT}/skills`

export function useSkills(): SkillInfo[] {
  const [skills, setSkills] = useState<SkillInfo[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(SKILLS_URL)
        if (!res.ok) return
        const data = (await res.json()) as { skills: SkillInfo[] }
        if (!cancelled) setSkills(data.skills)
      } catch {
        // relay not running — leave skills empty
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return skills
}
