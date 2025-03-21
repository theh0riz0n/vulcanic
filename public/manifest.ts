import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vulcanic',
    short_name: 'Vulcanic',
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
