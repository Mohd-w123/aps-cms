import * as XLSX from "xlsx";

export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const data = [headers, ...rows.map((row) => row.map((cell) => cell ?? ""))];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
