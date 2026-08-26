'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useRef, useState } from 'react'

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  function toggleSound() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
      <video
        ref={videoRef}
        className="aspect-[9/16] w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/agendadinho-hero-poster.jpg"
      >
        <source src="/videos/agendadinho-hero-v3.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? 'Ativar som do vídeo' : 'Desativar som do vídeo'}
        className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  )
}
