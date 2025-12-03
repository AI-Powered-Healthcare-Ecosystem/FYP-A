/**
 * Format HbA1c trend values with color coding
 * For HbA1c drops: positive = good (HbA1c decreased), negative = bad (HbA1c increased)
 * @param {number|null} val - The value to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {JSX.Element|string} - Formatted value with color
 */
export const formatHbA1cTrend = (val, decimals = 0) => {
  if (val == null) return '-';
  const num = parseFloat(val);
  const color = num > 0 ? 'text-green-600' : num < 0 ? 'text-red-500' : 'text-yellow-500';
  return <span className={`font-semibold ${color}`}>{num.toFixed(decimals)}</span>;
};

/**
 * Format trend values with color coding
 * For other metrics: negative = good (decreased), positive = bad (increased)
 * @param {number|null} val - The value to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {JSX.Element|string} - Formatted value with color
 */
export const formatTrend = (val, decimals = 0) => {
  if (val == null) return '-';
  const num = parseFloat(val);
  const color = num > 0 ? 'text-red-500' : num < 0 ? 'text-green-600' : 'text-yellow-500';
  return <span className={`font-semibold ${color}`}>{num.toFixed(decimals)}</span>;
};
