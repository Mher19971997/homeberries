import React, { useEffect, useRef } from 'react'
import { Box } from '@mui/material'

declare global {
  interface Window {
    Sketchfab: any
  }
}

const MODEL_UID = '27f75fa94c384000bb6a79a3000f8e80'

export default function AnimeSketchfabAssistant() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js'
    script.async = true

    script.onload = () => {
      if (!containerRef.current) return

      const iframe = document.createElement('iframe')
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.style.border = '0'
      iframe.allow =
        'autoplay; fullscreen; xr-spatial-tracking'
      iframe.allowFullscreen = true

      containerRef.current.appendChild(iframe)
      iframeRef.current = iframe

      const client = new window.Sketchfab(iframe)

      client.init(MODEL_UID, {
        autoplay: 1,
        ui_controls: 0,
        ui_infos: 0,
        ui_watermark: 0,
        success: (api: any) => {
          api.start()

          api.addEventListener('viewerready', () => {
            let t = 0

            setInterval(() => {
              t += 0.015

              const camX = Math.sin(t) * 0.12
              const camY = 1.6 + Math.sin(t * 0.5) * 0.04
              const camZ = 3

              api.setCameraLookAt(
                [camX, camY, camZ],
                [0, 1.55, 0],
                0
              )
            }, 50)
          })
        },
        error: () => {
          console.error('Sketchfab init error')
        },
      })
    }

    document.body.appendChild(script)

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
      if (iframeRef.current && iframeRef.current.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current)
      }
    }
  }, [])

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: 420,
        borderRadius: 3,
        overflow: 'hidden',
        background: '#000',
      }}
    />
  )
}
