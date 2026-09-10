"""
Utility script to generate synthetic satellite orthomosaic images for baseline and swollen glacial lakes
using only the Python Standard Library (zlib + struct) without external dependencies.
"""
import os
import zlib
import struct
import math
import random

def create_png(width, height, rgb_pixels):
    """Encodes raw RGB pixel bytes into a valid uncompressed/deflated PNG file."""
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    # Width (4), Height (4), Bit depth (1), Color type (1=indexed, 2=RGB, 6=RGBA), Compression (0), Filter (0), Interlace (0)
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff)
    
    # Raw scanlines with filter byte 0 (None) at the start of each line
    raw_lines = bytearray()
    for y in range(height):
        raw_lines.append(0) # Filter byte: None
        start = y * width * 3
        raw_lines.extend(rgb_pixels[start:start + width * 3])
        
    compressed = zlib.compress(bytes(raw_lines), 9)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff)
    
    # IEND chunk
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff)
    return png

def generate_glacial_lake_images(output_dir="mock_data", width=400, height=400):
    os.makedirs(output_dir, exist_ok=True)
    random.seed(42)
    
    for mode in ["baseline", "swollen"]:
        pixels = bytearray()
        
        # Center of the glacial cirque
        cx, cy = width / 2.0, height / 2.0 - 10
        
        # Radii for lake ellipse
        if mode == "baseline":
            rx_base, ry_base = 90.0, 58.0
        else:
            # Swollen by ~35% in radius / surface area
            rx_base, ry_base = 118.0, 78.0
            
        for y in range(height):
            for x in range(width):
                dx = x - cx
                dy = y - cy
                
                # Distance metric with slight organic distortion
                angle = math.atan2(dy, dx)
                distortion = 1.0 + 0.12 * math.sin(3 * angle) + 0.08 * math.cos(5 * angle)
                norm_dist = math.sqrt((dx / (rx_base * distortion)) ** 2 + (dy / (ry_base * distortion)) ** 2)
                
                # Base terrain noise (mountain moraine & rock)
                base_val = 140 + int(30 * math.sin(x * 0.05) * math.cos(y * 0.05)) + random.randint(-15, 15)
                
                # Mountain slopes & snow caps (top corners)
                snow_dist = math.sqrt((x - 80)**2 + (y - 50)**2)
                is_snow = snow_dist < 90 or math.sqrt((x - 330)**2 + (y - 60)**2) < 80
                
                if norm_dist <= 1.0:
                    # Inside the deep glacial water body (low albedo: very dark blue-green)
                    r = max(15, min(45, 25 + int(10 * math.sin(x * 0.1))))
                    g = max(35, min(75, 55 + int(12 * math.cos(y * 0.1))))
                    b = max(60, min(110, 85 + int(15 * math.sin(x * 0.05))))
                elif norm_dist <= 1.12:
                    # Lake shore / damp sediment transition
                    r = int(base_val * 0.55)
                    g = int(base_val * 0.60)
                    b = int(base_val * 0.65)
                elif is_snow:
                    # Snow cover
                    r = min(255, 220 + random.randint(0, 30))
                    g = min(255, 230 + random.randint(0, 25))
                    b = 255
                else:
                    # Rocky grey-brown moraine debris
                    r = max(0, min(255, int(base_val * 0.95)))
                    g = max(0, min(255, int(base_val * 0.90)))
                    b = max(0, min(255, int(base_val * 0.85)))
                    
                pixels.extend([r, g, b])
                
        png_data = create_png(width, height, pixels)
        filename = "baseline_lake_t0.png" if mode == "baseline" else "swollen_lake_t1.png"
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "wb") as f:
            f.write(png_data)
        print(f"Generated: {filepath} ({width}x{height})")

if __name__ == "__main__":
    generate_glacial_lake_images("mock_data", 400, 400)
    # Also save to public/mock_data for instant web loading if needed
    generate_glacial_lake_images("public/mock_data", 400, 400)
