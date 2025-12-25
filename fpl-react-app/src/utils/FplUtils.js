export function getCurrentGameweek(events) {
  if (!events) return null;

  const current = events.find((e) => e.is_current);
  const next = events.find((e) => e.is_next);

  return current || next || events[0];
}

// --- Calculate Free Transfers ---
export function calculateFreeTransfers(historyData) {
  if (
    !historyData ||
    !historyData.current ||
    historyData.current.length === 0
  ) {
    return 1;
  }

  const lastGwData = historyData.current[historyData.current.length - 1];

  if (lastGwData.event_transfers === 0) {
    return 2;
  }

  return 1;
}
