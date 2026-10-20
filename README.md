# 🌱 AI Civic Assistant
### BTech Computer Science & Engineering — Project-Based Learning (PBL) Prototype

> **Tagline:** *Report Civic Issues. Build a Better Community.*

---

## 📌 Project Overview

**AI Civic Assistant** is an intelligent civic-tech web prototype designed to bridge the communication gap between citizens and municipal authorities. Citizens can quickly report public infrastructure issues such as **potholes, garbage accumulation, broken streetlights, pipeline water leakage, and open manholes**. 

The prototype showcases how computer vision and automated tracking streamline civic complaint triage, prioritisation, and resolution.

---

## 🚀 Key Features

1. **Modern Green & White Civic UI:**
   - Professional, clean design built with responsive layouts for laptops, tablets, and smartphones.
   - Built with modern cards, subtle micro-animations, and clean typography.

2. **Homepage:**
   - Project overview and 3-step process (**Report → AI Vision Analysis → Municipal Resolution**).
   - Dynamic real-time statistics counters (Total, Pending, and Resolved complaints) computed live from `localStorage`.
   - Recent complaints feed with one-click tracking links.

3. **Report an Issue Page:**
   - Citizen reporting form with image upload (drag-and-drop or file picker) and live preview.
   - **Real GPS Location Capture:** Dedicated **"📍 Use My Current Location"** button utilizing the browser's native Geolocation API to fetch device latitude, longitude, and accuracy in meters.
   - Comprehensive error handling for **denied permissions, position unavailable, and timeouts** with an in-place **"🔄 Retry Location Access"** button and external OpenStreetMap verification link.
   - Quick **Sample Preset Buttons** (Pothole, Garbage, Streetlight, Water Leak, Open Manhole) for 1-click demonstration during presentations.
   - Sample address auto-fill helper button.
   - Unique Complaint ID generation upon submission (e.g., `CIVIC-2026-8491`).
   - Success modal with instant copy-to-clipboard and a direct "Track Complaint" button.

4. **Simulated AI Image Analysis Section:**
   - Real-time simulation of a computer vision model (e.g. YOLOv8 / CNN).
   - Interactive scanning laser beam animation, bounding box overlay, and confidence score meter (e.g., 95.4%).
   - Clearly labelled as a prototype simulation with academic review disclaimers.

5. **Track Complaint Page:**
   - Search by Complaint ID (e.g., `CIVIC-2026-1001`).
   - Interactive **3-Stage Visual Stepper**: `Pending` ➔ `In Progress` ➔ `Resolved`.
   - Comprehensive audit trail log with timestamps and municipal activity notes.
   - Clickable demo sample ID tags for quick testing.

6. **Admin Dashboard:**
   - Summary statistics cards (Total, Pending, In Progress, Resolved).
   - Category filter (Potholes, Garbage, Streetlights, Water Leaks, Open Manholes) and status filters.
   - Instant search bar for IDs, locations, and descriptions.
   - Interactive status dropdowns to change complaint states (`Pending` / `In Progress` / `Resolved`). Changes immediately synchronize with `localStorage` and the citizen tracking view.
   - One-click "Reset Sample Data" button to restore demo data at any time.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, Vanilla CSS3 (Custom design tokens, Flexbox, Grid), Vanilla JavaScript (ES6+).
- **Data Persistence:** Browser `localStorage` (Complaints persist across page refreshes and browser tabs without needing a complex backend database).
- **Assets:** High-resolution vector SVGs for all civic categories.
- **Server (Optional):** Zero-dependency native Node.js HTTP server (`server.js`).

---

## 📂 Project Structure

```text
ai-civic-assistant/
│
├── index.html            # Homepage (Hero, dynamic statistics, 3-step process, recent feed)
├── report.html           # Report an Issue page with AI Vision Inspector & live preview
├── track.html            # Track Complaint page with 3-stage progress stepper & audit log
├── admin.html            # Municipal Admin Dashboard with filters, status editor & data table
│
├── css/
│   └── style.css         # Master responsive stylesheet (Green & White theme, animations)
│
├── js/
│   ├── storage.js        # localStorage data manager, seed sample data & CRUD helpers
│   └── app.js            # Core logic (nav, simulated AI vision, form submission, trackers)
│
├── assets/
│   └── images/           # Clean SVG illustrations for demo civic issues
│       ├── pothole.svg
│       ├── garbage.svg
│       ├── streetlight.svg
│       ├── water_leak.svg
│       └── manhole.svg
│
├── server.js             # Optional built-in Node.js local dev server (zero dependencies)
└── README.md             # Project documentation & college review guide
```

---

## 🏃 How to Run Locally

You have **three simple ways** to run this project on any computer:

### Method 1: Direct File Open (Easiest — No Setup Needed!)
1. Open the project folder in File Explorer.
2. Double-click `index.html`.
3. It will open directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

---

### Method 2: Using the Included Node.js Server
If you have Node.js installed on your computer:
1. Open a terminal or PowerShell inside the `ai-civic-assistant` folder.
2. Run:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### Method 3: Using VS Code "Live Server"
1. Open the `ai-civic-assistant` folder in Visual Studio Code.
2. Right-click on `index.html` and select **"Open with Live Server"**.

---

## 🎯 Viva & Presentation Demonstration Guide

Follow this sequence during your project evaluation to impress your professors:

1. **Homepage:** Show the project name, tagline, and the **dynamic statistic cards**. Explain how the numbers update based on real grievances.
2. **File a Complaint (`report.html`):**
   - Click one of the sample buttons (e.g., **"🛣️ Pothole"** or **"⚠️ Open Manhole"**).
   - Point out the **AI Vision Inspector** card with its active scanning animation, bounding box, and 95%+ confidence score.
   - Explain: *"This simulates the YOLOv8 object detection model that will be deployed in Phase 2."*
   - Click **Submit Complaint**.
   - Copy the newly generated Complaint ID from the success modal.
3. **Track Complaint (`track.html`):**
   - Click **"Track This Complaint"** or paste your new ID into the search bar.
   - Show the **3-Stage Visual Stepper** starting at `Pending`.
4. **Admin Dashboard (`admin.html`):**
   - Open the Admin Dashboard to find your submitted complaint in the table.
   - Change the status dropdown from `Pending` to `In Progress` or `Resolved`.
5. **Real-time Verification:**
   - Return to the **Track Complaint** page and search your ID again.
   - Show the professor that the stepper has advanced to `In Progress` or `Resolved` with updated audit history!

---

## ❓ Frequently Asked Questions for College Viva

**Q1: How does the AI Vision Analysis work in this prototype?**
> *Answer:* In this initial prototype phase, the system provides a simulated AI Computer Vision pipeline with confidence scoring and bounding box visualization. This allows stakeholders to evaluate the citizen workflow and municipal interface before training and deploying an intensive YOLOv8 or CNN model on the backend in Phase 2.

**Q2: Where is the data stored?**
> *Answer:* The complaint records are stored client-side in browser `localStorage`. This ensures that all submitted complaints, image previews, and status updates persist even after refreshing the page or navigating between different screens, without requiring a separate database server.

**Q3: What are the planned future extensions?**
> *Answer:* 
> 1. Integration with a Python Flask/FastAPI backend hosting a trained YOLOv8 model for real-time edge image classification.
> 2. Automated GPS geolocation tagging using the browser's Geolocation API.
> 3. SMS/WhatsApp alerts to citizens when their complaint reaches the `Resolved` stage.

---

**Developed for BTech CSE PBL Academic Review** &bull; *Academic Demonstration Prototype*
