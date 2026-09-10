import { fromBlob } from 'geotiff';

export interface LoadedRaster {
  canvas: HTMLCanvasElement;
  name: string;
  width: number;
  height: number;
  format: 'TIFF/GeoTIFF' | 'PNG' | 'JPEG' | 'WebP' | 'Raster';
  sizeBytes: number;
  bands?: number;
}

/**
 * Normalizes an uploaded file (GeoTIFF, TIFF, PNG, JPEG, WebP)
 * into a standardized HTMLCanvasElement for the CV processing engine.
 */
export async function loadRasterFile(
  file: File,
  targetDimension: number = 400
): Promise<LoadedRaster> {
  const isTiff =
    file.name.toLowerCase().endsWith('.tif') ||
    file.name.toLowerCase().endsWith('.tiff') ||
    file.name.toLowerCase().endsWith('.geotiff') ||
    file.type === 'image/tiff';

  if (isTiff) {
    return await loadGeoTiffRaster(file, targetDimension);
  } else {
    return await loadStandardImageRaster(file, targetDimension);
  }
}

/**
 * Decodes a GeoTIFF using the geotiff library, handles 1-band (NDWI/Elevation/SAR)
 * or multi-band (RGB/CIR) satellite rasters, and draws to a standard canvas.
 */
async function loadGeoTiffRaster(file: File, targetDimension: number): Promise<LoadedRaster> {
  try {
    const tiff = await fromBlob(file);
    const image = await tiff.getImage();
    const origWidth = image.getWidth();
    const origHeight = image.getHeight();
    const samplesPerPixel = image.getSamplesPerPixel();

    // Read raster values (can be Uint8, Uint16, Float32)
    const rasters = await image.readRasters({ interleave: false });

    // Output target canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetDimension;
    canvas.height = targetDimension;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(targetDimension, targetDimension);
    const data = imgData.data;

    // Resample down to targetDimension x targetDimension
    const scaleX = origWidth / targetDimension;
    const scaleY = origHeight / targetDimension;

    if (samplesPerPixel >= 3 && Array.isArray(rasters)) {
      // Multi-band RGB / CIR
      const rBand = rasters[0] as ArrayLike<number>;
      const gBand = rasters[1] as ArrayLike<number>;
      const bBand = rasters[2] as ArrayLike<number>;

      // Auto-stretch: compute min/max to normalize 12-bit / 16-bit to 0-255
      let maxVal = 255;
      for (let i = 0; i < Math.min(1000, rBand.length); i++) {
        if (rBand[i] > maxVal) maxVal = Math.max(maxVal, rBand[i]);
      }
      const normFactor = maxVal > 255 ? 255 / maxVal : 1;

      for (let y = 0; y < targetDimension; y++) {
        const srcY = Math.min(origHeight - 1, Math.floor(y * scaleY));
        for (let x = 0; x < targetDimension; x++) {
          const srcX = Math.min(origWidth - 1, Math.floor(x * scaleX));
          const srcIdx = srcY * origWidth + srcX;
          const dstIdx = (y * targetDimension + x) * 4;

          data[dstIdx] = Math.min(255, Math.max(0, Math.round((rBand[srcIdx] || 0) * normFactor)));
          data[dstIdx + 1] = Math.min(255, Math.max(0, Math.round((gBand[srcIdx] || 0) * normFactor)));
          data[dstIdx + 2] = Math.min(255, Math.max(0, Math.round((bBand[srcIdx] || 0) * normFactor)));
          data[dstIdx + 3] = 255;
        }
      }
    } else {
      // Single band (e.g. NDWI index, SAR radar backscatter, or panchromatic)
      const band = (Array.isArray(rasters) ? rasters[0] : rasters) as ArrayLike<number>;

      // Find min/max for dynamic range auto-stretch
      let min = Infinity;
      let max = -Infinity;
      // Sample step
      const step = Math.max(1, Math.floor(band.length / 5000));
      for (let i = 0; i < band.length; i += step) {
        const v = band[i];
        if (Number.isFinite(v)) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
      if (min >= max) {
        min = 0;
        max = 255;
      }
      const range = max - min || 1;

      for (let y = 0; y < targetDimension; y++) {
        const srcY = Math.min(origHeight - 1, Math.floor(y * scaleY));
        for (let x = 0; x < targetDimension; x++) {
          const srcX = Math.min(origWidth - 1, Math.floor(x * scaleX));
          const srcIdx = srcY * origWidth + srcX;
          const dstIdx = (y * targetDimension + x) * 4;

          const rawVal = band[srcIdx] || 0;
          const normalized = Math.min(255, Math.max(0, Math.round(((rawVal - min) / range) * 255)));

          data[dstIdx] = normalized;
          data[dstIdx + 1] = normalized;
          data[dstIdx + 2] = normalized;
          data[dstIdx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    return {
      canvas,
      name: file.name,
      width: origWidth,
      height: origHeight,
      format: 'TIFF/GeoTIFF',
      sizeBytes: file.size,
      bands: samplesPerPixel
    };
  } catch (err: any) {
    throw new Error(`GeoTIFF decoding failed: ${err?.message || 'Unsupported TIFF compression or structure'}`);
  }
}

/**
 * Standard web image decoding (PNG, JPEG, WebP) scaled into targetDimension x targetDimension.
 */
function loadStandardImageRaster(file: File, targetDimension: number): Promise<LoadedRaster> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        reject(
          new Error(
            'Unable to decode image. If this is a GeoTIFF (.tif/.tiff), ensure it is not corrupt or try exporting as PNG/JPEG.'
          )
        );
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetDimension;
        canvas.height = targetDimension;
        const ctx = canvas.getContext('2d')!;

        // Draw and scale to fit exact standardized dimension
        ctx.drawImage(img, 0, 0, targetDimension, targetDimension);

        const ext = file.name.split('.').pop()?.toUpperCase() || 'Raster';
        const format = ext === 'PNG' ? 'PNG' : ext === 'JPG' || ext === 'JPEG' ? 'JPEG' : ext === 'WEBP' ? 'WebP' : 'Raster';

        resolve({
          canvas,
          name: file.name,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          format,
          sizeBytes: file.size,
          bands: 3
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
