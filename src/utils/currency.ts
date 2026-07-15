export function detectIsIndianUser(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta';
  } catch {
    return true; // default to INR if detection fails
  }
}
