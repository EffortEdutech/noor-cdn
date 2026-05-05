// scripts/fix-complete-juz-index.mjs
// Sprint 28.6A.1 hotfix: generate complete standard 30-juz navigation index.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'noor-cdn', 'quran', 'navigation', 'juz-index.json');

const verseCounts = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6
};

const boundaries = [
  [1, 'الم', 'Alif Lam Meem', 1, 1, 2, 141, 1, 21],
  [2, 'سيقول', 'Sa-yaqool', 2, 142, 2, 252, 22, 41],
  [3, 'تلك الرسل', 'Tilka ar-Rusul', 2, 253, 3, 92, 42, 61],
  [4, 'لن تنالوا', 'Lan Tanaaloo', 3, 93, 4, 23, 62, 81],
  [5, 'والمحصنات', 'Wal Muhsanat', 4, 24, 4, 147, 82, 101],
  [6, 'لا يحب الله', 'La Yuhibbullah', 4, 148, 5, 81, 102, 121],
  [7, 'وإذا سمعوا', 'Wa Iza Samiu', 5, 82, 6, 110, 122, 141],
  [8, 'ولو أننا', 'Wa Lau Annana', 6, 111, 7, 87, 142, 161],
  [9, 'قال الملأ', 'Qalal Malao', 7, 88, 8, 40, 162, 181],
  [10, 'واعلموا', `Wa A'lamu`, 8, 41, 9, 92, 182, 201],
  [11, 'يعتذرون', `Ya'tadhirun`, 9, 93, 11, 5, 202, 221],
  [12, 'وما من دابة', 'Wa Ma Min Daabbah', 11, 6, 12, 52, 222, 241],
  [13, 'وما أبرئ', 'Wa Ma Ubrioo', 12, 53, 14, 52, 242, 261],
  [14, 'ربما', 'Rubama', 15, 1, 16, 128, 262, 281],
  [15, 'سبحان', 'Subhaan', 17, 1, 18, 74, 282, 302],
  [16, 'قال ألم', 'Qal Alam', 18, 75, 20, 135, 302, 321],
  [17, 'اقترب', 'Aqtarabu', 21, 1, 22, 78, 322, 341],
  [18, 'قد أفلح', 'Qad Aflaha', 23, 1, 25, 20, 342, 361],
  [19, 'وقال الذين', 'Wa Qalalladhina', 25, 21, 27, 55, 362, 381],
  [20, 'أمن خلق', `A'man Khalaq`, 27, 56, 29, 45, 382, 401],
  [21, 'اتل ما أوحي', 'Utlu Ma Oohi', 29, 46, 33, 30, 402, 421],
  [22, 'ومن يقنت', 'Wa Man Yaqnut', 33, 31, 36, 27, 422, 441],
  [23, 'ومالي', 'Wa Mali', 36, 28, 39, 31, 442, 462],
  [24, 'فمن أظلم', 'Fa-man Azlam', 39, 32, 41, 46, 462, 481],
  [25, 'إليه يرد', 'Ilayhi Yuraddu', 41, 47, 45, 37, 482, 501],
  [26, 'حم', 'Ha Meem', 46, 1, 51, 30, 502, 521],
  [27, 'قال فما خطبكم', 'Qala Fama Khatbukum', 51, 31, 57, 29, 522, 541],
  [28, 'قد سمع الله', 'Qad Sami Allah', 58, 1, 66, 12, 542, 561],
  [29, 'تبارك', 'Tabarak', 67, 1, 77, 50, 562, 581],
  [30, 'عم', 'Amma', 78, 1, 114, 6, 582, 604],
];

function countRange(ss, sv, es, ev) {
  let total = 0;
  for (let s = ss; s <= es; s++) {
    const first = s === ss ? sv : 1;
    const last = s === es ? ev : verseCounts[s];
    total += last - first + 1;
  }
  return total;
}

function includedSurahs(ss, sv, es, ev) {
  const rows = [];
  for (let s = ss; s <= es; s++) {
    const first = s === ss ? sv : 1;
    const last = s === es ? ev : verseCounts[s];
    rows.push({ surah: s, verses: `${first}-${last}`, verse_count: last - first + 1 });
  }
  return rows;
}

const juz_info = boundaries.map(([number, name_arabic, name_english, start_surah, start_verse, end_surah, end_verse, page_start, page_end]) => ({
  number,
  name_arabic,
  name_english,
  start_surah,
  start_verse,
  end_surah,
  end_verse,
  total_verses: countRange(start_surah, start_verse, end_surah, end_verse),
  page_start,
  page_end,
  surahs_included: includedSurahs(start_surah, start_verse, end_surah, end_verse),
  hizb_included: [number * 2 - 1, number * 2],
  main_themes: []
}));

const payload = {
  metadata: {
    total_juz: 30,
    total_hizb: 60,
    source: 'Standard Mushaf Division',
    generated_by: 'Sprint 28.6A.1 hotfix',
    note: 'Complete 30-juz navigation index generated after the legacy source file was found to contain only 7 records.'
  },
  juz_info
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`✓ wrote complete 30-juz index: ${OUT}`);
console.log(`✓ records: ${juz_info.length}`);
