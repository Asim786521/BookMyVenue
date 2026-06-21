export function parseDateToUTC(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
 console.log("PARSE INPUT DATE:", { year, month, day });
  return new Date(Date.UTC(year, month - 1, day));
}