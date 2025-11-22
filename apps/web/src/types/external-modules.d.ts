/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@portabletext/react' {
  import * as React from 'react'
  export const PortableText: React.ComponentType<any>
  export type PortableTextComponents = any
}

declare module '@sanity/image-url' {
  const imageUrlBuilder: any
  export default imageUrlBuilder
}

declare namespace JSX {
  interface IntrinsicElements {
    'mux-player': any
  }
}
