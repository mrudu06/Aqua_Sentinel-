import { CVProcessingResult } from '../types';

/**
 * Computer Vision Pipeline matching OpenCV operations in JavaScript/HTML5 Canvas:
 * 1. Grayscale conversion: cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
 * 2. Gaussian blur denoising: cv2.GaussianBlur(gray, (5, 5), 0)
 * 3. Low-albedo water thresholding: cv2.threshold(blurred, thresh, 255, cv2.THRESH_BINARY_INV)
 * 4. Contour border tracing: cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
 * 5. Surface area integration: sum of contour pixel areas
 */

export function processImageWithCV(
  img: HTMLImageElement | HTMLCanvasElement,
  darknessThreshold: number = 95,
  minContourArea: number = 300,
  overlayColor: string = '#10B981'
): CVProcessingResult {
  const width = img.width || 400;
  const height = img.height || 400;

  // Offscreen canvas for raw image buffer
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, width, height);

  const rawImageData = ctx.getImageData(0, 0, width, height);
  const data = rawImageData.data;

  // 1. Grayscale array
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    // Luminance formula Y = 0.299R + 0.587G + 0.114B
    gray[idx] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  // 2. Gaussian Blur (5x5 kernel approximation for sensor speckle noise attenuation)
  const blurred = new Uint8Array(width * height);
  const kernel = [
    1, 4, 7, 4, 1,
    4, 16, 26, 16, 4,
    7, 26, 41, 26, 7,
    4, 16, 26, 16, 4,
    1, 4, 7, 4, 1
  ];
  const kernelSum = 273;

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      let sum = 0;
      let kIdx = 0;
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          sum += gray[(y + ky) * width + (x + kx)] * kernel[kIdx++];
        }
      }
      blurred[y * width + x] = Math.round(sum / kernelSum);
    }
  }

  // 3. Low-Albedo Water Binary Inverted Thresholding
  // Glacial lakes reflect very low light in optical spectrum compared to moraine rock and ice
  const mask = new Uint8Array(width * height);
  const maskImageData = ctx.createImageData(width, height);
  let totalWaterPixels = 0;

  for (let idx = 0; idx < width * height; idx++) {
    const val = blurred[idx] <= darknessThreshold ? 255 : 0;
    mask[idx] = val;
    if (val === 255) {
      totalWaterPixels++;
      const pIdx = idx * 4;
      maskImageData.data[pIdx] = 0;
      maskImageData.data[pIdx + 1] = 230;
      maskImageData.data[pIdx + 2] = 255;
      maskImageData.data[pIdx + 3] = 220; // Semi-transparent cyan mask
    }
  }

  // 4. Contour Boundary Detection (Find boundary pixels of binary mask)
  const boundaryPixels: Array<{ x: number; y: number }> = [];
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let hasWater = false;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (mask[idx] === 255) {
        hasWater = true;
        // Check 4-connectivity for edge transition
        if (
          mask[idx - 1] === 0 ||
          mask[idx + 1] === 0 ||
          mask[idx - width] === 0 ||
          mask[idx + width] === 0
        ) {
          boundaryPixels.push({ x, y });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  const boundingBoxes = hasWater && totalWaterPixels >= minContourArea
    ? [{ x: Math.max(0, minX - 4), y: Math.max(0, minY - 4), width: maxX - minX + 8, height: maxY - minY + 8 }]
    : [];

  // 5. Draw Overlays on Original Image
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = width;
  overlayCanvas.height = height;
  const oCtx = overlayCanvas.getContext('2d')!;
  oCtx.drawImage(img, 0, 0, width, height);

  if (hasWater && totalWaterPixels >= minContourArea) {
    // Fill lake interior with soft transparent tint
    oCtx.save();
    const tintCanvas = document.createElement('canvas');
    tintCanvas.width = width;
    tintCanvas.height = height;
    const tCtx = tintCanvas.getContext('2d')!;
    const tintImgData = tCtx.createImageData(width, height);
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 255) {
        const p = i * 4;
        tintImgData.data[p] = overlayColor === '#EF4444' ? 239 : 16;
        tintImgData.data[p + 1] = overlayColor === '#EF4444' ? 68 : 185;
        tintImgData.data[p + 2] = overlayColor === '#EF4444' ? 68 : 129;
        tintImgData.data[p + 3] = 70; // 28% opacity fill
      }
    }
    tCtx.putImageData(tintImgData, 0, 0);
    oCtx.drawImage(tintCanvas, 0, 0);

    // Draw boundary perimeter (vibrant neon stroke)
    oCtx.fillStyle = overlayColor;
    for (const pt of boundaryPixels) {
      oCtx.fillRect(pt.x - 1, pt.y - 1, 2, 2);
    }

    // Draw bounding box
    if (boundingBoxes.length > 0) {
      const b = boundingBoxes[0];
      oCtx.strokeStyle = overlayColor;
      oCtx.lineWidth = 1.5;
      oCtx.setLineDash([4, 3]);
      oCtx.strokeRect(b.x, b.y, b.width, b.height);
      oCtx.setLineDash([]);

      // Label tag
      oCtx.fillStyle = overlayColor;
      oCtx.fillRect(b.x, b.y - 18, 120, 18);
      oCtx.fillStyle = '#FFFFFF';
      oCtx.font = 'bold 10px monospace';
      oCtx.fillText(`GLACIAL LAKE: ${totalWaterPixels.toLocaleString()} px²`, b.x + 4, b.y - 5);
    }
    oCtx.restore();
  }

  // Create mask Data URL
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const mCtx = maskCanvas.getContext('2d')!;
  mCtx.putImageData(maskImageData, 0, 0);

  return {
    width,
    height,
    surfaceAreaPx: totalWaterPixels >= minContourArea ? totalWaterPixels : 0,
    contourCount: hasWater && totalWaterPixels >= minContourArea ? 1 : 0,
    contours: [boundaryPixels],
    boundingBoxes,
    processedDataUrl: overlayCanvas.toDataURL('image/png'),
    maskDataUrl: maskCanvas.toDataURL('image/png'),
    rawImageData,
    maskImageData
  };
}

/**
 * Creates differential heatmap between t0 (baseline) and t1 (swollen).
 * Highlights newly submerged moraine zone in high-visibility alert red.
 */
export function generateDifferenceHeatmap(
  resT0: CVProcessingResult,
  resT1: CVProcessingResult,
  currentImg: HTMLImageElement | HTMLCanvasElement
): string {
  const width = resT1.width;
  const height = resT1.height;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const ctx = diffCanvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(currentImg, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Ensure maskT0 matches T1 dimensions cleanly
  let maskT0Data: Uint8ClampedArray;
  if (resT0.width === width && resT0.height === height) {
    maskT0Data = resT0.maskImageData.data;
  } else {
    const t0Canvas = document.createElement('canvas');
    t0Canvas.width = resT0.width;
    t0Canvas.height = resT0.height;
    const t0Ctx = t0Canvas.getContext('2d')!;
    t0Ctx.putImageData(resT0.maskImageData, 0, 0);

    const resampledCanvas = document.createElement('canvas');
    resampledCanvas.width = width;
    resampledCanvas.height = height;
    const rCtx = resampledCanvas.getContext('2d')!;
    rCtx.drawImage(t0Canvas, 0, 0, width, height);
    maskT0Data = rCtx.getImageData(0, 0, width, height).data;
  }

  const maskT1 = resT1.maskImageData.data;

  let expansionCount = 0;
  for (let i = 0; i < maskT1.length; i += 4) {
    const isWaterT0 = maskT0Data[i + 3] > 0;
    const isWaterT1 = maskT1[i + 3] > 0;

    // Newly inundated moraine zone (water in t1 but was dry moraine in t0)
    if (isWaterT1 && !isWaterT0) {
      expansionCount++;
      data[i] = 244;     // Bright Red
      data[i + 1] = 63;
      data[i + 2] = 94;
      data[i + 3] = 255;
    } else if (isWaterT0 && isWaterT1) {
      // Existing baseline water body (tinted deep sapphire)
      data[i] = Math.round(data[i] * 0.4 + 10);
      data[i + 1] = Math.round(data[i + 1] * 0.4 + 80);
      data[i + 2] = Math.round(data[i + 2] * 0.4 + 180);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Add HUD overlay legend
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(8, height - 42, width - 16, 34);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, height - 42, width - 16, 34);

  // Red swatch: New Submersion
  ctx.fillStyle = '#F43F5E';
  ctx.fillRect(16, height - 30, 12, 12);
  ctx.fillStyle = '#F1F5F9';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText(`Moraine Submersion Zone (+${expansionCount.toLocaleString()} px²)`, 34, height - 20);

  return diffCanvas.toDataURL('image/png');
}
