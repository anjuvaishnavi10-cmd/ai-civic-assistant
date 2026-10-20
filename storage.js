/**
 * AI Civic Assistant - Local Storage Manager
 * 
 * BTech CSE Project-Based Learning (PBL) Prototype
 * This file handles all data persistence in browser localStorage.
 * It seeds initial sample data and provides CRUD helper functions
 * so that complaints remain available even after refreshing the page.
 */

const STORAGE_KEY = 'ai_civic_complaints_v1';

// Initial sample complaints to make the prototype look populated during college review
const SAMPLE_COMPLAINTS = [
  {
    id: 'CIVIC-2026-1001',
    category: 'Pothole',
    description: 'Deep hazardous crater pothole in the middle lane causing vehicle suspension damage and motorbike skidding.',
    location: 'MG Road, Near Metro Pillar #142',
    coordinates: { lat: 12.975642, lng: 77.606734, accuracy: 8, capturedAt: '2026-10-18T10:30:00' },
    priority: 'High',
    status: 'In Progress',
    image: 'assets/images/pothole.svg',
    createdAt: '2026-10-18T10:30:00',
    aiConfidence: 94.6,
    aiModelNote: 'Detected asphalt surface cavitation (Area: ~1.2m²). Recommended Priority: High.',
    history: [
      { stage: 'Pending', timestamp: '18 Oct 2026, 10:30 AM', note: 'Complaint registered by citizen with GPS location and verified by AI vision scanner.' },
      { stage: 'In Progress', timestamp: '19 Oct 2026, 09:15 AM', note: 'Assigned to Ward 14 Road Maintenance Crew. Bitumen patch work scheduled.' }
    ]
  },
  {
    id: 'CIVIC-2026-1002',
    category: 'Garbage',
    description: 'Overflowing community waste dumpster with garbage strewn across sidewalk and generating foul smell.',
    location: 'Sector 4 Market Square, behind Central Bakery',
    coordinates: { lat: 12.924911, lng: 77.585522, accuracy: 12, capturedAt: '2026-10-16T14:20:00' },
    priority: 'Medium',
    status: 'Resolved',
    image: 'assets/images/garbage.svg',
    createdAt: '2026-10-16T14:20:00',
    aiConfidence: 96.2,
    aiModelNote: 'Detected solid waste accumulation spilling past container boundary. Priority: Medium.',
    history: [
      { stage: 'Pending', timestamp: '16 Oct 2026, 02:20 PM', note: 'Complaint logged into municipal sanitation queue.' },
      { stage: 'In Progress', timestamp: '17 Oct 2026, 08:30 AM', note: 'Sanitation compactor truck #7 dispatched for site clearance.' },
      { stage: 'Resolved', timestamp: '17 Oct 2026, 04:45 PM', note: 'Dumpster emptied, area washed with disinfectant, case closed.' }
    ]
  },
  {
    id: 'CIVIC-2026-1003',
    category: 'Streetlight',
    description: 'Streetlight head fixture broken and dangling with live wires visible; stretch of road is dark at night.',
    location: 'Greenwood Colony, 3rd Cross Road',
    coordinates: { lat: 12.991205, lng: 77.552140, accuracy: 15, capturedAt: '2026-10-20T08:15:00' },
    priority: 'High',
    status: 'Pending',
    image: 'assets/images/streetlight.svg',
    createdAt: '2026-10-20T08:15:00',
    aiConfidence: 91.8,
    aiModelNote: 'Detected detached street luminaire fixture with potential electrical hazard.',
    history: [
      { stage: 'Pending', timestamp: '20 Oct 2026, 08:15 AM', note: 'Issue recorded. High priority electrical maintenance ticket created.' }
    ]
  },
  {
    id: 'CIVIC-2026-1004',
    category: 'Water Leakage',
    description: 'Underground drinking water distribution pipeline burst spraying pressurized water and flooding pavement.',
    location: 'Ring Road Service Lane, Opposite City Hospital',
    coordinates: { lat: 12.951733, lng: 77.699105, accuracy: 10, capturedAt: '2026-10-19T16:40:00' },
    priority: 'High',
    status: 'In Progress',
    image: 'assets/images/water_leak.svg',
    createdAt: '2026-10-19T16:40:00',
    aiConfidence: 93.4,
    aiModelNote: 'Detected active pressurized hydraulic leakage on road verge. Recommended Priority: High.',
    history: [
      { stage: 'Pending', timestamp: '19 Oct 2026, 04:40 PM', note: 'Water board alert generated from citizen report.' },
      { stage: 'In Progress', timestamp: '19 Oct 2026, 06:10 PM', note: 'Main feeder valve isolated; excavation crew on site.' }
    ]
  },
  {
    id: 'CIVIC-2026-1005',
    category: 'Open Manhole',
    description: 'Sewer manhole lid missing completely on busy sidewalk; severe safety threat for pedestrians and children.',
    location: 'Station Road, near Bus Stand Gate 2',
    coordinates: { lat: 12.978419, lng: 77.572308, accuracy: 6, capturedAt: '2026-10-20T11:05:00' },
    priority: 'High',
    status: 'Pending',
    image: 'assets/images/manhole.svg',
    createdAt: '2026-10-20T11:05:00',
    aiConfidence: 98.1,
    aiModelNote: 'Critical hazard detected: Uncovered subterranean shaft on pedestrian path.',
    history: [
      { stage: 'Pending', timestamp: '20 Oct 2026, 11:05 AM', note: 'Critical incident flagged. Emergency barricade team notified.' }
    ]
  }
];

/**
 * Initializes localStorage with sample data if it doesn't exist yet.
 */
function initStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_COMPLAINTS));
    return SAMPLE_COMPLAINTS;
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
    console.error('Error parsing complaints from localStorage, resetting:', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_COMPLAINTS));
    return SAMPLE_COMPLAINTS;
  }
}

/**
 * Retrieves all complaints from localStorage.
 */
function getAllComplaints() {
  return initStorage();
}

/**
 * Finds a single complaint by its unique ID (e.g., 'CIVIC-2026-1001').
 * Case-insensitive for user friendliness.
 */
function getComplaintById(id) {
  if (!id) return null;
  const cleanId = id.trim().toUpperCase();
  const list = getAllComplaints();
  return list.find(c => c.id.toUpperCase() === cleanId) || null;
}

/**
 * Generates a unique, realistic complaint tracking ID.
 */
function generateComplaintId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CIVIC-2026-${randomNum}`;
}

/**
 * Formats a Date object into readable display string (e.g., "20 Oct 2026, 05:30 PM").
 */
function formatDisplayDate(date = new Date()) {
  const options = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  return date.toLocaleDateString('en-GB', options);
}

/**
 * Adds a new citizen complaint and saves to localStorage.
 */
function addComplaint(data) {
  const complaints = getAllComplaints();
  const newId = generateComplaintId();
  const now = new Date();

  const newComplaint = {
    id: newId,
    category: data.category || 'Pothole',
    description: data.description || 'No description provided.',
    location: data.location || 'Location not specified',
    coordinates: data.coordinates ? {
      lat: Number(data.coordinates.lat),
      lng: Number(data.coordinates.lng),
      accuracy: data.coordinates.accuracy ? Math.round(Number(data.coordinates.accuracy)) : null,
      capturedAt: data.coordinates.capturedAt || now.toISOString()
    } : null,
    priority: data.priority || 'Medium',
    status: 'Pending',
    image: data.image || 'assets/images/pothole.svg',
    createdAt: now.toISOString(),
    aiConfidence: data.aiConfidence || Number((88 + Math.random() * 10).toFixed(1)),
    aiModelNote: data.aiModelNote || `Simulated AI Detection: Confirmed ${data.category || 'civic issue'} with high confidence.`,
    history: [
      {
        stage: 'Pending',
        timestamp: formatDisplayDate(now),
        note: data.coordinates 
          ? `Complaint registered with real GPS coordinates (${Number(data.coordinates.lat).toFixed(5)}, ${Number(data.coordinates.lng).toFixed(5)}) and queued for departmental verification.`
          : 'Complaint submitted by citizen and queued for departmental verification.'
      }
    ]
  };

  // Add to beginning of array so newest appears first
  complaints.unshift(newComplaint);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  return newComplaint;
}

/**
 * Updates the status of an existing complaint ('Pending', 'In Progress', 'Resolved').
 * Adds a timestamped entry to the complaint history log.
 */
function updateComplaintStatus(id, newStatus, optionalNote = '') {
  const complaints = getAllComplaints();
  const index = complaints.findIndex(c => c.id.toUpperCase() === id.trim().toUpperCase());
  
  if (index === -1) return null;

  const validStatuses = ['Pending', 'In Progress', 'Resolved'];
  if (!validStatuses.includes(newStatus)) return null;

  const complaint = complaints[index];
  const oldStatus = complaint.status;
  complaint.status = newStatus;

  // Generate automated note if not provided
  let note = optionalNote;
  if (!note) {
    if (newStatus === 'In Progress') {
      note = `Status updated from ${oldStatus} to In Progress. Field crew allocated.`;
    } else if (newStatus === 'Resolved') {
      note = `Work verified and completed by Municipal Maintenance Dept. Issue resolved.`;
    } else {
      note = `Status set back to Pending for administrative re-review.`;
    }
  }

  // Ensure history array exists
  if (!Array.isArray(complaint.history)) {
    complaint.history = [];
  }

  complaint.history.push({
    stage: newStatus,
    timestamp: formatDisplayDate(new Date()),
    note: note
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  return complaint;
}

/**
 * Deletes a complaint (useful for Admin demonstration).
 */
function deleteComplaint(id) {
  let complaints = getAllComplaints();
  complaints = complaints.filter(c => c.id.toUpperCase() !== id.trim().toUpperCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  return true;
}

/**
 * Resets localStorage to the default initial sample complaints.
 */
function resetToSampleData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_COMPLAINTS));
  return SAMPLE_COMPLAINTS;
}

/**
 * Returns dynamic summary statistics.
 */
function getComplaintStats() {
  const complaints = getAllComplaints();
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  return { total, pending, inProgress, resolved };
}

// Auto-initialize when loaded
initStorage();
