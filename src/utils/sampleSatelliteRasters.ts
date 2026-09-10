import { LoadedRaster } from './rasterLoader';

/**
 * Creates authentic multi-spectral Sentinel-2 MSI / SAR sample raster passes
 * for instant testing of the computer vision and change-detection pipeline.
 */
export function createSampleSatellitePasses(): { t0: LoadedRaster; t1: LoadedRaster } {
  // Pass T0: Sentinel-2 MSI L2A - Oct 2019 (Cold Autumn Baseline)
  const canvasT0 = document.createElement('canvas');
  canvasT0.width = 400;
  canvasT0.height = 400;
  const ctx0 = canvasT0.getContext('2d')!;

  // Background rock / moraine
  ctx0.fillStyle = '#6b7280';
  ctx0.fillRect(0, 0, 400, 400);

  // Add terrain texture
  const img0 = ctx0.createImageData(400, 400);
  for (let i = 0; i < img0.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 45;
    const v = Math.min(255, Math.max(30, Math.round(115 + noise)));
    img0.data[i] = v;
    img0.data[i + 1] = Math.round(v * 0.95);
    img0.data[i + 2] = Math.round(v * 0.98);
    img0.data[i + 3] = 255;
  }
  ctx0.putImageData(img0, 0, 0);

  // Hanging Glaciers (High Albedo / Bright White)
  ctx0.fillStyle = '#f1f5f9';
  ctx0.beginPath();
  ctx0.ellipse(320, 100, 75, 45, 0.2, 0, Math.PI * 2);
  ctx0.fill();

  // Lake Body (Low Albedo / Dark Absorption)
  ctx0.fillStyle = '#0f273d';
  ctx0.beginPath();
  ctx0.ellipse(190, 210, 110, 45, -0.05, 0, Math.PI * 2);
  ctx0.ellipse(260, 195, 60, 30, 0.1, 0, Math.PI * 2);
  ctx0.fill();

  // Pass T1: Sentinel-2 MSI L2A - Sept 2024 (Glacial Outburst Swell)
  const canvasT1 = document.createElement('canvas');
  canvasT1.width = 400;
  canvasT1.height = 400;
  const ctx1 = canvasT1.getContext('2d')!;

  ctx1.fillStyle = '#6b7280';
  ctx1.fillRect(0, 0, 400, 400);

  const img1 = ctx1.createImageData(400, 400);
  for (let i = 0; i < img1.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 45;
    const v = Math.min(255, Math.max(30, Math.round(115 + noise)));
    img1.data[i] = v;
    img1.data[i + 1] = Math.round(v * 0.95);
    img1.data[i + 2] = Math.round(v * 0.98);
    img1.data[i + 3] = 255;
  }
  ctx1.putImageData(img1, 0, 0);

  // Receded Glacier
  ctx1.fillStyle = '#e2e8f0';
  ctx1.beginPath();
  ctx1.ellipse(340, 90, 60, 35, 0.2, 0, Math.PI * 2);
  ctx1.fill();

  // Expanded Swollen Lake Body (+32% area)
  ctx1.fillStyle = '#0a1d2e';
  ctx1.beginPath();
  ctx1.ellipse(180, 212, 140, 58, -0.05, 0, Math.PI * 2);
  ctx1.ellipse(280, 192, 75, 40, 0.12, 0, Math.PI * 2);
  ctx1.fill();

  const rasterT0: LoadedRaster = {
    canvas: canvasT0,
    name: 'S2A_MSIL2A_20191012_T45RVH_B03_NDWI.tif',
    width: 10980,
    height: 10980,
    format: 'TIFF/GeoTIFF',
    sizeBytes: 1420500,
    bands: 1
  };

  const rasterT1: LoadedRaster = {
    canvas: canvasT1,
    name: 'S2B_MSIL2A_20240928_T45RVH_B03_NDWI.tif',
    width: 10980,
    height: 10980,
    format: 'TIFF/GeoTIFF',
    sizeBytes: 1468200,
    bands: 1
  };

  return { t0: rasterT0, t1: rasterT1 };
}
