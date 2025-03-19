import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DarkTide (vulcanic)',
    short_name: 'DarkTide',
    description: 'A fork of EduVulcan e-diary.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/images/ico.png',
        sizes: '256x256',
        type: 'image/png',
      }
    ],
  }
}
