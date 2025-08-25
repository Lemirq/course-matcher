export function prettifyYear(year: string | undefined | null) {
  console.log("y", year);
  if (typeof year !== "string" || !year) return "";
  return year.charAt(0).toUpperCase() + year.slice(1) + " Year";
}
