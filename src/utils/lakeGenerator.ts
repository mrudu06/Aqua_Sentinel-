import { GlacialLakePreset } from '../types';

export const BENCHMARK_PRESETS: GlacialLakePreset[] = [
  {
    id: 'himalaya-sector-4',
    name: 'Himalaya-Catchment-Sector-4 (Imja & Tsho Rolpa)',
    region: '27.9881° N, 86.9250° E (Khumbu/Rolwaling)',
    elevation: '5,010 m a.s.l.',
    baselineAreaKm2: 2.82,
    description: 'Targeted sector under active emergency surveillance: rapid NDWI shoreline displacement (+34%) and severe moraine slope shear.',
    t0ExpansionFactor: 1.0,
    t1ExpansionFactor: 1.34
  },
  {
    id: 'lhonak',
    name: 'South Lhonak Glacial Lake',
    region: 'North Sikkim, Eastern Himalaya',
    elevation: '5,200 m a.s.l.',
    baselineAreaKm2: 1.62,
    description: 'Site of catastrophic October 2023 GLOF. Rapid moraine dam degradation caused by ice avalanche displacement wave.',
    t0ExpansionFactor: 1.0,
    t1ExpansionFactor: 1.38
  },
  {
    id: 'imja',
    name: 'Imja Tsho Glacial Lake',
    region: 'Khumbu Himal, Everest Region',
    elevation: '5,010 m a.s.l.',
    baselineAreaKm2: 1.28,
    description: 'Fastest-growing moraine-dammed lake in Nepal Himalaya; high downstream vulnerability to Dingboche.',
    t0ExpansionFactor: 1.0,
    t1ExpansionFactor: 1.18
  },
  {
    id: 'chamoli',
    name: 'Rishi Ganga / Raunthi Cirque',
    region: 'Chamoli, Uttarakhand',
    elevation: '4,450 m a.s.l.',
    baselineAreaKm2: 0.85,
    description: 'Flash flood vulnerability basin. Monitored for sudden temporary impoundments and breach surges.',
    t0ExpansionFactor: 1.0,
    t1ExpansionFactor: 1.29
  },
  {
    id: 'tshorolpa',
    name: 'Tsho Rolpa Lake',
    region: 'Rolwaling Valley, Dolakha',
    elevation: '4,580 m a.s.l.',
    baselineAreaKm2: 1.54,
    description: 'One of the largest proglacial lakes in Nepal dammed by unconsolidated end moraine.',
    t0ExpansionFactor: 1.0,
    t1ExpansionFactor: 1.07
  }
];

/**
 * Procedural generation of a realistic high-altitude satellite raster image
 * with mountainous rocky moraines, snow ridges, and a deep glacial lake.
 */
export function generateProceduralLakeCanvas(
  expansionFactor: number = 1.0,
  width: number = 400,
  height: number = 400,
  seedShift: number = 0
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Rocky High-Altitude Moraine Background
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Perlin-like pseudo terrain noise
      const n1 = Math.sin((x + seedShift) * 0.04) * Math.cos(y * 0.04);
      const n2 = Math.sin(x * 0.09 + 1.2) * Math.sin(y * 0.09 + 2.1);
      const noise = (n1 * 0.6 + n2 * 0.4) * 35;
      const baseGrey = 145 + Math.round(noise) + Math.floor((Math.random() - 0.5) * 16);

      // Rocky moraine palette (grey-brown with cold bluish tint)
      data[idx] = Math.min(255, Math.max(0, Math.round(baseGrey * 0.95)));      // R
      data[idx + 1] = Math.min(255, Math.max(0, Math.round(baseGrey * 0.92)));  // G
      data[idx + 2] = Math.min(255, Math.max(0, Math.round(baseGrey * 0.98)));  // B
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. High Altitude Snow Slopes & Ridges
  ctx.save();
  ctx.filter = 'blur(16px)';
  ctx.fillStyle = 'rgba(235, 245, 255, 0.85)';
  // Glacial snow patch top-left
  ctx.beginPath();
  ctx.ellipse(80, 70, 110, 45, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  // Snow ridge top-right
  ctx.beginPath();
  ctx.ellipse(320, 80, 100, 40, Math.PI / 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Glacial Cirque & Lake Basin
  const centerX = width * 0.5;
  const centerY = height * 0.52;
  const rx = 86 * Math.sqrt(expansionFactor);
  const ry = 56 * Math.sqrt(expansionFactor);

  ctx.save();
  // Damp sediment/shore zone (wet ground around lake perimeter)
  ctx.filter = 'blur(6px)';
  ctx.fillStyle = 'rgba(65, 75, 80, 0.9)';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, rx * 1.12, ry * 1.12, 0.18, 0, Math.PI * 2);
  ctx.ellipse(centerX - 35, centerY - 10, rx * 0.65, ry * 0.65, -0.2, 0, Math.PI * 2);
  ctx.ellipse(centerX + 35, centerY + 15, rx * 0.75, ry * 0.75, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Core Glacial Lake Body (Deep low-albedo turquoise-navy)
  ctx.save();
  ctx.fillStyle = '#162838'; // Dark deep glacial water
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, rx, ry, 0.18, 0, Math.PI * 2);
  ctx.ellipse(centerX - 35, centerY - 10, rx * 0.58, ry * 0.58, -0.2, 0, Math.PI * 2);
  ctx.ellipse(centerX + 35, centerY + 15, rx * 0.68, ry * 0.68, 0.3, 0, Math.PI * 2);

  // If swollen, add moraine dam melt channel stretching toward lower-right
  if (expansionFactor > 1.15) {
    const channelScale = (expansionFactor - 1.0) * 2.0;
    ctx.ellipse(centerX + 40, centerY + 55, 30 * channelScale, 16 * channelScale, 0.7, 0, Math.PI * 2);
  }
  ctx.fill();

  // Subtle interior water gradient (deepest water in center)
  const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, rx);
  grad.addColorStop(0, 'rgba(12, 28, 48, 0.6)');
  grad.addColorStop(0.8, 'rgba(20, 50, 75, 0.4)');
  grad.addColorStop(1, 'rgba(35, 75, 95, 0.2)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Add subtle raster scanlines/sensor texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }

  return canvas;
}
