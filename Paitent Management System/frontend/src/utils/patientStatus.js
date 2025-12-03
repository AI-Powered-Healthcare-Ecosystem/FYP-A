/**
 * Determines patient status based on clinical metrics
 * @param {Object} patient - Patient object with clinical data
 * @returns {string} - Status: 'Improving', 'Worsening', 'Needs Review', or 'Stable'
 */
export const getStatusTag = (p) => {
  const hbDrop = p.reduction_a_2_3 ?? null;
  const fvgDelta = p.fvg_delta_1_2 ?? null;
  const ddsTrend = p.dds_trend_1_3 ?? null;

  if (hbDrop !== null) {
    if (hbDrop > 1.0) return 'Improving';
    if (hbDrop < 0) return 'Worsening';
  }
  if (fvgDelta !== null) {
    if (fvgDelta < -1.0) return 'Improving';
    if (fvgDelta > 1.0) return 'Worsening';
  }
  if (ddsTrend !== null && ddsTrend > 1) {
    return 'Needs Review';
  }
  return 'Stable';
};
