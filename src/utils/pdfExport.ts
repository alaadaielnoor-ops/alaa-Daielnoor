import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface UnifiedPdfOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  margin?: number | [number, number, number, number];
  scale?: number;
  title?: string;
  uploadToServer?: boolean;
  hideSelectors?: string[];
  showSelectors?: string[];
  addPageNumbers?: boolean;
  watermark?: string;
  onProgress?: (step: string) => void;
}

export type PdfExportOptions = UnifiedPdfOptions;

export interface PdfExportResult {
  success: boolean;
  blob?: Blob;
  base64?: string;
  blobUrl?: string;
  viewerUrl?: string;
  fullUrl?: string;
  error?: string;
}

let colorCanvas: HTMLCanvasElement | null = null;
let colorCtx: CanvasRenderingContext2D | null = null;

/**
 * Analytical converter for OKLCH -> standard sRGB string
 */
function oklchToRgbAnalytical(str: string): string {
  try {
    const regex = /oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+deg|[\d.]+rad|[\d.]+turn|[\d.]+|none)(?:\s*\/\s*([\d.]+%?))?\s*\)/i;
    const m = str.match(regex);
    if (!m) return '#0f766e'; // Default educational emerald/teal tone

    const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
    const C = m[2].endsWith('%') ? (parseFloat(m[2]) / 100) * 0.4 : parseFloat(m[2]);
    const Hstr = m[3];
    let H = 0;
    if (Hstr === 'none' || !Hstr) H = 0;
    else if (Hstr.endsWith('deg')) H = parseFloat(Hstr);
    else if (Hstr.endsWith('rad')) H = (parseFloat(Hstr) * 180) / Math.PI;
    else if (Hstr.endsWith('turn')) H = parseFloat(Hstr) * 360;
    else H = parseFloat(Hstr) || 0;

    let a = 1;
    if (m[4]) {
      a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    }

    const hRad = (H * Math.PI) / 180;
    const a_lab = C * Math.cos(hRad);
    const b_lab = C * Math.sin(hRad);

    const l_ = L + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
    const m_ = L - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
    const s_ = L - 0.0894841775 * a_lab - 1.2914855480 * b_lab;

    const l_cube = l_ * l_ * l_;
    const m_cube = m_ * m_ * m_;
    const s_cube = s_ * s_ * s_;

    const r_lin = +4.0767434757 * l_cube - 3.3077115913 * m_cube + 0.2309699291 * s_cube;
    const g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
    const b_lin = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.7076147010 * s_cube;

    const gamma = (val: number) => {
      val = Math.max(0, Math.min(1, val));
      return val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    };

    const R = Math.round(gamma(r_lin) * 255);
    const G = Math.round(gamma(g_lin) * 255);
    const B = Math.round(gamma(b_lin) * 255);

    return a < 1 ? `rgba(${R}, ${G}, ${B}, ${a})` : `rgb(${R}, ${G}, ${B})`;
  } catch (_) {
    return '#0f766e';
  }
}

/**
 * Converts any CSS string containing modern color functions (oklch, color-mix, etc.) to standard rgb/rgba
 */
export function convertCssColor(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  if (!colorStr.includes('oklch') && !colorStr.includes('color-mix') && !colorStr.includes('oklab')) {
    return colorStr;
  }

  if (typeof document === 'undefined') return colorStr;

  if (!colorCanvas) {
    try {
      colorCanvas = document.createElement('canvas');
      colorCanvas.width = 1;
      colorCanvas.height = 1;
      colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
    } catch (_) {}
  }

  if (colorStr.includes('oklch')) {
    return colorStr.replace(/oklch\([^)]+\)/gi, (match) => {
      if (colorCtx) {
        try {
          colorCtx.fillStyle = '#000000';
          colorCtx.fillStyle = match;
          const resolved = colorCtx.fillStyle;
          if (resolved && !resolved.includes('oklch') && !resolved.includes('color(')) {
            return resolved;
          }
        } catch (_) {}
      }
      return oklchToRgbAnalytical(match);
    });
  }

  return '#0f766e';
}

/**
 * Sanitizes cloned document for html2canvas execution:
 * 1. Enforces strict RTL layout, text alignment, and Arabic cursive font rules
 * 2. Removes .dark class so the PDF is always clean official white letterhead
 * 3. Hides screen-only interactive elements (.no-print, [data-no-print], buttons, etc.)
 * 4. Reveals print-only elements (.print-only, [data-print-only])
 * 5. Expands scrollable overflows to prevent cutoffs
 * 6. Injects standard RGB/HEX overrides for Tailwind color variables
 */
function sanitizeClonedDocument(
  clonedDoc: Document,
  clonedEl: HTMLElement,
  options?: UnifiedPdfOptions
) {
  try {
    // 1. Force light paper mode for official printout
    clonedDoc.documentElement.classList.remove('dark');
    clonedDoc.body?.classList.remove('dark');
    clonedEl.classList.remove('dark');

    // 2. Enforce RTL on document root, body, and cloned element
    clonedDoc.documentElement.setAttribute('dir', 'rtl');
    clonedDoc.documentElement.style.direction = 'rtl';
    if (clonedDoc.body) {
      clonedDoc.body.setAttribute('dir', 'rtl');
      clonedDoc.body.style.direction = 'rtl';
      clonedDoc.body.style.textAlign = 'right';
      clonedDoc.body.style.backgroundColor = '#ffffff';
      clonedDoc.body.style.color = '#0f172a';
    }
    clonedEl.setAttribute('dir', 'rtl');
    clonedEl.style.direction = 'rtl';
    clonedEl.style.textAlign = 'right';
    clonedEl.style.backgroundColor = '#ffffff';

    // 3. Hide screen-only interactive elements
    const defaultHideSelectors = [
      '.print\\:hidden',
      '[data-print-hidden="true"]',
      '.no-print',
      '[data-no-print]',
      '.hide-on-pdf',
      '[data-hide-on-pdf]',
      'button:not(.keep-in-pdf)',
      '.action-toolbar',
      '.action-buttons',
      '[data-action-buttons]'
    ];
    const hideSelectors = options?.hideSelectors
      ? [...defaultHideSelectors, ...options.hideSelectors]
      : defaultHideSelectors;

    hideSelectors.forEach(sel => {
      try {
        const found = clonedDoc.querySelectorAll(sel);
        found.forEach(el => {
          (el as HTMLElement).style.setProperty('display', 'none', 'important');
          (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
        });
      } catch (_) {}
    });

    // 4. Reveal print-only elements
    const defaultShowSelectors = [
      '.print-only',
      '[data-print-only="true"]',
      '[data-print-only]',
      '.show-on-pdf',
      '[data-show-on-pdf]'
    ];
    const showSelectors = options?.showSelectors
      ? [...defaultShowSelectors, ...options.showSelectors]
      : defaultShowSelectors;

    showSelectors.forEach(sel => {
      try {
        const found = clonedDoc.querySelectorAll(sel);
        found.forEach(el => {
          (el as HTMLElement).style.setProperty('display', 'block', 'important');
          (el as HTMLElement).style.setProperty('visibility', 'visible', 'important');
        });
      } catch (_) {}
    });

    // 5. Expand scrollable containers to full content height
    const scrollContainers = clonedEl.querySelectorAll<HTMLElement>(
      '.overflow-y-auto, .overflow-x-auto, .overflow-auto, .overflow-hidden, [class*="max-h-"]'
    );
    scrollContainers.forEach(sc => {
      sc.style.setProperty('overflow', 'visible', 'important');
      sc.style.setProperty('max-height', 'none', 'important');
      sc.style.setProperty('height', 'auto', 'important');
    });
    clonedEl.style.setProperty('overflow', 'visible', 'important');
    clonedEl.style.setProperty('max-height', 'none', 'important');
    clonedEl.style.setProperty('height', 'auto', 'important');

    // 6. Window getComputedStyle proxy for color sanitization
    const win = clonedDoc.defaultView || window;
    if (win && win.getComputedStyle) {
      const origWinComputedStyle = win.getComputedStyle.bind(win);
      win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
        const cs = origWinComputedStyle(elt, pseudoElt);
        return new Proxy(cs, {
          get(target, prop, receiver) {
            if (prop === 'getPropertyValue') {
              return (propertyName: string) => {
                const val = target.getPropertyValue(propertyName);
                return convertCssColor(val);
              };
            }
            const val = Reflect.get(target, prop, receiver);
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('color-mix'))) {
              return convertCssColor(val);
            }
            if (typeof val === 'function') {
              return val.bind(target);
            }
            return val;
          }
        });
      };
    }

    // 7. Inject fallback CSS variables and RTL Arabic typography resets
    const fallbackStyle = clonedDoc.createElement('style');
    fallbackStyle.setAttribute('type', 'text/css');
    fallbackStyle.textContent = `
      :root, *, *::before, *::after {
        --color-teal-50: #f0fdfa !important;
        --color-teal-100: #ccfbf1 !important;
        --color-teal-200: #99f6e4 !important;
        --color-teal-300: #5eead4 !important;
        --color-teal-400: #2dd4bf !important;
        --color-teal-500: #14b8a6 !important;
        --color-teal-600: #0d9488 !important;
        --color-teal-700: #0f766e !important;
        --color-teal-800: #115e59 !important;
        --color-teal-900: #134e4a !important;
        --color-emerald-50: #ecfdf5 !important;
        --color-emerald-100: #d1fae5 !important;
        --color-emerald-200: #a7f3d0 !important;
        --color-emerald-300: #6ee7b7 !important;
        --color-emerald-400: #34d399 !important;
        --color-emerald-500: #10b981 !important;
        --color-emerald-600: #059669 !important;
        --color-emerald-700: #047857 !important;
        --color-emerald-800: #065f46 !important;
        --color-emerald-900: #064e3b !important;
        --color-slate-50: #f8fafc !important;
        --color-slate-100: #f1f5f9 !important;
        --color-slate-200: #e2e8f0 !important;
        --color-slate-300: #cbd5e1 !important;
        --color-slate-400: #94a3b8 !important;
        --color-slate-500: #64748b !important;
        --color-slate-600: #475569 !important;
        --color-slate-700: #334155 !important;
        --color-slate-800: #1e293b !important;
        --color-slate-900: #0f172a !important;
      }
      /* Arabic RTL Typography reset: prevent disjointed Arabic characters */
      *, *::before, *::after {
        letter-spacing: normal !important;
        word-spacing: normal !important;
        box-sizing: border-box !important;
      }
      body, div, span, p, h1, h2, h3, h4, h5, h6, table, th, td, ul, li {
        font-family: 'Cairo', 'Noto Kufi Arabic', 'Amiri', 'Tajawal', system-ui, -apple-system, sans-serif !important;
        direction: rtl !important;
      }
      table {
        direction: rtl !important;
        border-collapse: collapse !important;
      }
      th, td {
        text-align: right !important;
      }
      th.text-center, td.text-center, .text-center {
        text-align: center !important;
      }
      th.text-left, td.text-left, .text-left {
        text-align: left !important;
      }
      /* Remove web-only shadows and outlines */
      * {
        text-shadow: none !important;
      }
    `;
    clonedDoc.head?.appendChild(fallbackStyle);

    // 8. Sanitize any style elements in cloned document
    const styleTags = clonedDoc.querySelectorAll('style');
    styleTags.forEach((tag) => {
      if (tag.textContent && (tag.textContent.includes('oklch') || tag.textContent.includes('color-mix'))) {
        tag.textContent = convertCssColor(tag.textContent);
      }
    });

    // 9. Walk all cloned elements and convert inline styles
    const allElements = clonedEl.querySelectorAll('*');
    allElements.forEach((node) => {
      const el = node as HTMLElement;
      if (el.style) {
        for (let i = 0; i < el.style.length; i++) {
          const prop = el.style[i];
          const val = el.style.getPropertyValue(prop);
          if (val && (val.includes('oklch') || val.includes('color-mix'))) {
            el.style.setProperty(prop, convertCssColor(val), el.style.getPropertyPriority(prop));
          }
        }
      }
      if (el.tagName === 'IMG') {
        (el as HTMLImageElement).crossOrigin = 'anonymous';
      }
    });
  } catch (err) {
    console.warn('PDF Clone sanitization warning:', err);
  }
}

/**
 * Creates an execution wrapper that intercepts window.getComputedStyle
 */
function withComputedStyleProxy<T>(fn: () => Promise<T>): Promise<T> {
  const origWindowGetComputedStyle = window.getComputedStyle;
  try {
    window.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
      const cs = origWindowGetComputedStyle.call(window, elt, pseudoElt);
      return new Proxy(cs, {
        get(target, prop, receiver) {
          if (prop === 'getPropertyValue') {
            return (propertyName: string) => {
              const val = target.getPropertyValue(propertyName);
              return convertCssColor(val);
            };
          }
          const val = Reflect.get(target, prop, receiver);
          if (typeof val === 'string' && (val.includes('oklch') || val.includes('color-mix'))) {
            return convertCssColor(val);
          }
          if (typeof val === 'function') {
            return val.bind(target);
          }
          return val;
        }
      });
    };
  } catch (_) {}

  return fn().finally(() => {
    try {
      window.getComputedStyle = origWindowGetComputedStyle;
    } catch (_) {}
  });
}

/**
 * Core engine: Renders DOM element into a crisp multi-page jsPDF document
 */
async function renderElementToJsPdf(
  element: HTMLElement,
  options: UnifiedPdfOptions
): Promise<{ pdf: jsPDF; canvas: HTMLCanvasElement }> {
  const orientation = options.orientation || 'portrait';
  const scale = options.scale || 2;

  options.onProgress?.('جاري معالجة المحتوى وتنسيق الصفحات...');

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
      sanitizeClonedDocument(clonedDoc, clonedEl, options);
    }
  });

  options.onProgress?.('جاري إنشاء ملف PDF وتوزيع الصفحات...');

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = orientation === 'landscape' ? 297 : 210;
  const pageHeight = orientation === 'landscape' ? 210 : 297;
  const rawMargin = options.margin !== undefined ? options.margin : 8;
  const margin = typeof rawMargin === 'number' ? rawMargin : (rawMargin[0] || 8);

  const printWidth = pageWidth - (margin * 2);
  const printHeight = (canvas.height * printWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  if (printHeight <= (pageHeight - (margin * 2))) {
    // Fits neatly on a single page
    pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, printHeight);
    if (options.addPageNumbers) {
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text('صفحة 1 من 1', pageWidth / 2, pageHeight - 3, { align: 'center' });
    }
  } else {
    // Multi-page slicing
    let heightLeft = printHeight;
    let position = margin;
    let pageNum = 1;
    const pageContentHeight = pageHeight - (margin * 2);
    const totalPages = Math.ceil(printHeight / pageContentHeight);

    while (heightLeft > 0) {
      if (pageNum > 1) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);

      if (options.addPageNumbers) {
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`صفحة ${pageNum} من ${totalPages}`, pageWidth / 2, pageHeight - 3, { align: 'center' });
      }

      heightLeft -= pageContentHeight;
      position -= pageContentHeight;
      pageNum++;
    }
  }

  return { pdf, canvas };
}

/**
 * Uploads generated PDF base64 to server to create permanent sharable and downloadable URL
 */
async function uploadPdfBackup(base64: string, filename: string): Promise<{ fullUrl?: string; viewerUrl?: string }> {
  try {
    const res = await fetch('/api/documents/upload-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: base64, filename })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const fullUrl = data.fullUrl?.startsWith('/')
          ? `${window.location.origin}${data.fullUrl}`
          : data.fullUrl;
        const viewerUrl = data.viewerUrl?.startsWith('/')
          ? `${window.location.origin}${data.viewerUrl}`
          : data.viewerUrl;
        return { fullUrl, viewerUrl };
      }
    }
  } catch (err) {
    console.warn('PDF server upload backup notice:', err);
  }
  return {};
}

/**
 * Unified PDF Export Function (الدالة الموحدة لتصدير المحتوى إلى ملف PDF)
 * Features:
 * - High resolution canvas capture with jspdf & html2canvas
 * - Full Arabic RTL orientation, direction, and typography ligatures
 * - Automatic elimination of hidden/interactive buttons (.no-print, [data-no-print])
 * - Proper expansion of scrollable elements without truncation
 * - Automatic direct browser file download and server backup URL generation
 */
export async function exportUnifiedPdf(
  element: HTMLElement,
  options: UnifiedPdfOptions
): Promise<PdfExportResult> {
  return withComputedStyleProxy(async () => {
    try {
      const filename = options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`;

      // 1. Render to jsPDF instance
      const { pdf } = await renderElementToJsPdf(element, options);

      // 2. Generate Blob and DataURL
      const blob = pdf.output('blob');
      const base64 = pdf.output('dataurlstring');
      const blobUrl = URL.createObjectURL(blob);

      // 3. Direct browser download trigger
      try {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try {
            document.body.removeChild(link);
          } catch (_) {}
        }, 1000);
      } catch (dlErr) {
        console.warn('Direct <a> download trigger notice:', dlErr);
      }

      // Native fallback
      try {
        pdf.save(filename);
      } catch (_) {}

      // 4. Server-side permanent backup for direct viewing & WhatsApp
      let fullUrl: string | undefined;
      let viewerUrl: string | undefined;

      if (options.uploadToServer !== false) {
        options.onProgress?.('جاري حفظ النسخة الاحتياطية على السيرفر...');
        const backup = await uploadPdfBackup(base64, filename);
        fullUrl = backup.fullUrl;
        viewerUrl = backup.viewerUrl;
      }

      return {
        success: true,
        blob,
        base64,
        blobUrl,
        fullUrl: fullUrl || blobUrl,
        viewerUrl: viewerUrl || fullUrl || blobUrl
      };
    } catch (err: any) {
      console.error('Unified PDF export error:', err);
      return { success: false, error: err.message || 'فشل تحويل وتصدير الملف إلى PDF' };
    }
  });
}

/**
 * Backward-compatible alias for exportUnifiedPdf
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions
): Promise<PdfExportResult> {
  return exportUnifiedPdf(element, options);
}

/**
 * Generates a PDF Blob & Base64 without immediately triggering browser download (useful for WhatsApp and preview modals).
 */
export async function generatePdfBlob(
  element: HTMLElement,
  options: UnifiedPdfOptions
): Promise<PdfExportResult> {
  return withComputedStyleProxy(async () => {
    try {
      const filename = options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`;

      // 1. Render to jsPDF instance
      const { pdf } = await renderElementToJsPdf(element, options);

      // 2. Generate Blob and DataURL
      const blob = pdf.output('blob');
      const base64 = pdf.output('dataurlstring');
      const blobUrl = URL.createObjectURL(blob);

      // 3. Server-side permanent backup
      let fullUrl: string | undefined;
      let viewerUrl: string | undefined;

      if (options.uploadToServer !== false) {
        const backup = await uploadPdfBackup(base64, filename);
        fullUrl = backup.fullUrl;
        viewerUrl = backup.viewerUrl;
      }

      return {
        success: true,
        blob,
        base64,
        blobUrl,
        fullUrl: fullUrl || blobUrl,
        viewerUrl: viewerUrl || fullUrl || blobUrl
      };
    } catch (err: any) {
      console.error('Generate PDF Blob error:', err);
      return { success: false, error: err.message || 'فشل توليد ملف PDF' };
    }
  });
}
