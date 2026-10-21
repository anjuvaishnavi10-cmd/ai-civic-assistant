/**
 * AI Civic Assistant - Core Application Logic
 * 
 * BTech CSE Project-Based Learning (PBL) Prototype
 * Shared functionality for navigation, simulated AI inference,
 * complaint submission, real-time status tracking, and admin controls.
 */

// Preset mock data for 1-click testing during college viva
const PRESET_ISSUES = {
  pothole: {
    category: 'Pothole',
    priority: 'High',
    location: 'Outer Ring Road, Near Flyover Pillar #48',
    coordinates: { lat: 12.975642, lng: 77.606734, accuracy: 8 },
    description: 'Deep road crater in the fast lane causing severe vehicle shocks and two-wheeler accidents.',
    image: 'assets/images/pothole.svg',
    detectedObject: 'Asphalt Pothole Cavity',
    confidence: 95.4,
    recommendedPriority: 'High',
    technicalNote: 'Feature map matches asphalt void texture pattern (bounding box: [x:120, y:180, w:320, h:160]).'
  },
  garbage: {
    category: 'Garbage',
    priority: 'Medium',
    location: 'Sector 5 Main Bazaar, Opposite Community Hall',
    coordinates: { lat: 12.924911, lng: 77.585522, accuracy: 12 },
    description: 'Unattended community garbage heap overflowing onto walking path and attracting stray animals.',
    image: 'assets/images/garbage.svg',
    detectedObject: 'Overflowing Municipal Solid Waste',
    confidence: 96.8,
    recommendedPriority: 'Medium',
    technicalNote: 'Identified scattered organic and plastic waste volume exceeding dumpster capacity.'
  },
  streetlight: {
    category: 'Streetlight',
    priority: 'High',
    location: 'Nehru Nagar, 4th Cross, Near Park Gate',
    coordinates: { lat: 12.991205, lng: 77.552140, accuracy: 15 },
    description: 'Streetlight lamp broken and dangling with live wires hanging; completely unlit road stretch.',
    image: 'assets/images/streetlight.svg',
    detectedObject: 'Damaged Luminaire Fixture',
    confidence: 92.3,
    recommendedPriority: 'High',
    technicalNote: 'Electrical conduit disruption and tilt angle deviation (+35°) detected.'
  },
  water_leak: {
    category: 'Water Leakage',
    priority: 'High',
    location: 'Civil Lines Road, Near Water Works Department',
    coordinates: { lat: 12.951733, lng: 77.699105, accuracy: 10 },
    description: 'Sub-surface distribution pipe ruptured; pressurized water flooding pedestrian pathway.',
    image: 'assets/images/water_leak.svg',
    detectedObject: 'High-Pressure Pipe Rupture & Water Ponding',
    confidence: 94.1,
    recommendedPriority: 'High',
    technicalNote: 'Fluid surface reflection and hydraulic spray plume classified with high confidence.'
  },
  manhole: {
    category: 'Open Manhole',
    priority: 'High',
    location: 'Gandhi Chowk, Near Central Library Footpath',
    coordinates: { lat: 12.978419, lng: 77.572308, accuracy: 6 },
    description: 'Open sewer drain without cover on pedestrian pathway; dangerous fall hazard.',
    image: 'assets/images/manhole.svg',
    detectedObject: 'Uncovered Subterranean Manhole Pit',
    confidence: 98.6,
    recommendedPriority: 'High',
    technicalNote: 'Critical void detection: High-contrast circular opening without protective grate.'
  }
};

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   Mobile Navigation Menu Toggle
   ========================================================================== */
function setupMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }
}

/* ==========================================================================
   1. Homepage Logic
   ========================================================================== */
function initHomePage() {
  const stats = getComplaintStats();

  const totalEl = document.getElementById('home-stat-total');
  const pendingEl = document.getElementById('home-stat-pending');
  const resolvedEl = document.getElementById('home-stat-resolved');

  if (totalEl) totalEl.textContent = stats.total;
  if (pendingEl) pendingEl.textContent = stats.pending + stats.inProgress; // Open issues
  if (resolvedEl) resolvedEl.textContent = stats.resolved;

  // Render recent activity list
  const recentContainer = document.getElementById('home-recent-complaints');
  if (recentContainer) {
    const all = getAllComplaints();
    const recent = all.slice(0, 3); // top 3

    if (recent.length === 0) {
      recentContainer.innerHTML = `<p class="text-muted">No complaints recorded yet.</p>`;
      return;
    }

    recentContainer.innerHTML = recent.map(item => `
      <div class="stat-card" style="padding: 1.25rem; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="${item.image}" alt="${item.category}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-light);" />
          <div>
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.2rem;">
              <span class="badge badge-category">${item.category}</span>
              <span class="badge badge-${item.status.toLowerCase().replace(' ', '')}">${item.status}</span>
            </div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${item.id}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${item.location}</div>
          </div>
        </div>
        <a href="track.html?id=${item.id}" class="btn btn-secondary btn-sm">
          Track Status &rarr;
        </a>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   2. Report Issue Page Logic
   ========================================================================== */
let currentUploadedImageDataUrl = null;

function initReportPage() {
  const form = document.getElementById('report-issue-form');
  const imageInput = document.getElementById('issue-image-input');
  const dropzone = document.getElementById('upload-dropzone');
  const categorySelect = document.getElementById('issue-category');
  const prioritySelect = document.getElementById('issue-priority');
  const locationInput = document.getElementById('issue-location');
  const descriptionInput = document.getElementById('issue-description');

  // AI Card elements
  const aiViewport = document.getElementById('ai-viewport');
  const aiStatusCategory = document.getElementById('ai-detected-category');
  const aiConfidenceVal = document.getElementById('ai-confidence-val');
  const aiConfidenceFill = document.getElementById('ai-confidence-fill');
  const aiPriorityScore = document.getElementById('ai-priority-score');
  const aiNoteText = document.getElementById('ai-note-text');

  // Trigger simulated AI vision update
  function updateAiSimulation(imageSrc, categoryName, customConfidence = null, customNote = null, customPriority = null) {
    if (aiViewport) {
      aiViewport.innerHTML = `
        <img src="${imageSrc}" alt="AI Scanning Preview" />
        <div class="ai-scanner-line"></div>
        <div class="ai-bounding-box">
          <span class="ai-tag-floating">${categoryName || 'Detected Object'}</span>
        </div>
      `;
    }

    const conf = customConfidence || (89 + Math.floor(Math.random() * 9) + Number((Math.random()).toFixed(1)));
    if (aiStatusCategory) aiStatusCategory.textContent = categoryName || 'Scanning...';
    if (aiConfidenceVal) aiConfidenceVal.textContent = `${conf}%`;
    if (aiConfidenceFill) aiConfidenceFill.style.width = `${conf}%`;
    
    const prio = customPriority || prioritySelect.value || 'High';
    if (aiPriorityScore) aiPriorityScore.textContent = prio;

    if (aiNoteText) {
      aiNoteText.textContent = customNote || `Simulated YOLO/CNN: Detected feature contours matching "${categoryName}". Confidence rated high.`;
    }
  }

  // Real GPS Coordinates State
  let capturedGpsCoords = null;
  const gpsBtn = document.getElementById('use-gps-loc-btn');
  const gpsBox = document.getElementById('gps-status-box');

  /**
   * Captures real GPS coordinates using Browser Geolocation API.
   * Handles permission denial, unavailable position, timeouts, and provides retry option.
   */
  function captureRealGpsLocation() {
    if (!gpsBox) return;

    // Check if Geolocation API is supported
    if (!navigator.geolocation) {
      gpsBox.style.display = 'block';
      gpsBox.className = 'gps-status-card error';
      gpsBox.innerHTML = `
        <div class="gps-error-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>Geolocation Not Supported</span>
        </div>
        <div>Your web browser does not support the Geolocation API. Please enter the location manually.</div>
      `;
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    // Display Loading State
    gpsBox.style.display = 'block';
    gpsBox.className = 'gps-status-card loading';
    gpsBox.innerHTML = `
      <div class="gps-spinner"></div>
      <div>
        <strong>Acquiring Real GPS Position...</strong>
        <div style="font-size: 0.8rem; opacity: 0.9;">Please allow location access if prompted by your browser.</div>
      </div>
    `;

    if (gpsBtn) {
      gpsBtn.disabled = true;
      gpsBtn.innerHTML = `
        <div class="gps-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
        Locating...
      `;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      // SUCCESS CALLBACK: Real GPS Coordinates Obtained
      (position) => {
        if (gpsBtn) {
          gpsBtn.disabled = false;
          gpsBtn.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 2px;">
              <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
            Update Location
          `;
        }

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;
        const timestamp = new Date(position.timestamp || Date.now()).toISOString();

        capturedGpsCoords = { lat, lng, accuracy, timestamp };

        // Populate location input field
        const coordsStr = `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        if (!locationInput.value || locationInput.value.startsWith('GPS:') || locationInput.value.includes('(')) {
          locationInput.value = coordsStr;
        } else {
          locationInput.value = `${locationInput.value} (${coordsStr})`;
        }

        // Display Success Coordinates Card
        gpsBox.className = 'gps-status-card success';
        gpsBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; margin-bottom: 0.25rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>GPS Location Captured</span>
                ${accuracy ? `<span class="badge" style="background: #ffffff; color: #065f46; border: 1px solid #a7f3d0; font-size: 0.72rem; padding: 0.1rem 0.45rem;">±${accuracy}m accuracy</span>` : ''}
              </div>
              <div style="font-size: 0.9rem; margin-top: 0.35rem;">
                Latitude: <span class="gps-coord-value">${lat.toFixed(6)}°</span> &bull; 
                Longitude: <span class="gps-coord-value">${lng.toFixed(6)}°</span>
              </div>
            </div>
            <div class="gps-actions-row" style="margin-top: 0;">
              <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;">
                View on Map ↗
              </a>
              <button type="button" class="btn btn-outline btn-sm" id="gps-refresh-btn" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;">
                🔄 Refresh
              </button>
            </div>
          </div>
        `;

        const refreshBtn = document.getElementById('gps-refresh-btn');
        if (refreshBtn) refreshBtn.addEventListener('click', captureRealGpsLocation);

        showToast(`Real GPS Captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
      },

      // ERROR CALLBACK: Handles Denied Permission, Unavailable, Timeout
      (error) => {
        if (gpsBtn) {
          gpsBtn.disabled = false;
          gpsBtn.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 2px;">
              <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
            Use My Current Location
          `;
        }

        let errorTitle = 'Location Error';
        let errorMsg = 'Unable to retrieve your location.';
        let guidanceTip = 'You can retry or enter your address manually.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorTitle = 'Location Permission Denied';
            errorMsg = 'You denied browser location permission.';
            guidanceTip = 'To enable: Click the lock/tune icon beside your address bar, set Location to "Allow", and click Retry below.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorTitle = 'Position Unavailable';
            errorMsg = 'Location information could not be determined by your network or device.';
            guidanceTip = 'Ensure device location services or Wi-Fi are turned on, then retry.';
            break;
          case error.TIMEOUT:
            errorTitle = 'GPS Request Timed Out';
            errorMsg = 'The satellite or network location request took too long to respond.';
            guidanceTip = 'Signals may be temporarily weak. Click the Retry button below to try again.';
            break;
        }

        gpsBox.className = 'gps-status-card error';
        gpsBox.innerHTML = `
          <div class="gps-error-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>${errorTitle}</span>
          </div>
          <div style="font-size: 0.86rem; margin-bottom: 0.35rem;">${errorMsg}</div>
          <div style="font-size: 0.8rem; color: #7f1d1d; opacity: 0.9;">${guidanceTip}</div>
          <div class="gps-actions-row">
            <button type="button" class="btn btn-secondary btn-sm" id="gps-retry-btn" style="background: #ffffff; border-color: #fca5a5; color: #991b1b; padding: 0.3rem 0.8rem;">
              🔄 Retry Location Access
            </button>
          </div>
        `;

        const retryBtn = document.getElementById('gps-retry-btn');
        if (retryBtn) retryBtn.addEventListener('click', captureRealGpsLocation);

        showToast(`${errorTitle}: ${errorMsg}`, 'warning');
      },

      geoOptions
    );
  }

  // Bind GPS button click
  if (gpsBtn) {
    gpsBtn.addEventListener('click', captureRealGpsLocation);
  }

  // Handle preset sample buttons click
  const presetButtons = document.querySelectorAll('.chip-preset-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-preset');
      const preset = PRESET_ISSUES[type];
      if (!preset) return;

      currentUploadedImageDataUrl = preset.image;
      categorySelect.value = preset.category;
      prioritySelect.value = preset.priority;
      locationInput.value = preset.location;
      descriptionInput.value = preset.description;

      if (preset.coordinates) {
        capturedGpsCoords = {
          lat: preset.coordinates.lat,
          lng: preset.coordinates.lng,
          accuracy: preset.coordinates.accuracy || 10,
          timestamp: new Date().toISOString()
        };

        if (gpsBox) {
          gpsBox.style.display = 'block';
          gpsBox.className = 'gps-status-card success';
          gpsBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; flex-wrap: wrap;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; margin-bottom: 0.25rem;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Sample Preset Coordinates Attached</span>
                </div>
                <div style="font-size: 0.9rem; margin-top: 0.35rem;">
                  Latitude: <span class="gps-coord-value">${preset.coordinates.lat.toFixed(6)}°</span> &bull; 
                  Longitude: <span class="gps-coord-value">${preset.coordinates.lng.toFixed(6)}°</span>
                </div>
              </div>
              <div class="gps-actions-row" style="margin-top: 0;">
                <a href="https://www.openstreetmap.org/?mlat=${preset.coordinates.lat}&mlon=${preset.coordinates.lng}#map=17/${preset.coordinates.lat}/${preset.coordinates.lng}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;">
                  View on Map ↗
                </a>
              </div>
            </div>
          `;
        }
      }

      updateAiSimulation(preset.image, preset.category, preset.confidence, preset.technicalNote, preset.recommendedPriority);
      showToast(`Loaded sample "${preset.category}" dataset with demo coordinates!`, 'info');
    });
  });

  // Handle user file upload
  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
       reader.onload = async (event) => {
    currentUploadedImageDataUrl = event.target.result;

    aiViewport.innerHTML = `
        <img
            src="${currentUploadedImageDataUrl}"
            alt="Uploaded civic issue"
            style="width:100%; height:100%; object-fit:contain;"
        />
        <div class="ai-scanner-line"></div>
    `;

    const categoryEl = document.getElementById("ai-detected-category");
    const confidenceEl = document.getElementById("ai-confidence-val");
    const confidenceFill = document.getElementById("ai-confidence-fill");
    const severityEl = document.getElementById("ai-priority-score");

    if (categoryEl) categoryEl.textContent = "Analyzing image...";
    if (confidenceEl) confidenceEl.textContent = "--";
    if (confidenceFill) confidenceFill.style.width = "0%";
    if (severityEl) severityEl.textContent = "Analyzing...";

    try {
        const base64Image = currentUploadedImageDataUrl.split(",")[1];

        const response = await fetch("/api/detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
  image: base64Image,
  issueType: categorySelect.value.toLowerCase()
})
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Detection request failed");
        }

        const predictions = data.predictions || [];

        if (predictions.length === 0) {
            if (categoryEl) categoryEl.textContent = "No pothole detected";
            if (confidenceEl) confidenceEl.textContent = "--";
            if (confidenceFill) confidenceFill.style.width = "0%";
            if (severityEl) severityEl.textContent = "Not assessed";
            return;
        }

        const best = predictions.reduce((a, b) =>
            a.confidence > b.confidence ? a : b
        );

        const percent = Math.round(best.confidence * 1000) / 10;

        if (categoryEl) categoryEl.textContent = best.class;
        if (confidenceEl) confidenceEl.textContent = `${percent}%`;
        if (confidenceFill) confidenceFill.style.width = `${percent}%`;
        if (severityEl) severityEl.textContent = "Requires review";

        showToast("AI image analysis completed!", "success");

    } catch (error) {
        console.error("AI detection error:", error);

        if (categoryEl) categoryEl.textContent = "Detection failed";
        if (confidenceEl) confidenceEl.textContent = "--";
        if (confidenceFill) confidenceFill.style.width = "0%";
        if (severityEl) severityEl.textContent = "Not assessed";

        showToast(error.message || "Could not analyze image. Please try again.", "error");
    }
};
        reader.readAsDataURL(file);
      }
    });
  }

  // Drag and drop events on dropzone
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        imageInput.files = e.dataTransfer.files;
        const event = new Event('change');
        imageInput.dispatchEvent(event);
      }
    });
  }

  // Category select change updates AI label
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      const cat = categorySelect.value;
      const imgSrc = currentUploadedImageDataUrl || 'assets/images/pothole.svg';
      updateAiSimulation(imgSrc, cat);
    });
  }

  // Quick fill sample location helper
  const sampleLocBtn = document.getElementById('fill-sample-loc-btn');
  if (sampleLocBtn) {
    sampleLocBtn.addEventListener('click', () => {
      const locations = [
        'Station Road, Near Metro Gate #3',
        'Main Market Cross, Sector 12',
        'Gandhi Circle, In Front of Town Hall',
        'Shivaji Chowk, Ward 7',
        'Residency Road, Near Civil Hospital'
      ];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      locationInput.value = randomLoc;
      showToast('Sample location inserted', 'info');
    });
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const category = categorySelect.value;
      const description = descriptionInput.value.trim();
      const location = locationInput.value.trim();
      const priority = prioritySelect.value;
      const image = currentUploadedImageDataUrl || 'assets/images/pothole.svg';

      if (!description || !location) {
        showToast('Please fill in both the location and issue description.', 'warning');
        return;
      }

      // Add to localStorage with real coordinates if captured
      const newComplaint = addComplaint({
        category,
        description,
        location,
        coordinates: capturedGpsCoords,
        priority,
        image,
        aiConfidence: 94.8,
        aiModelNote: `AI Civic-Vision verified: ${category} tagged with ${priority} priority.`
      });

      // Display success modal
      showSuccessModal(newComplaint.id);
    });
  }
}

/**
 * Displays the modal containing the newly generated Complaint ID
 */
function showSuccessModal(complaintId) {
  const modal = document.getElementById('success-modal');
  const codeEl = document.getElementById('modal-complaint-id');
  const trackBtn = document.getElementById('modal-track-link');

  if (modal && codeEl) {
    codeEl.textContent = complaintId;
    if (trackBtn) {
      trackBtn.href = `track.html?id=${complaintId}`;
    }
    modal.classList.add('active');
  }
}

/**
 * Copies Complaint ID to clipboard
 */
function copyComplaintId(idText) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(idText).then(() => {
      showToast(`Complaint ID ${idText} copied to clipboard!`, 'success');
    }).catch(() => {
      showToast(`Complaint ID: ${idText}`, 'info');
    });
  } else {
    showToast(`Complaint ID: ${idText}`, 'info');
  }
}

/* ==========================================================================
   3. Track Complaint Page Logic
   ========================================================================== */
function initTrackPage() {
  const searchInput = document.getElementById('track-search-input');
  const searchBtn = document.getElementById('track-search-btn');
  const resultCard = document.getElementById('track-result-card');
  const emptyPrompt = document.getElementById('track-empty-prompt');
  const notFoundPrompt = document.getElementById('track-not-found-prompt');

  function renderComplaintDetails(complaint) {
    if (!complaint) {
      if (resultCard) resultCard.style.display = 'none';
      if (emptyPrompt) emptyPrompt.style.display = 'none';
      if (notFoundPrompt) notFoundPrompt.style.display = 'block';
      return;
    }

    if (emptyPrompt) emptyPrompt.style.display = 'none';
    if (notFoundPrompt) notFoundPrompt.style.display = 'none';
    if (resultCard) resultCard.style.display = 'block';

    // Populate Fields
    document.getElementById('track-display-id').textContent = complaint.id;
    
    // Status Badge
    const statusBadge = document.getElementById('track-status-badge');
    statusBadge.className = `badge badge-${complaint.status.toLowerCase().replace(' ', '')}`;
    statusBadge.textContent = complaint.status;

    // Priority Badge
    const prioBadge = document.getElementById('track-priority-badge');
    prioBadge.className = `badge badge-priority-${complaint.priority.toLowerCase()}`;
    prioBadge.textContent = `${complaint.priority} Priority`;

    // Category Badge
    const catBadge = document.getElementById('track-category-badge');
    catBadge.textContent = complaint.category;

    // Image
    const trackImg = document.getElementById('track-display-image');
    trackImg.src = complaint.image || 'assets/images/pothole.svg';
    trackImg.alt = complaint.category;

    // Info
    document.getElementById('track-display-location').textContent = complaint.location;
    document.getElementById('track-display-desc').textContent = complaint.description;
    document.getElementById('track-display-ai-score').textContent = `${complaint.aiConfidence || 94.5}% (${complaint.aiModelNote || 'Simulated AI Vision Validated'})`;
    
    // Coordinates Display & Map Link
    const coordsWrapper = document.getElementById('track-coordinates-wrapper');
    const coordsText = document.getElementById('track-display-coords');
    const coordsAccuracy = document.getElementById('track-display-accuracy');
    const mapLink = document.getElementById('track-map-link');

    if (coordsWrapper && coordsText && complaint.coordinates && complaint.coordinates.lat && complaint.coordinates.lng) {
      coordsWrapper.style.display = 'inline-flex';
      coordsText.textContent = `${Number(complaint.coordinates.lat).toFixed(6)}, ${Number(complaint.coordinates.lng).toFixed(6)}`;
      if (coordsAccuracy) {
        coordsAccuracy.textContent = complaint.coordinates.accuracy ? `(±${complaint.coordinates.accuracy}m)` : '';
      }
      if (mapLink) {
        mapLink.href = `https://www.openstreetmap.org/?mlat=${complaint.coordinates.lat}&mlon=${complaint.coordinates.lng}#map=17/${complaint.coordinates.lat}/${complaint.coordinates.lng}`;
      }
    } else if (coordsWrapper) {
      coordsWrapper.style.display = 'none';
    }

    // Date
    const dateFormatted = new Date(complaint.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    document.getElementById('track-display-date').textContent = dateFormatted;

    // Update 3-Stage Stepper
    updateStepper(complaint.status);

    // Update History Timeline
    renderHistoryTimeline(complaint.history || []);
  }

  function updateStepper(status) {
    const stagePending = document.getElementById('stepper-stage-pending');
    const stageProgress = document.getElementById('stepper-stage-progress');
    const stageResolved = document.getElementById('stepper-stage-resolved');
    const progressBar = document.getElementById('stepper-progress-bar');

    // Reset all
    [stagePending, stageProgress, stageResolved].forEach(el => {
      if (el) el.className = 'stepper-stage';
    });

    if (status === 'Pending') {
      stagePending.classList.add('active');
      if (progressBar) progressBar.style.width = '0%';
    } else if (status === 'In Progress') {
      stagePending.classList.add('completed');
      stageProgress.classList.add('active');
      if (progressBar) progressBar.style.width = '50%';
    } else if (status === 'Resolved') {
      stagePending.classList.add('completed');
      stageProgress.classList.add('completed');
      stageResolved.classList.add('active', 'completed');
      if (progressBar) progressBar.style.width = '100%';
    }
  }

  function renderHistoryTimeline(historyList) {
    const timelineContainer = document.getElementById('track-history-items');
    if (!timelineContainer) return;

    if (!historyList || historyList.length === 0) {
      timelineContainer.innerHTML = `<div class="timeline-item"><div class="timeline-text">No timeline history recorded yet.</div></div>`;
      return;
    }

    timelineContainer.innerHTML = historyList.map(item => `
      <div class="timeline-item">
        <div class="timeline-date">${item.timestamp} &bull; Stage: <strong>${item.stage}</strong></div>
        <div class="timeline-text">${item.note}</div>
      </div>
    `).join('');
  }

  function executeSearch(idQuery) {
    const clean = (idQuery || '').trim();
    if (!clean) {
      showToast('Please enter a Complaint ID to search.', 'warning');
      return;
    }
    const found = getComplaintById(clean);
    renderComplaintDetails(found);
    if (!found) {
      showToast(`Complaint ID "${clean}" not found.`, 'warning');
    }
  }

  // Click Search Button
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => executeSearch(searchInput.value));
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') executeSearch(searchInput.value);
    });
  }

  // Click quick test ID tags
  const quickTags = document.querySelectorAll('.quick-id-tag');
  quickTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const id = tag.getAttribute('data-id');
      searchInput.value = id;
      executeSearch(id);
    });
  });

  // Check URL query parameters (e.g., track.html?id=CIVIC-2026-1001)
  const urlParams = new URLSearchParams(window.location.search);
  const queryId = urlParams.get('id');
  if (queryId) {
    if (searchInput) searchInput.value = queryId;
    executeSearch(queryId);
  }
}

/* ==========================================================================
   4. Admin Dashboard Page Logic
   ========================================================================== */
function initAdminPage() {
  const stats = getComplaintStats();

  // Stats Counters
  const countTotal = document.getElementById('admin-count-total');
  const countPending = document.getElementById('admin-count-pending');
  const countProgress = document.getElementById('admin-count-progress');
  const countResolved = document.getElementById('admin-count-resolved');

  function refreshAdminStats() {
    const s = getComplaintStats();
    if (countTotal) countTotal.textContent = s.total;
    if (countPending) countPending.textContent = s.pending;
    if (countProgress) countProgress.textContent = s.inProgress;
    if (countResolved) countResolved.textContent = s.resolved;
  }

  refreshAdminStats();

  // Filters & Search
  const categoryFilter = document.getElementById('admin-filter-category');
  const statusFilter = document.getElementById('admin-filter-status');
  const searchInput = document.getElementById('admin-search-input');
  const tableBody = document.getElementById('admin-table-body');
  const resetBtn = document.getElementById('admin-reset-data-btn');

  function renderTable() {
    let complaints = getAllComplaints();

    const cat = categoryFilter ? categoryFilter.value : 'all';
    const stat = statusFilter ? statusFilter.value : 'all';
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    // Filter by Category
    if (cat !== 'all') {
      complaints = complaints.filter(c => c.category === cat);
    }

    // Filter by Status
    if (stat !== 'all') {
      complaints = complaints.filter(c => c.status === stat);
    }

    // Filter by Search Query (ID or Location)
    if (query) {
      complaints = complaints.filter(c => 
        c.id.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    if (!tableBody) return;

    if (complaints.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No complaints match the selected filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = complaints.map(c => `
      <tr>
        <td>
          <a href="track.html?id=${c.id}" class="table-id-link" title="Click to view live tracking">
            ${c.id}
          </a>
        </td>
        <td>
          <img src="${c.image}" alt="${c.category}" class="table-thumb" />
        </td>
        <td>
          <span class="badge badge-category">${c.category}</span>
        </td>
        <td style="max-width: 240px; font-size: 0.88rem;">
          <div style="font-weight: 600;">${c.location}</div>
          <div style="color: var(--text-muted); font-size: 0.78rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            ${c.description}
          </div>
          ${c.coordinates && c.coordinates.lat && c.coordinates.lng ? `
            <div style="margin-top: 0.35rem;">
              <a href="https://www.openstreetmap.org/?mlat=${c.coordinates.lat}&mlon=${c.coordinates.lng}#map=16/${c.coordinates.lat}/${c.coordinates.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.25rem; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.76rem; background: #ecfdf5; color: #047857; padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid #a7f3d0; text-decoration: none;" title="Open in OpenStreetMap">
                📍 ${Number(c.coordinates.lat).toFixed(4)}, ${Number(c.coordinates.lng).toFixed(4)}
                <span style="font-size: 0.7rem; opacity: 0.8;">↗</span>
              </a>
            </div>
          ` : ''}
        </td>
        <td>
          <span class="badge badge-priority-${c.priority.toLowerCase()}">
            ${c.priority}
          </span>
        </td>
        <td>
          <select 
            class="status-dropdown-select status-${c.status.replace(/\s+/g, '')}" 
            data-id="${c.id}"
            onchange="handleAdminStatusChange('${c.id}', this.value)"
          >
            <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <a href="track.html?id=${c.id}" class="btn btn-outline btn-sm" title="Track View">
              Track
            </a>
            <button class="btn btn-danger btn-sm" onclick="handleAdminDeleteComplaint('${c.id}')" title="Delete Complaint">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Event Listeners for Filters
  if (categoryFilter) categoryFilter.addEventListener('change', renderTable);
  if (statusFilter) statusFilter.addEventListener('change', renderTable);
  if (searchInput) searchInput.addEventListener('input', renderTable);

  // Reset to Sample Data Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all complaints to default sample demonstration dataset?')) {
        resetToSampleData();
        refreshAdminStats();
        renderTable();
        showToast('Reset to original sample complaints dataset.', 'success');
      }
    });
  }

  // Initial render
  renderTable();
}

/**
 * Global handler for updating complaint status from Admin table dropdown
 */
window.handleAdminStatusChange = function(complaintId, newStatus) {
  const updated = updateComplaintStatus(complaintId, newStatus);
  if (updated) {
    showToast(`Status of ${complaintId} updated to "${newStatus}"!`, 'success');
    // Re-initialize page data
    initAdminPage();
  } else {
    showToast(`Failed to update status.`, 'warning');
  }
};

/**
 * Global handler for deleting a complaint from Admin table
 */
window.handleAdminDeleteComplaint = function(complaintId) {
  if (confirm(`Are you sure you want to delete complaint ${complaintId}?`)) {
    deleteComplaint(complaintId);
    showToast(`Deleted complaint ${complaintId}`, 'info');
    initAdminPage();
  }
};

/* ==========================================================================
   Page Initialization Dispatcher
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();

  const bodyId = document.body.id;
  if (bodyId === 'page-home') {
    initHomePage();
  } else if (bodyId === 'page-report') {
    initReportPage();
  } else if (bodyId === 'page-track') {
    initTrackPage();
  } else if (bodyId === 'page-admin') {
    initAdminPage();
  }
});
