"""
=============================================================================
GLOF (Glacial Lake Outburst Flood) & Flash Flood Predictive Early-Warning System
-----------------------------------------------------------------------------
Hackathon 24-Hour MVP - Production-Ready Interactive Streamlit Dashboard
Computer Vision Pipeline with OpenCV, Contour Segmentation & Risk Matrix
=============================================================================
"""

import os
import time
from datetime import datetime
import cv2
import numpy as np
import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt
from PIL import Image

# ---------------------------------------------------------------------------
# PHASE 1: CONFIGURATION & SYNTHETIC MOCK DATA GENERATOR
# ---------------------------------------------------------------------------

MOCK_DATA_DIR = "mock_data"
BASELINE_PATH = os.path.join(MOCK_DATA_DIR, "baseline_lake_t0.png")
SWOLLEN_PATH = os.path.join(MOCK_DATA_DIR, "swollen_lake_t1.png")

def ensure_mock_data_exists():
    """
    Fallback mechanism that programmatically generates synthetic baseline (t0)
    and swollen (t1) glacial lake satellite images if not present.
    Ensures the MVP runs immediately out-of-the-box without manual downloads.
    """
    os.makedirs(MOCK_DATA_DIR, exist_ok=True)
    
    # Check if files already exist
    if os.path.exists(BASELINE_PATH) and os.path.exists(SWOLLEN_PATH):
        return

    # Canvas dimensions for synthetic satellite imagery (512x512)
    height, width = 512, 512
    
    # 1. Base Mountainous Terrain (Rocky moraines, glaciers, snow)
    np.random.seed(42)
    terrain_noise = np.random.normal(160, 20, (height, width)).astype(np.uint8)
    terrain_bgr = cv2.cvtColor(terrain_noise, cv2.COLOR_GRAY2BGR)
    # Add cool glacial tint to surroundings (high-altitude moraine rock + snow)
    terrain_bgr[:, :, 0] = np.clip(terrain_bgr[:, :, 0] * 1.1 + 25, 0, 255) # Blue tint
    terrain_bgr[:, :, 1] = np.clip(terrain_bgr[:, :, 1] * 1.05 + 15, 0, 255) # Green
    terrain_bgr[:, :, 2] = np.clip(terrain_bgr[:, :, 2] * 0.95 + 10, 0, 255) # Red

    # 2. Add Snow Slopes / Glacial ridges
    cv2.ellipse(terrain_bgr, (140, 120), (100, 45), -30, 0, 360, (230, 240, 248), -1)
    cv2.ellipse(terrain_bgr, (390, 110), (120, 50), 20, 0, 360, (235, 245, 250), -1)
    terrain_bgr = cv2.GaussianBlur(terrain_bgr, (21, 21), 0)

    # 3. Create Baseline Lake Mask (t0) - Deep Glacial Water (dark turquoise / deep blue)
    baseline_img = terrain_bgr.copy()
    center = (256, 265)
    # Organic irregular lake shape via overlapping ellipses
    lake_mask_t0 = np.zeros((height, width), dtype=np.uint8)
    cv2.ellipse(lake_mask_t0, center, (120, 75), 15, 0, 360, 255, -1)
    cv2.ellipse(lake_mask_t0, (210, 240), (60, 45), -20, 0, 360, 255, -1)
    cv2.ellipse(lake_mask_t0, (300, 280), (70, 50), 30, 0, 360, 255, -1)
    lake_mask_t0 = cv2.GaussianBlur(lake_mask_t0, (15, 15), 0)
    lake_mask_t0 = (lake_mask_t0 > 100).astype(np.uint8) * 255

    # Deep glacial lake color (low reflectance, dark cyan-navy: B=90, G=60, R=30)
    water_color_t0 = np.array([90, 60, 30], dtype=np.uint8)
    baseline_img[lake_mask_t0 == 255] = water_color_t0
    # Add subtle water surface texture
    water_noise = (np.random.randn(height, width, 3) * 5).astype(np.int16)
    baseline_img = np.clip(baseline_img.astype(np.int16) + water_noise, 0, 255).astype(np.uint8)

    # 4. Create Swollen Lake Mask (t1) - 30%+ expansion due to rapid glacial melting
    swollen_img = terrain_bgr.copy()
    lake_mask_t1 = np.zeros((height, width), dtype=np.uint8)
    cv2.ellipse(lake_mask_t1, center, (148, 98), 15, 0, 360, 255, -1)
    cv2.ellipse(lake_mask_t1, (190, 230), (82, 62), -25, 0, 360, 255, -1)
    cv2.ellipse(lake_mask_t1, (330, 290), (95, 70), 35, 0, 360, 255, -1)
    # Meltwater channels expanding towards the moraine dam breach sector (bottom right)
    cv2.ellipse(lake_mask_t1, (290, 360), (45, 25), 45, 0, 360, 255, -1)
    lake_mask_t1 = cv2.GaussianBlur(lake_mask_t1, (15, 15), 0)
    lake_mask_t1 = (lake_mask_t1 > 100).astype(np.uint8) * 255

    water_color_t1 = np.array([95, 65, 32], dtype=np.uint8)
    swollen_img[lake_mask_t1 == 255] = water_color_t1
    swollen_img = np.clip(swollen_img.astype(np.int16) + water_noise, 0, 255).astype(np.uint8)

    # Write files to disk
    cv2.imwrite(BASELINE_PATH, baseline_img)
    cv2.imwrite(SWOLLEN_PATH, swollen_img)


# ---------------------------------------------------------------------------
# PHASE 2: COMPUTER VISION ENGINE (OpenCV Segmentation Pipeline)
# ---------------------------------------------------------------------------

class GlacialLakeCVEngine:
    """
    Computer Vision pipeline designed to segment glacial water bodies
    from optical/multispectral satellite raster images and quantify surface area.
    """
    def __init__(self, darkness_threshold: int = 90, min_lake_area: int = 500):
        self.darkness_threshold = darkness_threshold
        self.min_lake_area = min_lake_area

    def process_image(self, image_input):
        """
        Processes a raw input image (numpy array RGB):
        1. Grayscale conversion.
        2. Gaussian filtering to remove high-altitude cloud speckle / sensor noise.
        3. Binary inverted thresholding: Water appears darker than surrounding ice/moraine.
        4. Morphological opening/closing to eliminate satellite artifacts.
        5. Contour extraction & surface area computation.
        """
        if isinstance(image_input, Image.Image):
            rgb_arr = np.array(image_input.convert("RGB"))
        elif isinstance(image_input, np.ndarray):
            rgb_arr = image_input
        else:
            raise ValueError("Unsupported image format passed to CV Engine")

        # Step 1: Grayscale conversion
        gray = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2GRAY)

        # Step 2: Gaussian Blur noise reduction
        blurred = cv2.GaussianBlur(gray, (7, 7), 1.5)

        # Step 3: Thresholding
        # Glacial lakes have very low albedo in visible/near-infrared channels
        # Pixels darker than `darkness_threshold` are marked as water candidates (255)
        _, binary_mask = cv2.threshold(blurred, self.darkness_threshold, 255, cv2.THRESH_BINARY_INV)

        # Step 4: Morphological Operations (closing holes and smoothing boundaries)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        cleaned_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel, iterations=1)
        cleaned_mask = cv2.morphologyEx(cleaned_mask, cv2.MORPH_CLOSE, kernel, iterations=2)

        # Step 5: Contour Extraction
        contours, hierarchy = cv2.findContours(cleaned_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Filter out tiny noise contours (smaller than min_lake_area)
        valid_contours = [cnt for cnt in contours if cv2.contourArea(cnt) >= self.min_lake_area]
        
        # Calculate aggregate lake surface area in pixels
        total_pixel_area = sum(cv2.contourArea(cnt) for cnt in valid_contours)

        # Prepare visual overlays
        overlay_rgb = rgb_arr.copy()
        cv2.drawContours(overlay_rgb, valid_contours, -1, (0, 255, 128), 2) # Neon Green perimeter

        # Draw bounding boxes and centroid flags for dominant lakes
        for cnt in valid_contours:
            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(overlay_rgb, (x, y), (x + w, y + h), (255, 180, 0), 1)

        return {
            "rgb": rgb_arr,
            "gray": gray,
            "mask": cleaned_mask,
            "overlay": overlay_rgb,
            "contours": valid_contours,
            "surface_area_px": total_pixel_area,
            "num_water_bodies": len(valid_contours)
        }


# ---------------------------------------------------------------------------
# PHASE 3: RISK MATRIX LOGIC & PROTOCOL CLASSIFIER
# ---------------------------------------------------------------------------

def calculate_glof_risk(area_t0: float, area_t1: float, warning_limit: float = 10.0, critical_limit: float = 25.0):
    """
    Automated risk categorization based on surface area expansion rate (%):
    - Safe: <= 10% expansion (Green)
    - Warning: 10% - 25% expansion (Yellow + simulated district alert)
    - Critical: > 25% expansion (Red + emergency evacuation protocol)
    """
    if area_t0 <= 0:
        return {
            "delta_px": 0,
            "expansion_pct": 0.0,
            "status": "Safe",
            "badge_color": "#10B981",
            "action": "Insufficient baseline data. Normal monitoring ongoing."
        }

    delta_px = area_t1 - area_t0
    expansion_pct = (delta_px / area_t0) * 100.0

    if expansion_pct <= warning_limit:
        status = "Safe"
        badge_color = "#10B981"
        action = "Lake volume within stable seasonal variance. Routine satellite polling active."
        alert_level = "GREEN"
    elif expansion_pct <= critical_limit:
        status = "Warning"
        badge_color = "#F59E0B"
        action = "Accelerated glacial retreat detected. Alerting District Disaster Management Authority (DDMA)."
        alert_level = "YELLOW"
    else:
        status = "Critical"
        badge_color = "#EF4444"
        action = "CRITICAL MORAINE INSTABILITY! Trigger immediate evacuation protocol for downstream valleys."
        alert_level = "RED"

    return {
        "delta_px": delta_px,
        "expansion_pct": expansion_pct,
        "status": status,
        "alert_level": alert_level,
        "badge_color": badge_color,
        "action": action
    }


# ---------------------------------------------------------------------------
# PHASE 4: STREAMLIT DASHBOARD UI & VISUALIZATION
# ---------------------------------------------------------------------------

def main():
    # Page setup
    st.set_page_config(
        page_title="GLOF Early-Warning System (GLOF-EWS)",
        page_icon="🌊",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    # Initialize synthetic data if absent
    ensure_mock_data_exists()

    # Custom Clean UI Styling
    st.markdown("""
        <style>
        .main-header {
            font-size: 2.1rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 0.2rem;
        }
        .sub-header {
            font-size: 1rem;
            color: #475569;
            margin-bottom: 1.5rem;
        }
        .metric-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 18px;
            text-align: center;
        }
        .metric-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #0f172a;
        }
        .metric-label {
            font-size: 0.85rem;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .risk-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 0.95rem;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        </style>
    """, unsafe_allow_html=True)

    # -----------------------------------------------------------------------
    # SIDEBAR CONTROLS
    # -----------------------------------------------------------------------
    st.sidebar.image("https://img.icons8.com/fluency/96/water.png", width=64)
    st.sidebar.title("GLOF Sentinel Hub")
    st.sidebar.caption("Computer Vision Moraine Dam Monitoring")
    st.sidebar.divider()

    st.sidebar.subheader("1. Satellite Imagery Source")
    data_source = st.sidebar.radio(
        "Select Image Input Mode",
        options=["Preloaded Synthetic Lake (mock_data)", "Upload Custom Satellite Imagery"],
        index=0
    )

    img_t0 = None
    img_t1 = None

    if data_source == "Preloaded Synthetic Lake (mock_data)":
        st.sidebar.info("Loaded synthetic Sentinel-2 orthomosaic pair from `mock_data/`.")
        img_t0 = Image.open(BASELINE_PATH)
        img_t1 = Image.open(SWOLLEN_PATH)
    else:
        st.sidebar.markdown("**Baseline Image (t0):**")
        file_t0 = st.sidebar.file_uploader("Upload Baseline (t0) Raster", type=["png", "jpg", "jpeg", "tif", "tiff"], key="uploader_t0")
        st.sidebar.markdown("**Current Image (t1):**")
        file_t1 = st.sidebar.file_uploader("Upload Current (t1) Raster", type=["png", "jpg", "jpeg", "tif", "tiff"], key="uploader_t1")

        if file_t0 is not None:
            img_t0 = Image.open(file_t0)
        else:
            img_t0 = Image.open(BASELINE_PATH)

        if file_t1 is not None:
            img_t1 = Image.open(file_t1)
        else:
            img_t1 = Image.open(SWOLLEN_PATH)

    st.sidebar.divider()
    st.sidebar.subheader("2. Computer Vision Parameters")
    cv_threshold = st.sidebar.slider(
        "Water Body Darkness Threshold",
        min_value=40,
        max_value=160,
        value=95,
        step=5,
        help="Controls the grayscale threshold level to separate low-albedo glacial water from surrounding moraine debris."
    )
    min_area = st.sidebar.slider(
        "Minimum Contour Filter (px²)",
        min_value=100,
        max_value=3000,
        value=500,
        step=100,
        help="Filters out small seasonal snow puddles and shadows."
    )

    st.sidebar.divider()
    st.sidebar.subheader("3. Risk Matrix Thresholds")
    warning_thresh = st.sidebar.slider("Warning Expansion (%)", 5.0, 20.0, 10.0, 1.0)
    critical_thresh = st.sidebar.slider("Critical Expansion (%)", 15.0, 50.0, 25.0, 1.0)

    # -----------------------------------------------------------------------
    # CV EXECUTION PIPELINE
    # -----------------------------------------------------------------------
    cv_engine = GlacialLakeCVEngine(darkness_threshold=cv_threshold, min_lake_area=min_area)
    res_t0 = cv_engine.process_image(img_t0)
    res_t1 = cv_engine.process_image(img_t1)

    # Risk evaluation
    risk_info = calculate_glof_risk(
        area_t0=res_t0["surface_area_px"],
        area_t1=res_t1["surface_area_px"],
        warning_limit=warning_thresh,
        critical_limit=critical_thresh
    )

    # -----------------------------------------------------------------------
    # MAIN DASHBOARD CONTENT
    # -----------------------------------------------------------------------
    st.markdown('<div class="main-header">🌊 GLOF & Flash Flood Predictive Early-Warning System</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Automated Satellite Computer Vision Moraine Lake Delineation & Rapid Outburst Risk Assessment</div>', unsafe_allow_html=True)

    # Real-time Metric Cards
    m1, m2, m3, m4, m5 = st.columns(5)
    with m1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Baseline Area (t0)</div>
            <div class="metric-value">{res_t0['surface_area_px']:,.0f} <span style="font-size:1rem;color:#64748b;">px²</span></div>
        </div>
        """, unsafe_allow_html=True)
    with m2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Current Area (t1)</div>
            <div class="metric-value">{res_t1['surface_area_px']:,.0f} <span style="font-size:1rem;color:#64748b;">px²</span></div>
        </div>
        """, unsafe_allow_html=True)
    with m3:
        delta_sign = "+" if risk_info['delta_px'] >= 0 else ""
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Net Expansion</div>
            <div class="metric-value" style="color: {risk_info['badge_color']};">{delta_sign}{risk_info['delta_px']:,.0f} <span style="font-size:1rem;">px²</span></div>
        </div>
        """, unsafe_allow_html=True)
    with m4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Expansion Rate</div>
            <div class="metric-value" style="color: {risk_info['badge_color']};">{risk_info['expansion_pct']:+.1f}%</div>
        </div>
        """, unsafe_allow_html=True)
    with m5:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Current Risk Level</div>
            <div style="margin-top: 6px;">
                <span class="risk-badge" style="background-color: {risk_info['badge_color']};">
                    {risk_info['status']} ({risk_info['alert_level']})
                </span>
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.write("")

    # Protocol Action Banner
    if risk_info['status'] == "Safe":
        st.success(f"**STATUS SAFE:** {risk_info['action']}")
    elif risk_info['status'] == "Warning":
        st.warning(f"**ALERT WARNING:** {risk_info['action']}")
    else:
        st.error(f"**CRITICAL DANGER DETECTED:** {risk_info['action']}")

    st.divider()

    # -----------------------------------------------------------------------
    # VISUAL COMPARISON TABS
    # -----------------------------------------------------------------------
    st.subheader("Visual Contour Comparison & Moraine Expansion Mapping")
    col_left, col_right, col_diff = st.columns(3)

    with col_left:
        st.markdown("##### Baseline Delineation ($t_0$)")
        st.image(res_t0["overlay"], caption=f"Contours Detected: {res_t0['num_water_bodies']} | Area: {res_t0['surface_area_px']:,.0f} px²", use_container_width=True)

    with col_right:
        st.markdown("##### Current Swollen Delineation ($t_1$)")
        st.image(res_t1["overlay"], caption=f"Contours Detected: {res_t1['num_water_bodies']} | Area: {res_t1['surface_area_px']:,.0f} px²", use_container_width=True)

    with col_diff:
        st.markdown("##### Expansion Delta Heatmap")
        # Submersion difference mask: pixels submerged in t1 but not in t0
        expansion_mask = cv2.subtract(res_t1["mask"], res_t0["mask"])
        diff_overlay = res_t1["rgb"].copy()
        # Tint newly submerged moraine in vivid hot red
        diff_overlay[expansion_mask > 0] = [255, 30, 30]
        st.image(diff_overlay, caption="Submerged Moraine Zone (Red = New Water)", use_container_width=True)

    # -----------------------------------------------------------------------
    # EMERGENCY PROTOCOL DISPATCH SIMULATION
    # -----------------------------------------------------------------------
    st.divider()
    st.subheader("🚨 Emergency Protocol & Rapid Dispatch Console")

    c_btn, c_logs = st.columns([1, 2])

    with c_btn:
        st.write("Authorize and broadcast early-warning sirens, telemetry alerts, and automated dam drainage advisory to downstream districts.")
        trigger_pressed = st.button("Trigger Emergency Protocol / Dispatch Early Warning", type="primary", use_container_width=True)

    with c_logs:
        log_placeholder = st.empty()
        
        # Initial status before click
        if "dispatch_history" not in st.session_state:
            st.session_state.dispatch_history = [
                f"[{datetime.now().strftime('%H:%M:%S')}] System Initialized: Satellite polling active at 15-minute interval."
            ]

        if trigger_pressed:
            now_str = datetime.now().strftime('%H:%M:%S')
            alert_logs = [
                f"[{now_str}] 🔴 DISPATCH INITIATED by Operator.",
                f"[{now_str}] Risk Index: {risk_info['status']} (Expansion: {risk_info['expansion_pct']:+.1f}% | Δ: {risk_info['delta_px']:,.0f} px²)",
                f"[{now_str}] Sending High-Priority CAP XML Alert to State Disaster Control Room...",
                f"[{now_str}] 📢 Activating 4 downstream early-warning acoustic sirens (Valley Reach A & B).",
                f"[{now_str}] 🌊 Hydroelectric Dam Authority: Recommended spillway gate opening by 18% to absorb surge wave.",
                f"[{now_str}] 📡 Automated SMS geo-broadcast queued for 12 vulnerable downstream panchayats."
            ]
            st.session_state.dispatch_history.extend(alert_logs)
            st.success("Emergency Protocol Dispatched Successfully!")

        # Render recent logs box
        log_content = "\n".join(st.session_state.dispatch_history[-8:])
        log_placeholder.text_area("Live Early-Warning Dispatch Audit Trail", value=log_content, height=180)

    # -----------------------------------------------------------------------
    # HACKATHON TELEMETRY EXPORT
    # -----------------------------------------------------------------------
    st.divider()
    with st.expander("📊 View Detailed Incident Telemetry & Export Data"):
        telemetry_df = pd.DataFrame([{
            "Timestamp": datetime.now().isoformat(),
            "Baseline_Area_px": res_t0["surface_area_px"],
            "Current_Area_px": res_t1["surface_area_px"],
            "Delta_Area_px": risk_info["delta_px"],
            "Expansion_Rate_Pct": round(risk_info["expansion_pct"], 2),
            "Risk_Classification": risk_info["status"],
            "Warning_Threshold_Pct": warning_thresh,
            "Critical_Threshold_Pct": critical_thresh
        }])
        st.dataframe(telemetry_df, use_container_width=True)
        csv_data = telemetry_df.to_csv(index=False).encode('utf-8')
        st.download_button("Download Incident Summary (CSV)", data=csv_data, file_name="glof_incident_report.csv", mime="text/csv")


if __name__ == "__main__":
    main()
