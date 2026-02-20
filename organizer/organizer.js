import { CONFIG } from "../config.js";

/* ═══════════════════════════════════════════════════════════════
   MASTER ATTENDEE LIST (hardcoded sample – replace with real list)
   This is used to calculate absent attendees in the report.
   ═══════════════════════════════════════════════════════════════ */


/* Base64-encoded MAHE logo for email embedding */
const LOGO_B64 = "data:image/png;base64,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";

/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
   ═══════════════════════════════════════════════════════════════ */
function toast(message, type = "success", duration = 3500) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;";
    document.body.appendChild(container);
  }
  const icons = {
    success: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
    error:   `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };
  const colors = {
    success: { bg:"#f0fdf4", border:"#86efac", text:"#166534", icon:"#22c55e" },
    error:   { bg:"#fef2f2", border:"#fca5a5", text:"#991b1b", icon:"#ef4444" },
    info:    { bg:"#eff6ff", border:"#93c5fd", text:"#1e40af", icon:"#3b82f6" },
    warning: { bg:"#fffbeb", border:"#fcd34d", text:"#92400e", icon:"#f59e0b" },
  };
  const c = colors[type] || colors.info;
  const t = document.createElement("div");
  t.style.cssText = `pointer-events:auto;display:flex;align-items:center;gap:10px;background:${c.bg};border:1.5px solid ${c.border};color:${c.text};padding:12px 16px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,0.1);min-width:260px;max-width:340px;font-family:'Inter',sans-serif;transform:translateX(120%);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);`;
  t.innerHTML = `<span style="color:${c.icon};flex-shrink:0">${icons[type]}</span><span style="flex:1">${message}</span>`;
  container.appendChild(t);
  requestAnimationFrame(() => { t.style.transform = "translateX(0)"; });
  setTimeout(() => { t.style.transform = "translateX(120%)"; setTimeout(() => t.remove(), 300); }, duration);
}

/* ── Field error helpers ── */
function fieldError(el, message) {
  el.style.borderColor = "#ef4444";
  el.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.15)";
  let hint = el.nextElementSibling;
  if (!hint || !hint.classList.contains("field-hint")) {
    hint = document.createElement("p");
    hint.className = "field-hint";
    hint.style.cssText = "font-size:11px;color:#ef4444;margin:4px 0 0 2px;font-family:'Inter',sans-serif;";
    el.parentNode.insertBefore(hint, el.nextSibling);
  }
  hint.textContent = message;
  el.addEventListener("input", () => { el.style.borderColor = ""; el.style.boxShadow = ""; hint.remove(); }, { once: true });
}

/* ── Loading state ── */
function setButtonLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<span class="spinner"></span> Loading…`;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) button.innerHTML = button.dataset.originalText;
  }
}

/* ═══════════════════════════════════════════════════════════════
   SOLUTION 1: Persistent subtle indicator BELOW the Save button
   No border, no box — just a small green check + text that stays
   until clearSaveIndicator() is called (e.g. on new event).
   ═══════════════════════════════════════════════════════════════ */
function showSaveIndicatorSol1(eventName) {
  const pill = document.getElementById("saveStatusPill");
  const text = document.getElementById("saveStatusText");
  if (!pill || !text) return;
  text.textContent = `"${eventName}" saved`;
  pill.style.display = "flex";
}
function showLocationIndicator(text) {
  const pill = document.getElementById("locationStatusPill");
  const label = document.getElementById("locationStatusText");
  if (!pill || !label) return;
  label.textContent = text || "Location set";
  pill.style.display = "flex";
}
function clearLocationIndicator() {
  const pill = document.getElementById("locationStatusPill");
  if (pill) pill.style.display = "none";
}

function clearSaveIndicator() {
  const pill = document.getElementById("saveStatusPill");
  if (pill) pill.style.display = "none";
}

/* ═══════════════════════════════════════════════════════════════
   SOLUTION 2: Toast only — no inline element at all.
   To use Solution 2, comment out showSaveIndicatorSol1() inside
   saveEvent() and keep only the toast() call.
   ═══════════════════════════════════════════════════════════════ */

/* ── Helpers ── */
function updateLocationFromStorage() {
  const saved = localStorage.getItem("locationConfig");
  if (saved) { try { CONFIG.location = JSON.parse(saved); } catch(e) {} }
}
function readStoredLocation() {
  const saved = localStorage.getItem("locationConfig");
  if (!saved) return null;
  try { const c = JSON.parse(saved); if (c && typeof c.latitude === "number") return c; } catch(e) {}
  return null;
}
function loadEventState() {
  ["eventName","eventDate","startTime","duration"].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = "";
  });
  localStorage.removeItem("locationConfig");
  const pre = document.getElementById("presetSelected"); if (pre) pre.innerHTML = "";
  clearSaveIndicator();
  clearLocationIndicator();
}
function getCurrentTime() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;
}

/* ── Save event details ── */
function saveEvent() {
  const nameEl = document.getElementById("eventName");
  const dateEl = document.getElementById("eventDate");
  const timeEl = document.getElementById("startTime");
  const durEl  = document.getElementById("duration");
  let valid = true;
  if (!nameEl.value.trim()) { fieldError(nameEl, "Event name is required"); valid = false; }
  if (!dateEl.value)        { fieldError(dateEl, "Date is required");       valid = false; }
  if (!timeEl.value)        { fieldError(timeEl, "Start time is required"); valid = false; }
  if (!durEl.value)         { fieldError(durEl,  "Duration is required");   valid = false; }
  if (!valid) { toast("Please fill in all event details", "error"); return; }

  CONFIG.event = { name: nameEl.value.trim(), date: dateEl.value, startTime: timeEl.value, durationMinutes: parseInt(durEl.value) };
  localStorage.setItem("eventConfig", JSON.stringify(CONFIG.event));

  /* SOLUTION 1 — persistent pill below button (no box): */
  showSaveIndicatorSol1(nameEl.value.trim());

  /* SOLUTION 2 — toast only (comment above line, uncomment nothing extra): */
  toast("Event details saved!", "success");

  updateQRButtonState();
}

/* ── QR button state ── */
function updateQRButtonState() {
  const eventName = document.getElementById("eventName")?.value.trim();
  const eventDate = document.getElementById("eventDate")?.value;
  const startTime = document.getElementById("startTime")?.value;
  const duration  = document.getElementById("duration")?.value;
  const hasEvent  = !!(eventName && eventDate && startTime && duration);
  const hasLoc    = !!readStoredLocation();
  const btn  = document.getElementById("generateQR");
  const hint = document.getElementById("qrStatusHint");
  if (hasEvent && hasLoc) {
    if (btn) btn.disabled = false;
    if (hint) hint.style.display = "none";
  } else {
    if (btn) btn.disabled = true;
    if (hint) {
      const m = [];
      if (!hasEvent) m.push("event details");
      if (!hasLoc)   m.push("location");
      hint.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px">warning</span> Please set: ${m.join(" and ")}`;
      hint.style.display = "flex";
    }
  }
}

/* ── Date / time pickers ── */
function initializeDatePicker() {
  flatpickr("#eventDate", { enableTime:false, dateFormat:"Y-m-d", altInput:true, altFormat:"d-m-Y", minDate:"today", allowInput:false });
}
function initializeTimePicker() {
  const t = document.getElementById("startTime");
  if (t) t.addEventListener("change", updateQRButtonState);
}

/* ── Location ── */
function openLocationPage() { window.open("map.html","_blank","width=1200,height=800"); }
function setPresetLocation(name) {
  const presets = {
    AB5: { latitude:13.125128055616079, longitude:77.58987820483807, radius:50 },
    AB4: { latitude:13.12528478397818,  longitude:77.59058362580247, radius:50 },
  };
  const p = presets[name]; if (!p) return;
  try {
    localStorage.setItem("locationConfig", JSON.stringify(p));
    CONFIG.location = p;
    const el = document.getElementById("presetSelected");
    if (el) el.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg> ${name} selected`;
    showLocationIndicator(`${name} preset selected`);
    toast(`Location set to ${name}`, "success");
    updateQRButtonState();
  } catch(err) { toast("Failed to set preset location", "error"); }
}

/* ── Generate QR ── */
async function generateQR() {
  setButtonLoading("generateQR", true);
  try {
    try {
      await fetch(CONFIG.mailerScriptURL, { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:"action=clearAttendance" });
    } catch(e) { console.warn("Clear failed:", e); }

    const eventName = document.getElementById("eventName").value.trim();
    const eventDate = document.getElementById("eventDate").value;
    const startTime = document.getElementById("startTime").value;
    const duration  = document.getElementById("duration").value;
    if (!eventName || !eventDate || !startTime || !duration) { toast("Fill all event details first", "error"); return; }
    const loc = readStoredLocation();
    if (!loc) { toast("Set location first (use presets or the map)", "error"); return; }
    CONFIG.event = { name: eventName, date: eventDate, startTime, durationMinutes: parseInt(duration) };
    CONFIG.location = loc;

    // Calculate base path dynamically to remove hardcoded /MeetingQR/
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/organizer/'));
    const url = `${window.location.origin}${basePath}/attendee/index.html`
    + `?event=${encodeURIComponent(eventName)}`
    + `&lat=${loc.latitude}`
    + `&lng=${loc.longitude}`
    + `&radius=${loc.radius}`
    + `&date=${CONFIG.event.date}`
    + `&startTime=${CONFIG.event.startTime}`
    + `&duration=${CONFIG.event.durationMinutes}`;
    document.getElementById("qrImage").src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    document.getElementById("qrSection").style.display = "block";
    const titleEl = document.getElementById("eventTitle");
    if (titleEl) titleEl.textContent = eventName;
    toast("QR code generated!", "success");
    try { startQRTimer(); } catch(e) {}
    scheduleDirectorEmail();
  } finally { setButtonLoading("generateQR", false); }
}

function startQRTimer() {
  const event = CONFIG.event; if (!event) return;
  const start = new Date(`${event.date}T${event.startTime}`);
  const end   = new Date(start.getTime() + event.durationMinutes * 60000);
  const update = () => {
    const now = new Date(); const el = document.getElementById("qrTimer"); if (!el) return;
    if (now < start)     el.innerHTML = `⏳ Starts in ${fmt(start)}`;
    else if (now > end)  el.innerHTML = `⏹️ Event ended`;
    else                 el.innerHTML = `✅ Active — ${fmt(end)} remaining`;
  };
  update(); setInterval(update, 1000);
}
function fmt(d) {
  const ms = d - new Date();
  if (ms < 0) return "ended";
  const h = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000), s = Math.floor((ms%60000)/1000);
  if (h > 0) return `${h}h ${m}m`; if (m > 0) return `${m}m ${s}s`; return `${s}s`;
}

/* ── Download QR ── */
async function downloadQR() {
  try {
    const qrImage = document.getElementById("qrImage");
    if (!qrImage?.src) { toast("Generate a QR code first", "warning"); return; }
    const response = await fetch(qrImage.src);
    if (!response.ok) throw new Error("Fetch failed");
    const blob = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = blob; link.download = CONFIG.event?.name ? `${CONFIG.event.name}_QR.png` : "event_QR.png"; link.style.display="none";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast("QR code downloaded!", "success");
  } catch(err) { toast("Download failed: " + err.message, "error"); }
}

/* ══════════════════════════════════════════════════════════════════
   EXCEL REPORT GENERATION — xlsx-js-style (with cell colors)
   ══════════════════════════════════════════════════════════════════ */

/* Helper: create a styled cell */
function C(v, type, s) { return { v, t: type || "s", s: s || {} }; }

/* Shared style presets */
const XLS = {
  headerGold: { font:{ bold:true, color:{rgb:"FFFFFF"}, sz:11 }, fill:{fgColor:{rgb:"B67F3F"}}, alignment:{horizontal:"center",vertical:"center"}, border:{ bottom:{style:"thin",color:{rgb:"8c5e26"}} } },
  headerNavy: { font:{ bold:true, color:{rgb:"FFFFFF"}, sz:11 }, fill:{fgColor:{rgb:"2A3648"}}, alignment:{horizontal:"center",vertical:"center"}, border:{ bottom:{style:"thin",color:{rgb:"1a2436"}} } },
  titleBig:   { font:{ bold:true, sz:16, color:{rgb:"2A3648"} }, alignment:{horizontal:"center"} },
  subtitle:   { font:{ sz:11, color:{rgb:"6b7280"} }, alignment:{horizontal:"center"} },
  sectionHdr: { font:{ bold:true, sz:10, color:{rgb:"B67F3F"} }, fill:{fgColor:{rgb:"FDF6EC"}}, border:{ bottom:{style:"thin",color:{rgb:"e8d5b0"}} } },
  labelCell:  { font:{ bold:true, sz:10, color:{rgb:"374151"} }, fill:{fgColor:{rgb:"f9fafb"}} },
  valueCell:  { font:{ sz:10, color:{rgb:"1f2937"} } },
  numGold:    { font:{ bold:true, sz:14, color:{rgb:"B67F3F"} }, alignment:{horizontal:"center"} },
  numGreen:   { font:{ bold:true, sz:14, color:{rgb:"166534"} }, alignment:{horizontal:"center"} },
  numRed:     { font:{ bold:true, sz:14, color:{rgb:"991b1b"} }, alignment:{horizontal:"center"} },
  numBlue:    { font:{ bold:true, sz:14, color:{rgb:"1e40af"} }, alignment:{horizontal:"center"} },
  metaLabel:  { font:{ sz:9, color:{rgb:"9ca3af"} }, fill:{fgColor:{rgb:"f9fafb"}}, alignment:{horizontal:"center"} },
  deptGold:   { font:{ bold:true, sz:10, color:{rgb:"B67F3F"} }, alignment:{horizontal:"right"} },
  rowEven:    { font:{ sz:10, color:{rgb:"374151"} }, fill:{fgColor:{rgb:"FFFFFF"}} },
  rowOdd:     { font:{ sz:10, color:{rgb:"374151"} }, fill:{fgColor:{rgb:"FDF8F3"}} },
  rowAbsent:  { font:{ sz:10, color:{rgb:"991b1b"} }, fill:{fgColor:{rgb:"FEF2F2"}} },
  absentBadge:{ font:{ bold:true, sz:9, color:{rgb:"991b1b"} }, fill:{fgColor:{rgb:"FEF2F2"}}, alignment:{horizontal:"center"} },
  greenBadge: { font:{ bold:true, sz:9, color:{rgb:"166534"} }, fill:{fgColor:{rgb:"F0FDF4"}}, alignment:{horizontal:"center"} },
  border:     { border:{ bottom:{style:"thin",color:{rgb:"e5e7eb"}} } },
};

function styledCell(v, baseStyle, extraBorder=true) {
  const s = { ...baseStyle };
  if (extraBorder) s.border = { bottom:{style:"thin",color:{rgb:"e5e7eb"}}, ...( s.border || {}) };
  return C(v, typeof v === "number" ? "n" : "s", s);
}

async function downloadXLSX() {
  setButtonLoading("downloadCSVButton", true);
  try {
    let presentRecords = [];
    try {
      const { getAllAttendance } = await import("../firebase.js");
      presentRecords = (await getAllAttendance()) || [];
    } catch(e) { console.warn("Attendance fetch failed:", e); }

    const event = CONFIG.event || {};
    const eventName  = event.name || "Faculty Meeting";
    const eventDate  = event.date ? new Date(event.date + "T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}) : "—";
    const startTime  = event.startTime || "—";
    const duration   = event.durationMinutes ? `${event.durationMinutes} minutes` : "—";
    const totalPres = presentRecords.length;
    const generatedAt = new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true});

    const wb = XLSX.utils.book_new();

    /* ══ SHEET 1: Summary ══ */
    const sd = []; // summary data array
    const sm = []; // merges

    // Title block
    sd.push([ C("MAHE FACULTY MEETING ATTENDANCE REPORT", "s", XLS.titleBig), C("","s"), C("","s"), C("","s") ]);
    sm.push({ s:{r:0,c:0}, e:{r:0,c:3} });
    sd.push([ C("Manipal Academy of Higher Education — Faculty Meeting Attendance System","s",XLS.subtitle), C("","s"), C("","s"), C("","s") ]);
    sm.push({ s:{r:1,c:0}, e:{r:1,c:3} });
    sd.push([ C("","s"), C("","s"), C("","s"), C("","s") ]);

    // Meeting Details
    sd.push([ C("MEETING DETAILS","s",XLS.sectionHdr), C("","s",XLS.sectionHdr), C("","s",XLS.sectionHdr), C("","s",XLS.sectionHdr) ]);
    sm.push({ s:{r:3,c:0}, e:{r:3,c:3} });
    const details = [["Event Name",eventName],["Date",eventDate],["Start Time",startTime],["Duration",duration]];
    details.forEach(([l,v]) => sd.push([ C(l,"s",XLS.labelCell), C(v,"s",XLS.valueCell), C("","s"), C("","s") ]));
    sd.push([ C("","s"), C("","s"), C("","s"), C("","s") ]);

    // Statistics removed as requested - only show department breakdown below
    sd.push([ C("","s"), C("","s"), C("","s"), C("","s") ]);

    // Department breakdown with counts only
    sd.push([ C("DEPARTMENT BREAKDOWN","s",XLS.sectionHdr), C("","s",XLS.sectionHdr), C("","s",XLS.sectionHdr), C("","s",XLS.sectionHdr) ]);
    sm.push({ s:{r:sd.length-1,c:0}, e:{r:sd.length-1,c:3} });
    sd.push([
      C("Department","s",XLS.headerNavy), C("Count","s",XLS.headerNavy),
      C("","s",XLS.headerNavy),     C("","s",XLS.headerNavy)
    ]);
    
    // All departments including those with 0 attendees
    const allDepartments = ["ECE", "SOC", "Science and Humanities"];
    allDepartments.forEach((dept, i) => {
      const deptRecords = presentRecords.filter(r=>r.department===dept);
      const count = deptRecords.length;
      const rowStyle = i%2===0 ? XLS.rowEven : XLS.rowOdd;
      
      // Department row with count only (no attendee details in summary)
      sd.push([ C(dept,"s",{...rowStyle,...XLS.deptGold,...XLS.border}), C(count,"n",{...rowStyle,...XLS.numGold,...XLS.border}), C("","s"), C("","s") ]);
    });
    sd.push([ C("","s"), C("","s"), C("","s"), C("","s") ]); // spacing
    sd.push([ C("Report Generated","s",XLS.labelCell), C(generatedAt,"s",XLS.valueCell), C("","s"), C("","s") ]);
    sd.push([ C("System","s",XLS.labelCell), C("MAHE Faculty Meeting Attendance System","s",XLS.valueCell), C("","s"), C("","s") ]);

    const wsSummary = XLSX.utils.aoa_to_sheet(sd);
    wsSummary["!cols"] = [{wch:26},{wch:20},{wch:12},{wch:16}];
    wsSummary["!merges"] = sm;
    wsSummary["!rows"] = [{hpt:30},{hpt:18}]; // tall title rows
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    /* ══ SHEET 2: Present ══ */
    const presData = [[
      C("#","n",XLS.headerGold), C("Full Name","s",XLS.headerGold), C("Faculty ID","s",XLS.headerGold),
      C("Department","s",XLS.headerGold), C("Email","s",XLS.headerGold), C("Check-in Time","s",XLS.headerGold)
    ]];
    presentRecords.forEach((r,i) => {
      const rs = i%2===0 ? XLS.rowEven : XLS.rowOdd;
      const b = XLS.border;
      presData.push([
        C(i+1,"n",{...rs,...b}),
        C(r.name||"—","s",{...rs,...b}),
        C(r.facultyId||"—","s",{...rs,...b}),
        C(r.department||"—","s",{...rs,...b,font:{...rs.font,color:{rgb:"92400e"}},fill:{fgColor:{rgb:"FDF6EC"}}}),
        C(r.email||"—","s",{...rs,...b}),
        C(r.timestamp?new Date(r.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true}):"—","s",{...rs,...b}),
      ]);
    });
    if (presData.length === 1) presData.push([C("No attendees recorded","s",{font:{italic:true,color:{rgb:"9ca3af"}},alignment:{horizontal:"center"}}),C("","s"),C("","s"),C("","s"),C("","s"),C("","s")]);
    const wsPresent = XLSX.utils.aoa_to_sheet(presData);
    wsPresent["!cols"] = [{wch:4},{wch:28},{wch:16},{wch:12},{wch:30},{wch:16}];
    wsPresent["!rows"] = [{hpt:22}]; // taller header
    XLSX.utils.book_append_sheet(wb, wsPresent, "Present");

    const filename = `MAHE_${eventName.replace(/\s+/g,"_")}_Attendance.xlsx`;
    XLSX.writeFile(wb, filename);
    toast(`Downloaded: ${totalPres} attendees`, "success", 5000);
  } catch(err) {
    console.error(err);
    toast("Download failed: " + err.message, "error");
  } finally {
    setButtonLoading("downloadCSVButton", false);
  }
}


/* ══════════════════════════════════════════════════════════════════
   EMAIL BUILDER — styled HTML with logo banner
   ══════════════════════════════════════════════════════════════════ */
function buildEmailHTML(records) {
  const event = CONFIG.event || {};
  const eventName  = event.name || "Faculty Meeting";
  const eventDate  = event.date
    ? new Date(event.date + "T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}) : "—";
  const startTime  = event.startTime || "—";
  const duration   = event.durationMinutes ? `${event.durationMinutes} min` : "—";
  const totalReg = records.length;
  const absentCount = 0;
  const rate = "100%";
  
  const depts = {};
  records.forEach(r => { const d = r.department||"Other"; depts[d]=(depts[d]||0)+1; });
  const deptRows = Object.entries(depts).sort((a,b)=>b[1]-a[1]).map(([d,c],i) => `
    <tr style="background:${i%2===0?"#fff":"#fdfaf6"}">
      <td style="padding:9px 16px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6">${d}</td>
      <td style="padding:9px 16px;font-size:13px;font-weight:700;color:#B67F3F;text-align:right;border-bottom:1px solid #f3f4f6">${c}</td>
      <td style="padding:9px 16px;font-size:12px;color:#9ca3af;text-align:right;border-bottom:1px solid #f3f4f6">${((c/records.length)*100).toFixed(0)}%</td>
    </tr>`).join("");

  const attendeeRows = records.slice(0,15).map((r,i) => `
    <tr style="background:${i%2===0?"#fff":"#fdfaf6"}">
      <td style="padding:9px 14px;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6">${r.name||"—"}</td>
      <td style="padding:9px 14px;font-size:12px;color:#6b7280;border-bottom:1px solid #f3f4f6">${r.facultyId||"—"}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #f3f4f6">
        <span style="background:#FDF6EC;color:#92400e;font-size:10px;font-weight:700;padding:2px 9px;border-radius:20px;border:1px solid #e8d5b0">${r.department||"—"}</span>
      </td>
      <td style="padding:9px 14px;font-size:12px;color:#6b7280;border-bottom:1px solid #f3f4f6">${r.timestamp?new Date(r.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}):"—"}</td>
    </tr>`).join("");

  const moreNote = records.length > 15
    ? `<p style="font-size:12px;color:#9ca3af;text-align:center;padding:10px 0;font-style:italic">+ ${records.length-15} more · see attached .xlsx</p>` : "";

  const now = new Date();
  const nowStr = now.toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true});
  const year   = now.getFullYear();

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F0F2F5;font-family:'Segoe UI',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F0F2F5" style="padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- ═══ LOGO + HEADER BANNER ═══ -->
  <tr><td style="background:linear-gradient(135deg,#1e293b 0%,#2A3648 60%,#3d4f6b 100%);border-radius:16px 16px 0 0;padding:0;overflow:hidden">
    <!-- Gold top stripe -->
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:4px;background:linear-gradient(90deg,#B67F3F 0%,#d4a05a 50%,#B67F3F 100%)"></td></tr></table>
    <!-- Logo + text row -->
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="padding:28px 32px 24px" valign="middle">
        <table cellpadding="0" cellspacing="0"><tr>
          <!-- Logo circle -->
          <td style="padding-right:16px" valign="middle">
            <div style="width:64px;height:64px;background:white;border-radius:50%;display:inline-block;line-height:0;box-shadow:0 2px 12px rgba(0,0,0,0.25)">
              <img src="${LOGO_B64}" width="64" height="64" alt="MAHE" style="border-radius:50%;display:block"/>
            </div>
          </td>
          <!-- Title text -->
          <td valign="middle">
            <p style="margin:0 0 3px;font-size:10px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.15em">Manipal Academy of Higher Education</p>
            <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:white;letter-spacing:-0.02em;line-height:1.2">Faculty Attendance Report</h1>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6)">${eventName}</p>
          </td>
        </tr></table>
      </td>
      <!-- Date chip -->
      <td style="padding:28px 32px 24px 0" valign="middle" align="right">
        <table cellpadding="0" cellspacing="0" align="right">
          <tr><td style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:12px 16px;text-align:center">
            <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.45);font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Date</p>
            <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:white">${eventDate}</p>
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.4)">Generated ${nowStr}</p>
          </td></tr>
        </table>
      </td>
    </tr></table>
  </td></tr>

  <!-- ═══ BODY CARD ═══ -->
  <tr><td style="background:white;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:36px">

    <!-- Greeting -->
    <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1f2937">Dear Director,</p>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7">
      Please find the attendance report for <strong style="color:#1f2937">${eventName}</strong> held on <strong style="color:#1f2937">${eventDate}</strong> starting at <strong style="color:#1f2937">${startTime}</strong> (${duration}). The complete formatted spreadsheet is attached.
    </p>

    <!-- 4 STAT CARDS -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td width="25%" style="padding:0 5px 0 0">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDF6EC;border:1.5px solid #e8d5b0;border-radius:12px;text-align:center">
            <tr><td style="padding:18px 8px">
              <p style="margin:0 0 5px;font-size:26px;font-weight:800;color:#B67F3F">${totalReg}</p>
              <p style="margin:0;font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.08em">Registered</p>
            </td></tr>
          </table>
        </td>
        <td width="25%" style="padding:0 5px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;text-align:center">
            <tr><td style="padding:18px 8px">
              <p style="margin:0 0 5px;font-size:26px;font-weight:800;color:#16a34a">${records.length}</p>
              <p style="margin:0;font-size:10px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.08em">Present</p>
            </td></tr>
          </table>
        </td>
        <td width="25%" style="padding:0 5px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:12px;text-align:center">
            <tr><td style="padding:18px 8px">
              <p style="margin:0 0 5px;font-size:26px;font-weight:800;color:#dc2626">${absentCount}</p>
              <p style="margin:0;font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.08em">Absent</p>
            </td></tr>
          </table>
        </td>
        <td width="25%" style="padding:0 0 0 5px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:12px;text-align:center">
            <tr><td style="padding:18px 8px">
              <p style="margin:0 0 5px;font-size:26px;font-weight:800;color:#1d4ed8">${rate}</p>
              <p style="margin:0;font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.08em">Rate</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- DEPT BREAKDOWN -->
    <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.12em">Department Breakdown</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:28px">
      <tr style="background:linear-gradient(135deg,#2A3648,#1a2436)">
        <th style="padding:11px 16px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);text-align:left;text-transform:uppercase;letter-spacing:0.07em">Department</th>
        <th style="padding:11px 16px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);text-align:right;text-transform:uppercase;letter-spacing:0.07em">Present</th>
        <th style="padding:11px 16px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);text-align:right;text-transform:uppercase;letter-spacing:0.07em">Share</th>
      </tr>
      ${deptRows}
    </table>

    <!-- ATTENDEE RECORDS -->
    <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.12em">Attendee Records</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:6px">
      <tr style="background:linear-gradient(135deg,#B67F3F,#8c5e26)">
        <th style="padding:11px 14px;font-size:11px;font-weight:600;color:white;text-align:left">Name</th>
        <th style="padding:11px 14px;font-size:11px;font-weight:600;color:white;text-align:left">Faculty ID</th>
        <th style="padding:11px 14px;font-size:11px;font-weight:600;color:white;text-align:left">Dept</th>
        <th style="padding:11px 14px;font-size:11px;font-weight:600;color:white;text-align:left">Time</th>
      </tr>
      ${attendeeRows}
    </table>
    ${moreNote}

    <!-- ATTACHMENT NOTE -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-top:24px">
      <tr><td style="padding:16px 18px">
        <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">Attachment</p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px" valign="middle">
              <div style="width:40px;height:40px;background:#16a34a;border-radius:9px;text-align:center;font-size:20px;line-height:40px">📊</div>
            </td>
            <td valign="middle">
              <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#374151">MAHE_${eventName.replace(/\s+/g,"_")}_Attendance.xlsx</p>
              <p style="margin:0;font-size:11px;color:#9ca3af">3 sheets · Summary · Present</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

  </td></tr>

  <!-- ═══ FOOTER ═══ -->
  <tr><td style="padding:24px 0 0">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:20px 24px;background:white;border:1px solid #e5e7eb;border-radius:12px">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td valign="middle">
            <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#374151">MAHE Faculty Meeting Attendance Team</p>
            <p style="margin:0;font-size:12px;color:#9ca3af">Manipal Academy of Higher Education</p>
          </td>
          <td align="right" valign="middle">
            <img src="${LOGO_B64}" width="36" height="36" alt="MAHE" style="border-radius:50%;display:block;opacity:0.6"/>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:16px 0 0;text-align:center">
        <p style="margin:0 0 4px;font-size:11px;color:#9ca3af">This is an automated message from the MAHE Faculty Meeting Attendance System</p>
        <p style="margin:0;font-size:11px;color:#d1d5db">© ${year} Manipal Academy of Higher Education · All rights reserved</p>
      </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function generateWorkbook(presentRecords){

  /* ============================= */
  /* CALCULATE ABSENT RECORDS */
  /* ============================= */

  

  /* ============================= */
  /* EVENT DETAILS */
  /* ============================= */

  const event = CONFIG.event || {};

  const eventName =
    event.name || "Faculty Meeting";

  const eventDate =
    event.date
      ? new Date(event.date+"T00:00:00")
          .toLocaleDateString("en-IN",
          {day:"2-digit",month:"long",year:"numeric"})
      : "—";

  const startTime =
    event.startTime || "—";

  const duration =
    event.durationMinutes
      ? `${event.durationMinutes} minutes`
      : "—";

  const generatedAt =
    new Date().toLocaleString("en-IN");


  /* ============================= */
  /* CREATE WORKBOOK */
  /* ============================= */

  const wb = XLSX.utils.book_new();


  /* ============================= */
  /* SUMMARY SHEET */
  /* ============================= */

  const sd = [];
  const sm = [];

  sd.push([
    C("MAHE FACULTY MEETING ATTENDANCE REPORT","s",XLS.titleBig),
    C("","s"),C("","s"),C("","s")
  ]);

  sm.push({s:{r:0,c:0},e:{r:0,c:3}});

  sd.push([
    C("Manipal Academy of Higher Education","s",XLS.subtitle),
    C("","s"),C("","s"),C("","s")
  ]);

  sm.push({s:{r:1,c:0},e:{r:1,c:3}});

  sd.push(["","","",""]);

  /* ============================= */
  /* DEPARTMENT BREAKDOWN */
  /* ============================= */

  sd.push([
    C("DEPARTMENT BREAKDOWN","s",XLS.sectionHdr),
    C("","s"),C("","s"),C("","s")
  ]);

  sm.push({s:{r:sd.length-1,c:0},e:{r:sd.length-1,c:3}});

  sd.push([
    C("Department","s",XLS.headerNavy),
    C("Count","s",XLS.headerNavy),
    C("","s"),
    C("","s")
  ]);

  const allDepartments =
    ["ECE","SOC","Science and Humanities"];

  allDepartments.forEach((dept,i)=>{

    const count =
      presentRecords.filter(
        r=>r.department===dept
      ).length;

    const rowStyle =
      i%2===0 ? XLS.rowEven : XLS.rowOdd;

    sd.push([
      C(dept,"s",{...rowStyle,...XLS.deptGold}),
      C(count,"n",{...rowStyle,...XLS.numGold}),
      C("","s"),
      C("","s")
    ]);

  });

  sd.push(["","","",""]);

  /* ============================= */
  /* REPORT META */
  /* ============================= */

  sd.push([
    C("Report Generated","s",XLS.labelCell),
    C(generatedAt,"s",XLS.valueCell),
    C("","s"),C("","s")
  ]);

  sd.push([
    C("System","s",XLS.labelCell),
    C("MAHE Faculty Meeting Attendance System","s",XLS.valueCell),
    C("","s"),C("","s")
  ]);

  sm.push({s:{r:3,c:0},e:{r:3,c:3}});

  const details = [
    ["Event Name",eventName],
    ["Date",eventDate],
    ["Start Time",startTime],
    ["Duration",duration]
  ];

  details.forEach(d =>
    sd.push([
      C(d[0],"s",XLS.labelCell),
      C(d[1],"s",XLS.valueCell),
      C("","s"),C("","s")
    ])
  );

  sd.push(["","","",""]);

  sd.push([
    C("Report Generated","s",XLS.labelCell),
    C(generatedAt,"s",XLS.valueCell),
    C("","s"),C("","s")
  ]);

  const wsSummary =
    XLSX.utils.aoa_to_sheet(sd);

  wsSummary["!merges"]=sm;
  wsSummary["!cols"] = [
    {wch:26},
    {wch:18},
    {wch:12},
    {wch:12}
  ];

  XLSX.utils.book_append_sheet(
    wb,
    wsSummary,
    "Summary"
  );


  /* ============================= */
  /* PRESENT SHEET */
  /* ============================= */

  const presData = [[
    "No",
    "Name",
    "Faculty ID",
    "Department",
    "Email",
    "Time"
  ]];

  presentRecords.forEach((r,i)=>{

    presData.push([
      i+1,
      r.name||"",
      r.facultyId||"",
      r.department||"",
      r.email||"",
      r.timestamp
        ? new Date(r.timestamp)
            .toLocaleTimeString()
        : ""
    ]);

  });

  const wsPresent =
    XLSX.utils.aoa_to_sheet(presData);

  XLSX.utils.book_append_sheet(
    wb,
    wsPresent,
    "Present"
  );


  /* ============================= */
  /* ABSENT SHEET */
  /* ============================= */


  return wb;

}
/* ── Email CSV to director ── */
async function sendCSVToEmail(){

  setButtonLoading("emailCSVButton", true);

  try{

    const email =
      document.getElementById("directorEmail")
      .value.trim();

    if(!email){
      toast("Enter email", "warning");
      return;
    }


    /* ===================== */
    /* GENERATE SAME XLSX */
    /* ===================== */

    let presentRecords=[];

    const { getAllAttendance } =
      await import("../firebase.js");

    presentRecords =
      await getAllAttendance();


    /* Use your EXISTING downloadXLSX logic */
    /* But generate blob instead of download */

    const wb =
      generateWorkbook(presentRecords);

    const blob =
      XLSX.write(
        wb,
        {
          bookType:"xlsx",
          type:"array"
        }
      );

    const file =
      new Blob(
        [blob],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      );


    const base64 =
      await blobToBase64(file);


    /* ===================== */
    /* SEND TO APPS SCRIPT */
    /* ===================== */

    const response =
      await fetch(CONFIG.mailerScriptURL,{

        method:"POST",

        headers:{
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body:
          "action=sendAttendanceEmail"+
          "&email="+encodeURIComponent(email)+
          "&filename=Attendance.xlsx"+
          "&file="+encodeURIComponent(base64)

      });


    const data =
      await response.json();

    if(data.success)
      toast("Email sent", "success");
    else
      toast(data.error, "error");

  }
  catch(err){

    toast(err.message, "error");

  }
  finally{

    setButtonLoading("emailCSVButton", false);

  }

}

function blobToBase64(blob){

  return new Promise((resolve,reject)=>{

    const reader =
      new FileReader();

    reader.onloadend = () => {

      const base64 =
        reader.result.split(",")[1];

      resolve(base64);

    };

    reader.onerror=reject;

    reader.readAsDataURL(blob);

  });

}
/* ── Director auto-email ── */
function scheduleDirectorEmail() {
  const event = CONFIG.event; if (!event?.date || !event?.startTime) return;
  const end = new Date(`${event.date}T${event.startTime}`);
  end.setMinutes(end.getMinutes() + event.durationMinutes);
  const delay = end.getTime() - Date.now();
  if (delay <= 0) return;
  setTimeout(() => sendDirectorEmailWithUI(), delay);
}
async function sendDirectorEmailNow() {

  try{

    /* ===================== */
    /* GET RECORDS */
    /* ===================== */

    const { getAllAttendance } =
      await import("../firebase.js");

    const presentRecords =
      await getAllAttendance();


    /* ===================== */
    /* GENERATE XLSX */
    /* ===================== */

    const wb =
      generateWorkbook(presentRecords);

    const blobArray =
      XLSX.write(
        wb,
        {
          bookType:"xlsx",
          type:"array"
        }
      );

    const file =
      new Blob(
        [blobArray],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      );


    const base64 =
      await blobToBase64(file);


    /* ===================== */
    /* SEND TO APPS SCRIPT */
    /* ===================== */

    const response =
      await fetch(CONFIG.mailerScriptURL,{

        method:"POST",

        headers:{
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body:
          "action=sendAttendanceEmail"+
          "&email="+encodeURIComponent("arunabhho.das@gmail.com")+
          "&filename=Attendance.xlsx"+
          "&file="+encodeURIComponent(base64)

      });


    return await response.json();

  }
  catch(err){

    return {
      success:false,
      error:err.message
    };

  }

}
function showEmailStatus(msg, spinner=true) {
  const c = document.getElementById("emailStatus"), m = document.getElementById("emailMessage"), s = document.getElementById("emailSpinner");
  if (!c||!m) return;
  m.innerText = msg; if(s) s.style.display = spinner?"inline-block":"none"; c.style.display="flex";
}
function hideEmailStatus() { const c = document.getElementById("emailStatus"); if(c) c.style.display="none"; }
async function sendDirectorEmailWithUI() {
  try {
    showEmailStatus("Sending report to director…", true);
    const result = await sendDirectorEmailNow();
    if (result.success) { showEmailStatus("Report sent to director ✓", false); setTimeout(hideEmailStatus, 5000); }
    else showEmailStatus("Failed: " + (result.error||"unknown"), false);
    return result;
  } catch(err) { showEmailStatus("Failed: " + err.message, false); return { success:false, error:err.message }; }
}

/* ── DOMContentLoaded ── */
document.addEventListener("DOMContentLoaded", () => {
  loadEventState(); updateLocationFromStorage();
  const st = document.getElementById("startTime");
  if (st && !st.value) st.value = getCurrentTime();
  const qs = document.getElementById("qrSection"); if(qs) qs.style.display="none";
  const de = document.getElementById("directorEmail"); if(de) de.value="";
  initializeDatePicker(); initializeTimePicker();
  ["eventName","startTime","duration"].forEach(id => {
    const el = document.getElementById(id); if(el) el.addEventListener("input", updateQRButtonState);
  });
  const ed = document.getElementById("eventDate"); if(ed) ed.addEventListener("change", updateQRButtonState);
  updateQRButtonState();
  window.addEventListener("storage", e => {
  if (e.key === "locationConfig") {
    updateLocationFromStorage();
    updateQRButtonState();
    const loc = readStoredLocation();
    if (loc) showLocationIndicator(`Custom location set (r=${loc.radius}m)`);
  }
});
});
window.addEventListener("focus", () => { updateLocationFromStorage(); updateQRButtonState(); });

/* ── Global exports ── */
window.saveEvent = saveEvent;
window.openLocationPage = openLocationPage;
window.setPresetLocation = setPresetLocation;
window.generateQR = generateQR;
window.downloadQR = downloadQR;
window.downloadXLSX = downloadXLSX;
window.sendCSVToEmail = sendCSVToEmail;
