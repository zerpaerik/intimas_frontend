/** Descarga una tabla como CSV que Excel abre directo (separador ";" + BOM UTF-8 para tildes). */
export function downloadCSV(
  filename: string,
  columns: string[],
  rows: (string | number | null | undefined)[][],
) {
  const esc = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const sep = ";";
  const bom = "﻿";
  const content = bom + [columns, ...rows].map((r) => r.map(esc).join(sep)).join("\r\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
