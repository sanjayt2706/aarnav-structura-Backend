import { Parser as CsvParser } from "json2csv";
import ExcelJS from "exceljs";

export function toCsv(rows, fields) {
  const parser = new CsvParser({ fields });
  return parser.parse(rows);
}

export async function toExcelBuffer(rows, columns, sheetName = "Sheet1") {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: c.width || 20 }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((r) => sheet.addRow(r));
  return workbook.xlsx.writeBuffer();
} 
