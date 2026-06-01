'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { logos } from './client-logo-strip'

const logoMaxW: Record<string, string> = {
  numan: 'max-w-[40px] md:max-w-[48px]',
  meta: 'max-w-[40px] md:max-w-[48px]',
  emirates: 'max-w-[40px] md:max-w-[48px]',
  asus: 'max-w-[40px] md:max-w-[48px]',
  'time-and-place': 'max-w-[72px] md:max-w-[88px]',
}

function LeafSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 119 204"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M117.648 197.963C117.41 180.812 91.4706 161.807 73.4002 156.314C71.997 155.846 70.3835 153.965 70.8883 152.414C71.8017 149.611 74.3768 150.584 78.5293 149.061C86.5278 146.125 83.7184 133.758 70.3324 128.304C60.4559 124.281 60.3207 103.272 58.7492 103.068C56.4146 102.767 52.3492 111.511 53.9357 128.569C54.6388 136.129 57.2589 141.925 64.0976 146.182C66.892 147.922 67.4449 149.232 67.7393 150.332C68.136 151.819 66.8109 153.087 64.3741 151.495C58.2925 147.52 41.0965 133.752 39.6092 123.034C37.6801 109.128 56.8472 110.556 55.3599 90.2256C54.5847 79.616 62.5983 73.6486 61.0599 72.5579C59.2841 71.3019 46.6853 75.6497 39.7925 87.3501C36.331 93.2273 35.3875 98.7741 38.0557 109.215C39.6933 115.625 36.5534 117.674 35.2343 115.829C34.2578 114.462 29.4412 106.163 33.1641 85.2168C35.7722 70.5417 40.0539 69.7305 45.1769 67.534C48.9809 65.9024 63.046 68.3152 65.1403 55.7375C67.8355 39.5571 79.3526 43.1417 77.9644 40.4014C76.9308 38.3612 65.603 40.6328 58.3316 44.0041C50.2669 47.7419 46.0934 53.3277 44.7052 61.825C44.0532 65.8183 37.8334 67.8675 38.3622 64.1657C39.6182 55.3739 54.7409 36.7356 59.9782 34.0885C64.6054 32.526 74.8575 32.7364 76.5101 20.375C78.6795 4.14949 92.9038 9.7623 93.4327 7.15421C94.1989 3.37427 73.7488 5.45053 64.4672 12.124C53.6622 19.8912 59.8459 27.1386 55.5853 31.7628C51.5199 36.1768 43.1277 49.3945 40.4836 48.6013C38.2691 47.9372 39.5551 38.8209 42.7942 36.7056C46.2887 34.425 51.8504 26.4595 49.669 17.3372C47.0248 6.27683 57.0726 2.03116 56.2643 0.56486C54.789 -2.10934 38.6957 5.10799 34.8227 18.2206C32.5932 25.7714 34.5042 29.0766 36.6946 37.1203C38.2 42.6399 31.4874 79.1773 28.8072 81.4248C27.404 82.5997 24.5796 82.1249 25.472 77.3294C26.4756 71.9329 29.0326 66.1879 23.0261 60.1244C15.953 52.9852 22.96 37.1984 21.3074 35.7321C19.0359 33.7129 7.11617 52.7298 7.16124 63.4296C7.19128 70.7581 11.1064 80.0727 21.1722 83.6062C27.9389 85.983 26.6558 98.5487 29.0356 111.968C30.1654 118.332 34.5252 124.056 37.0612 131.192C37.8544 133.424 34.7956 134.085 33.0799 132.941C31.6917 132.015 30.6191 131.279 30.4658 129.969C30.1023 126.835 28.4497 116.304 23.0802 105.892C18.7114 97.4249 4.12046 82.9482 1.28701 84.7781C-1.0176 86.2654 10.1119 96.0067 7.59091 105.012C3.09886 121.078 14.006 134.96 30.2014 135.984C33.5156 136.195 41.8327 138.172 43.9029 140.365C49.05 145.822 61.2672 154.121 69.9718 159.647C71.1557 160.398 71.0566 162.678 70.1101 163.153C68.4545 163.988 66.7027 164.271 65.3506 162.844C63.1692 160.542 54.5576 153.31 43.6505 150.134C27.9328 145.561 13.2097 146.05 13.4411 148.163C13.6725 150.275 28.056 153.177 30.6972 156.597C33.3383 160.016 38.9902 176.707 56.2433 173.435C64.9149 171.792 66.9581 167.657 73.9952 165.698C84.058 162.898 93.0661 171.152 101.581 187.461C108.291 200.309 117.248 202.238 117.645 197.975L117.648 197.963Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CyclingLogo() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let swapTimer: ReturnType<typeof setTimeout> | null = null
    const interval = setInterval(() => {
      setVisible(false)
      swapTimer = setTimeout(() => {
        setIdx((i) => (i + 1) % logos.length)
        setVisible(true)
      }, 350)
    }, 2800)
    return () => {
      clearInterval(interval)
      if (swapTimer) clearTimeout(swapTimer)
    }
  }, [])

  const { Svg, id } = logos[idx]

  return (
    <span
      className={cn(
        'inline-flex items-center transition-all duration-300 ease-in-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
      )}
    >
      <Svg className={cn('h-auto text-foreground', logoMaxW[id])} />
    </span>
  )
}

const leafClass = 'h-[20px] md:h-[24px] w-auto text-foreground shrink-0'

export function HomeLogoStrip({ hideLeaves = false }: { hideLeaves?: boolean }) {
  return (
    <div className="w-full flex items-center justify-center gap-3 md:gap-4">
      <p className="sr-only">Trusted by teams at: {logos.map((l) => l.label).join(', ')}</p>
      {!hideLeaves && <LeafSvg className={leafClass} />}
      <div className="flex items-center gap-2.5">
        <span
          className="text-[11px] md:text-xs text-foreground whitespace-nowrap"
          aria-hidden="true"
        >
          Trusted by teams at
        </span>
        <CyclingLogo />
      </div>
      {!hideLeaves && <LeafSvg className={cn(leafClass, 'scale-x-[-1]')} />}
    </div>
  )
}
