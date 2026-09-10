# GLOF & Flash Flood Predictive Early-Warning System (GLOF-EWS)

> **24-Hour Hackathon MVP** — Glacial Lake Outburst Flood (GLOF) & Flash Flood Early-Warning Decision Support System using Computer Vision (OpenCV) and Satellite Lake Surface Area Delineation.

---

## ⚡ Quickstart (Local Execution)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Streamlit Dashboard
```bash
streamlit run app.py
```

The app includes an automated fallback mechanism that synthesizes baseline ($t_0$) and swollen ($t_1$) satellite imagery into `mock_data/` on startup, allowing immediate evaluation without external data downloads.

---

## 📐 5-Phase Architecture Blueprint

1. **Synthetic Data & Preloading**:
   - Automated generation of realistic high-altitude moraine terrain and lake raster imagery in `mock_data/`.
   - Option to upload custom multi-spectral Sentinel-2 / Landsat raster images.

2. **Computer Vision Processing Pipeline**:
   - Grayscale conversion with sensor noise attenuation via Gaussian filtering.
   - Low-albedo water extraction via inverted binary thresholding.
   - Morphological opening/closing to eliminate satellite cloud speckle and moraine artifacts.
   - Multi-contour extraction, convex hull boundary computation, and surface area ($px^2$) integration.

3. **Multi-Tier Risk Matrix**:
   - **Safe (≤ 10% expansion)**: Green badge — nominal seasonal melt variance.
   - **Warning (10% – 25% expansion)**: Amber badge — rapid moraine accumulation, DDMA advisory issued.
   - **Critical (> 25% expansion)**: Red badge — high probability of moraine dam breach, urgent valley evacuation initiated.

4. **Interactive Dashboard & Decision Visualizer**:
   - Side-by-side inspection: Baseline ($t_0$) vs Swollen ($t_1$) with color-coded contour overlays.
   - Expansion Delta Heatmap: Highlights newly submerged moraine zones in hot red.
   - Real-time quantitative metric cards ($\Delta px^2$, expansion $\%$, risk badge).

5. **Discipline-Grade Early-Warning Dispatcher**:
   - Operator-authenticated emergency trigger button.
   - Real-time simulated Common Alerting Protocol (CAP) logs.
   - Downstream siren broadcast, reservoir floodgate release recommendation, and CSV telemetry export.
