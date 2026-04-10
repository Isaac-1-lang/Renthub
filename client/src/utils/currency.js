/**
 * Format a number as Rwandan Francs (RWF).
 * e.g. 50000 → "RWF 50,000"
 */
export const formatRWF = (amount) => {
  if (amount == null) return "RWF 0";
  return "RWF " + Number(amount).toLocaleString("en-RW");
};
