'use client'

import { useState, useEffect } from 'react'
import type { BrainstormUpdateEvent } from '../../extension/src/protocol'

interface BrainstormState {
  html: string | null
  hasContent: boolean
}

export function useBrainstorm(): BrainstormState {
  const [state, setState] = useState<BrainstormState>({ html: null, hasContent: false })

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Accept messages from same origin (SSE bridge) or VS Code webview (origin 'null')
      if (event.origin !== window.location.origin && event.origin !== 'null') return
      const data = event.data as Partial<BrainstormUpdateEvent>
      if (data?.type !== 'brainstorm-update' || typeof data.html !== 'string') return
      setState({ html: data.html, hasContent: true })
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return state
}
