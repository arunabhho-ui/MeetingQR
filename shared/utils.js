/* Format date for display */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

/* Format time for display */
function formatTime(timeStr) {
  return timeStr;
}

/* Simple fetch wrapper */
async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}
