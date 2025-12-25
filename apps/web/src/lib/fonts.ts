import localFont from 'next/font/local'

export const plain = localFont({
  src: [
    {
      path: '../fonts/Plain/Plain-Hairline.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../fonts/Plain/Plain-HairlineItalic.woff2',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../fonts/Plain/Plain-Thin.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../fonts/Plain/Plain-ThinItalic.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../fonts/Plain/Plain-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/Plain/Plain-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../fonts/Plain/Plain-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Plain/Plain-RegularItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/Plain/Plain-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Plain/Plain-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../fonts/Plain/Plain-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/Plain/Plain-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../fonts/Plain/Plain-Extrabold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../fonts/Plain/Plain-ExtraboldItalic.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: '../fonts/Plain/Plain-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../fonts/Plain/Plain-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-maicle-plain',
  display: 'swap',
})
