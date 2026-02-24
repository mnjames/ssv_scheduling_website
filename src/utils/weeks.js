const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function toISO(d) {
  // Returns YYYY-MM-DD using local time (avoids UTC offset issues)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function generateWeeks() {
  const weeks = [];
  // Feb 23, 2026 is a Monday — first week
  const start = new Date(2026, 1, 23);
  // Last week must start on or before Sep 30, 2026
  const endLimit = new Date(2026, 8, 30);

  let cur = new Date(start);
  while (cur <= endLimit) {
    const mon = new Date(cur);
    const fri = new Date(cur);
    fri.setDate(fri.getDate() + 4);
    weeks.push({
      id: toISO(mon),
      label: `${fmt(mon)} – ${fmt(fri)}`,
      start: mon,
      end: fri,
    });
    cur.setDate(cur.getDate() + 7);
  }
  return weeks;
}

export function getCurrentWeekId() {
  const today = new Date();
  // Find the Monday of the current week
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  const y = mon.getFullYear();
  const m = String(mon.getMonth() + 1).padStart(2, "0");
  const d = String(mon.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
