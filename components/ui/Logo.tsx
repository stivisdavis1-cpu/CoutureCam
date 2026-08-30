import React from 'react'
import { cn } from '@/lib/utils'
import { Scissors } from 'lucide-react'

interface LogoProps {
  className?: string
  showText?: boolean
  light?: boolean 
}

export function Logo({ className, showText = true, light = false }: LogoProps) {
  const textColor = light ? 'text-[#1B2A4A]' : 'text-white'
  const accentColor = light ? '#1B2A4A' : '#C9A84C'
  const bgColor = light ? 'bg-[#C9A84C]' : 'bg-[#1B2A4A]'
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      
      {/* MONOGRAMME CC LUXE */}
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-full shadow-[0_0_15px_rgba(201,168,76,0.2)] relative overflow-hidden border border-[#C9A84C]/30",
        bgColor
      )}>
        
        {/* Les lettres CC entrelacées style Chanel/Gucci */}
        <div 
          className="absolute inset-0 flex items-center justify-center drop-shadow-sm"
          style={{ fontFamily: 'Georgia, serif', fontSize: '24px', lineHeight: 1 }}
        >
          {/* Premier C (Couture -> Blanc) */}
          <span className="translate-x-[4px] font-normal text-white z-10">C</span>
          {/* Deuxième C (Cam -> Or) inversé */}
          <span className={cn("-translate-x-[4px] font-normal scale-x-[-1] z-0", light ? "text-[#1B2A4A]" : "text-[#C9A84C]")}>C</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-[#1B2A4A] rounded-full p-0.5 border border-[#C9A84C]/50 shadow-inner">
            <Scissors 
              className="w-3.5 h-3.5 text-[#C9A84C]" 
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
      
      {/* TEXTE */}
      {showText && (
        <div className="flex flex-col justify-center">
          <h1 className={cn("text-2xl font-bold tracking-wider leading-none", textColor)} style={{ fontFamily: 'Georgia, serif' }}>
            COUTURE<span className="text-[#C9A84C]">CAM</span>
          </h1>
          <p className={cn("text-[9px] uppercase tracking-[0.2em] font-semibold mt-1", light ? "text-gray-500" : "text-[#C9A84C]/80")}>
            L&apos;excellence sur mesure
          </p>
        </div>
      )}
    </div>
  )
}
