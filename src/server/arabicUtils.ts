/**
 * Arabic NLP and Text Normalization Utilities
 * Handles diacritics removal, alef/hamza normalization, teh marbuta, tatweel,
 * and smart tokenization for Arabic search and RAG indexing.
 */

export function normalizeArabicText(text: string): string {
  if (!text) return '';

  return text
    // Remove Arabic diacritics (Tashkeel: Fatha, Damma, Kasra, Sukun, Shadda, etc.)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove Tatweel (Kashida)
    .replace(/\u0640/g, '')
    // Normalize Alefs (أ، إ، آ، ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Teh Marbuta to Heh (ة -> ه) for flexible fuzzy search
    .replace(/ة/g, 'ه')
    // Normalize Yeh (ى -> ي)
    .replace(/ى/g, 'ي')
    // Normalize Arabic Persian characters if pasted
    .replace(/ك/g, 'ك')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Convert Arabic-Indic numerals to standard numerals (٠-٩ -> 0-9)
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .trim()
    .toLowerCase();
}

/**
 * Splits Arabic text into searchable keywords, removing very common stop words
 */
const ARABIC_STOP_WORDS = new Set([
  'في', 'من', 'على', 'إلى', 'الي', 'عن', 'مع', 'هذا', 'هذه', 'هؤلاء',
  'ذلك', 'تلك', 'التي', 'الذي', 'الذين', 'اللتان', 'اللذان', 'اللواتي',
  'هو', 'هي', 'هم', 'هن', 'نحن', 'أنا', 'انت', 'انتم', 'كان', 'كانت',
  'يكون', 'تكون', 'ما', 'ماذا', 'كيف', 'أين', 'اين', 'متى', 'لماذا',
  'ثم', 'أو', 'او', 'أم', 'ام', 'بل', 'لكن', 'إن', 'ان', 'أن', 'لا',
  'لم', 'لن', 'قد', 'كل', 'بعض', 'غير', 'سوى', 'بين', 'عند', 'لدى'
]);

export function extractArabicKeywords(text: string): string[] {
  if (!text) return [];
  const normalized = normalizeArabicText(text);
  const words = normalized.split(/[\s,.;:،؟!()\[\]{}"'\-\/\\]+/).filter(Boolean);
  
  const keywords = words.filter(word => {
    return word.length > 2 && !ARABIC_STOP_WORDS.has(word);
  });

  return Array.from(new Set(keywords));
}

/**
 * Highlight matched terms in text for search snippet preview
 */
export function createHighlightedSnippet(content: string, query: string, maxLength: number = 220): string {
  if (!content) return '';
  if (!query) return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');

  const normalizedContent = normalizeArabicText(content);
  const queryWords = extractArabicKeywords(query);

  let bestIndex = -1;
  for (const word of queryWords) {
    const idx = normalizedContent.indexOf(word);
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }

  if (bestIndex === -1) {
    bestIndex = 0;
  }

  const start = Math.max(0, bestIndex - 60);
  const end = Math.min(content.length, start + maxLength);
  let snippet = content.slice(start, end).trim();

  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Score relevance of a document chunk against a query
 */
export function calculateTextRelevance(content: string, query: string): number {
  if (!content || !query) return 0;
  const normalizedContent = normalizeArabicText(content);
  const normalizedQuery = normalizeArabicText(query);

  // Exact phrase match gives high boost
  let score = 0;
  if (normalizedContent.includes(normalizedQuery)) {
    score += 50;
  }

  const queryTokens = extractArabicKeywords(query);
  if (queryTokens.length === 0) return score;

  let matchedTokens = 0;
  for (const token of queryTokens) {
    if (normalizedContent.includes(token)) {
      matchedTokens++;
      // Count frequency
      const regex = new RegExp(token, 'g');
      const count = (normalizedContent.match(regex) || []).length;
      score += Math.min(count * 5, 20);
    }
  }

  const coverage = matchedTokens / queryTokens.length;
  score += coverage * 30;

  return score;
}
