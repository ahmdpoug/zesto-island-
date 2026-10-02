import { experimental_generateVideo as generateVideo } from 'ai'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const maxDuration = 800

const PROMPT =
  'Premium cinematic game trailer. Slow smooth dolly push-in toward the fluffy blue Z-cap creature on the beach. It lifts its golden shovel and digs into the glowing treasure spot; a burst of golden light and sparkles erupts and a shiny treasure chest pops up. Camera then gracefully arcs and rises over the island revealing the homestead forge glowing, palm trees swaying, turquoise lagoon shimmering, purple crystal cliffs sparkling at golden hour. Soundtrack: epic uplifting orchestral adventure music with soft strings, warm brass swell, light marimba and chimes, ocean waves, magical sparkle shimmer and a satisfying treasure chime when the chest appears. Instrumental only, no voices, no speech, no singing, no dialogue, no narration.'

export async function POST() {
  if (process.env.NODE_ENV === 'production') return new Response('Not found', { status: 404 })
  try {
    const publicDir = path.join(process.cwd(), 'public', 'promo')
    const image = await readFile(path.join(publicDir, 'keyframe.png'))
    const { video, warnings } = await generateVideo({
      model: 'bytedance/seedance-v1.5-pro',
      prompt: { image, text: PROMPT },
      aspectRatio: '16:9',
      resolution: '1280x720',
      duration: 12,
      generateAudio: true,
    })
    await writeFile(path.join(publicDir, 'zesto-trailer.mp4'), video.uint8Array)
    return Response.json({ bytes: video.uint8Array.length, mediaType: video.mediaType, warnings })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
