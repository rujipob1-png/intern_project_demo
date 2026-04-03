/**
 * Parse reason field ที่อาจเก็บเป็น JSON (backward compat กับ records เก่า)
 * Records เก่าเก็บ: JSON.stringify({ reason: "text", selected_dates: [...] })
 * Records ใหม่เก็บ: plain text
 */
export function parseLeaveReason(reason) {
  if (!reason) return 'ไม่ระบุเหตุผลการลา';
  try {
    const parsed = JSON.parse(reason);
    if ('reason' in parsed) {
      return parsed.reason || 'ไม่ระบุเหตุผลการลา';
    }
  } catch (e) {
    // ไม่ใช่ JSON = เป็น string ธรรมดา
  }
  return reason;
}

/**
 * Parse selected_dates จาก reason JSON (backward compat) หรือจาก column โดยตรง
 */
export function parseSelectedDates(reason, columnDates) {
  let dates = columnDates || [];
  if (Array.isArray(dates) && dates.length > 0) return dates;
  
  // ลองดึงจาก reason JSON (backward compat)
  if (reason && typeof reason === 'string') {
    try {
      const parsed = JSON.parse(reason);
      if (parsed.selected_dates && Array.isArray(parsed.selected_dates)) {
        return parsed.selected_dates;
      }
    } catch (e) {}
  }
  
  // ถ้า dates เป็น string ลอง parse
  if (typeof dates === 'string') {
    try { return JSON.parse(dates); } catch (e) { return []; }
  }
  
  return dates;
}
