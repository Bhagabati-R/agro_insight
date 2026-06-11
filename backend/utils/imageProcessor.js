const sharp = require('sharp');

/**
 * Processes a raw image buffer before sending to AI:
 * - Resizes to max 1024px (preserving aspect ratio)
 * - Normalizes exposure (linear stretch)
 * - Sharpens slightly for better feature detection
 * - Converts to JPEG for consistent format
 * - Extracts metadata: dominant channel stats, brightness, greenness score
 *
 * @param {Buffer} inputBuffer - Raw uploaded image buffer
 * @returns {{ processedBuffer: Buffer, mimeType: string, meta: Object }}
 */
async function processImage(inputBuffer) {
  const pipeline = sharp(inputBuffer)
    .resize(1024, 1024, {
      fit: 'inside',          // never upscale, keep aspect ratio
      withoutEnlargement: true,
    })
    .normalize()              // auto levels — fixes dark/overexposed shots
    .sharpen({ sigma: 0.8 }) // mild sharpening for leaf texture clarity
    .jpeg({ quality: 88, mozjpeg: true });

  // Run processing and extract per-channel stats in parallel
  const [processedBuffer, stats] = await Promise.all([
    pipeline.toBuffer(),
    sharp(inputBuffer)
      .resize(64, 64, { fit: 'inside' })
      .stats(),
  ]);

  const meta = extractStats(stats.channels, stats.dominant);

  return { processedBuffer, mimeType: 'image/jpeg', meta };
}

/**
 * Derives simple health-hint stats from Sharp channel stats.
 */
function extractStats(channels, dominant = {}) {
  if (!channels || channels.length < 3) return {};

  const [r, g, b] = channels;

  // Perceived brightness (ITU-R BT.601 luma)
  const brightness = Math.round(0.299 * r.mean + 0.587 * g.mean + 0.114 * b.mean);

  // Greenness: how dominant is the green channel vs red+blue average
  const greenScore = Math.round(((g.mean - (r.mean + b.mean) / 2) / 255) * 100);

  // Yellowing index: high red+green, low blue → yellowing leaves
  const yellowIndex = Math.round(((r.mean + g.mean - 2 * b.mean) / 255) * 50);

  // Brown/necrosis hint: high red, low green+blue
  const necrosisHint = Math.round(((r.mean - g.mean - b.mean) / 255) * 50);

  return {
    brightness,
    greenScore: Math.max(greenScore, 0),
    yellowIndex: Math.max(yellowIndex, 0),
    necrosisHint: Math.max(necrosisHint, 0),
    dominantColor: dominant,
    dominantTone:
      greenScore > 10 ? 'Green (healthy foliage likely)' :
      yellowIndex > 15 ? 'Yellow (possible nutrient deficiency or aging)' :
      necrosisHint > 10 ? 'Brown/Red (possible necrosis or disease)' :
      'Mixed / unclear',
  };
}

module.exports = { processImage };
