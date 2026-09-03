// src/utils/report-export.ts
import { formatDateNL } from "@/utils/dateFormatter";

export type PdfAlign = "left" | "center" | "right";

export type ExportColumn<T> = {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
  /** PDF layout */
  pdfWidth?: number;
  pdfAlign?: PdfAlign;
  /** XLSX layout */
  xlsxWidth?: number; // characters (wch)
  /** Number formatting for xlsx */
  isNumber?: boolean;
  xlsxNumberFormat?: string; // e.g. "0.00"
};

export type ExportMeta = {
  title: string;
  fileBaseName: string; // without extension
  generatedAt?: Date;
  filtersLine?: string;
  /** Overrides the brand title in the export header, e.g. the restaurant name. */
  resName?: string;
  /** Logo rendered in the export header. */
  logo?: string;
};

export const buildFiltersLine = (parts: Array<string | null | undefined>) =>
  parts
    .map((x) => (x ? String(x).trim() : ""))
    .filter(Boolean)
    .join("   |   ");

export type BrandOptions = {
  showBranding?: boolean; // default true
  brandTitle?: string; // default "Drum Tracer"
  logoUrl?: string; // default "/drum-tracer-logo.png" (public)
  brandColor?: string; // default "#008071"
};

type PdfOptions = {
  orientation?: "portrait" | "landscape";
  pageFormat?: "a4" | "letter";
  marginLeft?: number;
  marginRight?: number;
  /** The top Y of the content area (header starts slightly above this) */
  startY?: number;
  brand?: BrandOptions;
  /** Use fixed widths based on ExportColumn.pdfWidth (recommended true) */
  useColumnWidths?: boolean;
  watermarkText?: string;
};

type ExcelOptions = {
  sheetName?: string;
  headerFillRgb?: string; // default "E9EEF3"
  includeTotalsRow?: boolean;
  totalsLabelColIndex?: number; // 0-based index where "TOTAL" label goes
  brand?: BrandOptions;
};

// NOTE: brand defaults point at Drum Tracer / Midal Cables (this app),
// not the reference project's "Find A Table" — the logo file was copied
// to public/drum-tracer-logo.png (from src/assets/images/drum-tracer-logo.png,
// the real logo preserved from the uploaded project) specifically so it's
// fetchable by URL here, since src/assets/* isn't served as a static file.
const DEFAULT_BRAND: Required<BrandOptions> = {
  showBranding: true,
  brandTitle: "Drum Tracer",
  logoUrl: "/drum-tracer-logo.png",
  brandColor: "#203975",
};

const toStr = (v: unknown) => (v === null || v === undefined ? "" : String(v));

const pickBrand = (brand?: BrandOptions): Required<BrandOptions> => ({
  ...DEFAULT_BRAND,
  ...(brand ?? {}),
});

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return [r, g, b];
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return [r, g, b];
  }
  // fallback = brand green
  return [34, 197, 94];
}

function drawLogoWatermark(
  doc: import("jspdf").default,
  logoDataUrl: string | null,
  fallbackText: string,
  pageWidth: number,
  pageHeight: number,
): void {
  if (!logoDataUrl && !fallbackText) return;
  doc.saveGraphicsState();
  const GState = (
    doc as unknown as { GState: new (opts: { opacity: number }) => object }
  ).GState;
  doc.setGState(new GState({ opacity: 0.08 }));
  if (logoDataUrl) {
    const logoW = pageWidth * 0.35;
    const logoH = logoW;
    const logoX = (pageWidth - logoW) / 2;
    const logoY = (pageHeight - logoH) / 2;

    doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoW, logoH);
  } else {
    doc.setFontSize(64);
    doc.setTextColor(0, 0, 0);
    doc.text(fallbackText, pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 45,
      maxWidth: pageWidth * 0.85,
    });
  }

  doc.restoreGraphicsState();
}

export async function exportToPdf<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  meta: ExportMeta,
  opts: PdfOptions = {},
): Promise<void> {
  const jsPDF = (await import("jspdf")).default;
  const autoTable = (await import("jspdf-autotable")).default;

  const {
    orientation = "landscape",
    pageFormat = "a4",
    marginLeft = 40,
    marginRight = 40,
    startY = 98,
    brand,
    useColumnWidths = true,
    watermarkText: watermarkTextOpt,
  } = opts;

  const branding = pickBrand(brand);
  const watermarkText =
    watermarkTextOpt !== undefined
      ? watermarkTextOpt
      : branding.brandTitle.toUpperCase();

  const doc = new jsPDF({
    orientation,
    unit: "pt",
    format: pageFormat,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const contentLeftX = marginLeft;
  const contentRightX = pageWidth - marginRight;
  const contentWidth = contentRightX - contentLeftX;

  // ---------- Header Layout (SAME ROW) ----------
  const headerTopY = 34;

  const brandBlockWidth = branding.showBranding ? 220 : 0;
  const leftBlockMaxWidth = Math.max(220, contentWidth - brandBlockWidth - 16);

  // Left: Title
  doc.setFontSize(18);
  doc.setTextColor(20);
  doc.text(meta.title, contentLeftX, headerTopY);

  const generatedAt = meta.generatedAt
    ? `Generated: ${formatDateNL(meta.generatedAt, { time: true })}`
    : `Generated: ${formatDateNL(new Date(), { time: true })}`;

  // Left: Filters (optional)
  const filtersY = headerTopY + 32;
  if (meta.filtersLine) {
    doc.setFontSize(9);
    doc.setTextColor(125);
    doc.text(meta.filtersLine, contentLeftX, filtersY, {
      maxWidth: leftBlockMaxWidth,
    });
  }

  // Right: Branding (logo + title + generated), aligned to the right side, same row as title
  if (branding.showBranding) {
    const logoDataUrl = await fetchImageAsDataUrl(branding.logoUrl);

    const logoSize = 32;
    const logoTextGap = 6; // gap between logo right edge and text

    const brandTitle = branding.brandTitle;

    // Measure actual text widths at their correct font sizes
    doc.setFontSize(12);
    const brandTitleWidth = doc.getTextWidth(brandTitle);

    doc.setFontSize(9);
    const generatedWidth = doc.getTextWidth(generatedAt);

    // textColWidth = widest of the two text lines — no extra padding
    const textColWidth = Math.max(brandTitleWidth, generatedWidth);
    const blockWidth =
      (logoDataUrl ? logoSize + logoTextGap : 0) + textColWidth;

    // Pin right edge of block exactly to contentRightX — zero gap
    const blockLeftX = contentRightX - blockWidth;
    const textStartX = logoDataUrl
      ? blockLeftX + logoSize + logoTextGap
      : contentRightX;
    const textAlign = logoDataUrl ? "left" : "right";

    // Logo
    if (logoDataUrl) {
      doc.addImage(
        logoDataUrl,
        "PNG",
        blockLeftX,
        headerTopY - 22,
        logoSize,
        logoSize,
      );
    }

    // Brand title
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(brandTitle, textStartX, headerTopY - 8, { align: textAlign });

    // Generated date
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(generatedAt, textStartX, headerTopY + 8, { align: textAlign });
  }

  // Pre-fetch watermark logo so it's ready synchronously inside didDrawPage
  const watermarkLogoUrl = branding.logoUrl || null;
  const watermarkLogoDataUrl = watermarkLogoUrl
    ? await fetchImageAsDataUrl(watermarkLogoUrl)
    : null;

  // Divider line under header
  const headerBottomY = meta.filtersLine ? filtersY + 14 : headerTopY + 28;
  doc.setDrawColor(230);
  doc.setLineWidth(0.8);
  doc.line(contentLeftX, headerBottomY, contentRightX, headerBottomY);

  // ---------- Table ----------
  const head = [columns.map((c) => c.header)];
  const body = rows.map((r) =>
    columns.map((c) => {
      const v = c.value(r);
      if (typeof v === "boolean") return v ? "Yes" : "No";
      if (typeof v === "number") {
        return c.isNumber ? v.toFixed(2) : String(v);
      }
      return toStr(v) || "—";
    }),
  );

  const primaryRgb = hexToRgbTuple(branding.brandColor);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columnStyles: Record<number, any> = {};

  if (useColumnWidths) {
    const totalDefinedWidth = columns.reduce(
      (sum, c) => sum + (c.pdfWidth ?? 0),
      0,
    );
    const colsWithoutWidth = columns.filter((c) => !c.pdfWidth).length;

    if (totalDefinedWidth > 0) {
      const fallbackWidth = totalDefinedWidth / Math.max(columns.length, 1);
      const totalWeight = columns.reduce(
        (sum, c) => sum + (c.pdfWidth ?? fallbackWidth),
        0,
      );

      columns.forEach((c, idx) => {
        const weight = c.pdfWidth ?? fallbackWidth;
        columnStyles[idx] = {
          cellWidth: (weight / totalWeight) * contentWidth,
          halign: c.pdfAlign ?? "left",
        };
      });
    } else if (colsWithoutWidth === columns.length) {
      columns.forEach((c, idx) => {
        columnStyles[idx] = { halign: c.pdfAlign ?? "left" };
      });
    }
  } else {
    columns.forEach((c, idx) => {
      columnStyles[idx] = { halign: c.pdfAlign ?? "left" };
    });
  }

  autoTable(doc, {
    startY: Math.max(startY, headerBottomY + 18),
    margin: { left: marginLeft, right: marginRight },
    tableWidth: contentWidth,
    theme: "grid",
    head,
    body,
    styles: {
      fontSize: 9,
      cellPadding: 6,
      valign: "middle",
      overflow: "linebreak",
      lineColor: [230, 230, 230],
      lineWidth: 0.6,
    },
    headStyles: {
      fillColor: primaryRgb,
      textColor: 255,
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles,
    didDrawPage: () => {
      const pageNumber = doc.getNumberOfPages();

      // Watermark — brand logo centered behind table content
      drawLogoWatermark(
        doc,
        watermarkLogoDataUrl,
        watermarkText,
        pageWidth,
        pageHeight,
      );

      // Footer line
      doc.setDrawColor(230);
      doc.setLineWidth(0.8);
      doc.line(
        marginLeft,
        pageHeight - 30,
        pageWidth - marginRight,
        pageHeight - 30,
      );

      const footerY = pageHeight - 16;
      const footerTitle = `© ${new Date().getFullYear()} ${branding.brandTitle}`;
      doc.setFontSize(9);
      doc.setTextColor(130);
      doc.text(footerTitle, marginLeft, footerY, { align: "left" });

      doc.setFontSize(9);
      doc.setTextColor(130);
      doc.text(`Page ${pageNumber}`, pageWidth - marginRight, pageHeight - 16, {
        align: "right",
      });
    },
  });
  const brandName = branding.brandTitle
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase();
  const filename = `${meta.fileBaseName}-${brandName}-${formatDateNL(new Date())}.pdf`;
  doc.save(filename);
}

export async function exportToExcel<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  meta: ExportMeta,
  opts: ExcelOptions = {},
): Promise<void> {
  const XLSX = await import("xlsx");

  const {
    sheetName = meta.title,
    headerFillRgb = "E9EEF3",
    includeTotalsRow = false,
    totalsLabelColIndex = 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    brand,
  } = opts;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aoa: any[][] = [];

  // Report metadata
  aoa.push([meta.title]);
  aoa.push([
    `Generated: ${formatDateNL(meta.generatedAt ?? new Date(), { time: true })}`,
  ]);
  if (meta.filtersLine) aoa.push([meta.filtersLine]);
  aoa.push([]); // spacer

  // Header row
  aoa.push(columns.map((c) => c.header));

  // Data rows
  for (const r of rows) {
    aoa.push(
      columns.map((c) => {
        const v = c.value(r);
        if (v === null || v === undefined) return "";
        return v;
      }),
    );
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Column widths
  ws["!cols"] = columns.map((c) => ({ wch: c.xlsxWidth ?? 16 }));

  const ref = ws["!ref"] as string;
  const range = XLSX.utils.decode_range(ref);

  const headerRow = meta.filtersLine ? 4 : 3;

  const headerStyle = {
    font: { bold: true },
    alignment: { vertical: "center", horizontal: "center" },
    fill: { fgColor: { rgb: headerFillRgb } },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };

  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c })];
    if (cell) cell.s = headerStyle;
  }

  // Freeze panes
  ws["!freeze"] = { xSplit: 0, ySplit: headerRow + 1 };

  // Auto filter
  const filterRef = XLSX.utils.encode_range({
    s: { r: headerRow, c: range.s.c },
    e: { r: range.e.r, c: range.e.c },
  });
  ws["!autofilter"] = { ref: filterRef };

  // Number formats by column definition
  const dataStartRow = headerRow + 1;
  for (let r = dataStartRow; r <= range.e.r; r++) {
    columns.forEach((col, idx) => {
      if (!col.isNumber) return;
      const addr = XLSX.utils.encode_cell({ r, c: idx });
      if (ws[addr]) ws[addr].z = col.xlsxNumberFormat ?? "0.00";
    });
  }

  // Totals row
  if (includeTotalsRow && rows.length > 0) {
    const totalsRow0 = range.e.r + 2;

    const labelCell = XLSX.utils.encode_cell({
      r: totalsRow0,
      c: totalsLabelColIndex,
    });
    ws[labelCell] = { v: "TOTAL", t: "s" };

    columns.forEach((col, idx) => {
      if (!col.isNumber) return;
      const colLetter = XLSX.utils.encode_col(idx);
      const start = dataStartRow + 1; // Excel rows are 1-based
      const end = range.e.r + 1;
      const sumCell = XLSX.utils.encode_cell({ r: totalsRow0, c: idx });
      ws[sumCell] = {
        f: `SUM(${colLetter}${start}:${colLetter}${end})`,
        t: "n",
        z: col.xlsxNumberFormat ?? "0.00",
      };
    });

    ws["!ref"] = XLSX.utils.encode_range({
      s: range.s,
      e: { r: totalsRow0, c: range.e.c },
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const filename = `${meta.fileBaseName}-drum-tracer-${formatDateNL(new Date())}.xlsx`;
  XLSX.writeFile(wb, filename);
}
