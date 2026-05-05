#!/usr/bin/env node
/**
 * Sprint 28.6A.1 — Import Legacy Navigation Metadata
 *
 * Run from the noor-cdn repository root:
 *   node scripts/import-legacy-navigation-metadata.mjs
 *
 * Optional:
 *   LEGACY_REPO_PATH=C:\path\to\muslim-companion-poc
 *
 * This script imports only navigation/display metadata. It does not import
 * raw Quran/Tafseer/Hadith content files.
 */

import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const ROOT = process.cwd();
const GENERATED_AT = new Date().toISOString();
const LEGACY_REPO_PATH = process.env.LEGACY_REPO_PATH || '';
const LEGACY_RAW_BASE =
  process.env.LEGACY_RAW_BASE ||
  'https://raw.githubusercontent.com/EffortEdutech/muslim-companion-poc/main';

const SOURCE_REPO = 'EffortEdutech/muslim-companion-poc';
const SPRINT_ID = '28.6A.1';

const HADITH_COLLECTIONS = [
  {
    slug: 'bukhari',
    aliases: ['bukhari', 'by-book__the-9-books__bukhari'],
    filename: 'bukhari.json',
    group: 'the_9_books',
    displayName: 'Sahih al-Bukhari',
    arabicName: 'صحيح البخاري',
    author: 'Imam Muhammad al-Bukhari',
    shortName: 'Bukhari',
  },
  {
    slug: 'muslim',
    aliases: ['muslim', 'by-book__the-9-books__muslim'],
    filename: 'muslim.json',
    group: 'the_9_books',
    displayName: 'Sahih Muslim',
    arabicName: 'صحيح مسلم',
    author: 'Imam Muslim ibn al-Hajjaj',
    shortName: 'Muslim',
  },
  {
    slug: 'abudawud',
    aliases: ['abudawud', 'abu-dawud', 'by-book__the-9-books__abudawud'],
    filename: 'abudawud.json',
    group: 'the_9_books',
    displayName: 'Sunan Abu Dawud',
    arabicName: 'سنن أبي داود',
    author: 'Abu Dawud al-Sijistani',
    shortName: 'Abu Dawud',
  },
  {
    slug: 'tirmidhi',
    aliases: ['tirmidhi', 'by-book__the-9-books__tirmidhi'],
    filename: 'tirmidhi.json',
    group: 'the_9_books',
    displayName: "Jami' at-Tirmidhi",
    arabicName: 'جامع الترمذي',
    author: 'Imam al-Tirmidhi',
    shortName: 'Tirmidhi',
  },
  {
    slug: 'nasai',
    aliases: ['nasai', 'nasaii', 'by-book__the-9-books__nasai'],
    filename: 'nasai.json',
    group: 'the_9_books',
    displayName: "Sunan an-Nasa'i",
    arabicName: 'سنن النسائي',
    author: "Ahmad ibn Shu'ayb al-Nasa'i",
    shortName: "Nasa'i",
  },
  {
    slug: 'ibnmajah',
    aliases: ['ibnmajah', 'ibn-majah', 'by-book__the-9-books__ibnmajah'],
    filename: 'ibnmajah.json',
    group: 'the_9_books',
    displayName: 'Sunan Ibn Majah',
    arabicName: 'سنن ابن ماجه',
    author: 'Ibn Majah al-Qazwini',
    shortName: 'Ibn Majah',
  },
  {
    slug: 'ahmed',
    aliases: ['ahmed', 'ahmad', 'by-book__the-9-books__ahmed'],
    filename: 'ahmed.json',
    group: 'the_9_books',
    displayName: 'Musnad Ahmad',
    arabicName: 'مسند أحمد',
    author: 'Imam Ahmad ibn Hanbal',
    shortName: 'Ahmad',
  },
  {
    slug: 'malik',
    aliases: ['malik', 'muwatta', 'by-book__the-9-books__malik'],
    filename: 'malik.json',
    group: 'the_9_books',
    displayName: "Muwatta Imam Malik",
    arabicName: 'موطأ مالك',
    author: 'Imam Malik ibn Anas',
    shortName: 'Malik',
  },
  {
    slug: 'darimi',
    aliases: ['darimi', 'by-book__the-9-books__darimi'],
    filename: 'darimi.json',
    group: 'the_9_books',
    displayName: 'Sunan al-Darimi',
    arabicName: 'سنن الدارمي',
    author: 'Abdullah ibn Abd al-Rahman al-Darimi',
    shortName: 'Darimi',
  },
  {
    slug: 'riyad_assalihin',
    normalizedSlug: 'riyad-assalihin',
    aliases: ['riyad_assalihin', 'riyad-assalihin', 'by-book__other-books__riyad-assalihin'],
    filename: 'riyad_assalihin.json',
    group: 'other_books',
    displayName: 'Riyad as-Salihin',
    arabicName: 'رياض الصالحين',
    author: 'Imam Yahya ibn Sharaf al-Nawawi',
    shortName: 'Riyad',
  },
  {
    slug: 'bulugh_almaram',
    normalizedSlug: 'bulugh-almaram',
    aliases: ['bulugh_almaram', 'bulugh-almaram', 'by-book__other-books__bulugh-almaram'],
    filename: 'bulugh_almaram.json',
    group: 'other_books',
    displayName: 'Bulugh al-Maram',
    arabicName: 'بلوغ المرام',
    author: 'Ibn Hajar al-Asqalani',
    shortName: 'Bulugh',
  },
  {
    slug: 'mishkat_almasabih',
    normalizedSlug: 'mishkat-almasabih',
    aliases: ['mishkat_almasabih', 'mishkat-almasabih', 'by-book__other-books__mishkat-almasabih'],
    filename: 'mishkat_almasabih.json',
    group: 'other_books',
    displayName: 'Mishkat al-Masabih',
    arabicName: 'مشكاة المصابيح',
    author: 'Muhammad ibn Abdullah al-Khatib al-Tabrizi',
    shortName: 'Mishkat',
  },
  {
    slug: 'aladab_almufrad',
    normalizedSlug: 'aladab-almufrad',
    aliases: ['aladab_almufrad', 'aladab-almufrad', 'by-book__other-books__aladab-almufrad'],
    filename: 'aladab_almufrad.json',
    group: 'other_books',
    displayName: 'Al-Adab Al-Mufrad',
    arabicName: 'الأدب المفرد',
    author: 'Imam Muhammad al-Bukhari',
    shortName: 'Al-Adab',
  },
  {
    slug: 'shamail_muhammadiyah',
    normalizedSlug: 'shamail-muhammadiyah',
    aliases: ['shamail_muhammadiyah', 'shamail-muhammadiyah', 'by-book__other-books__shamail-muhammadiyah'],
    filename: 'shamail_muhammadiyah.json',
    group: 'other_books',
    displayName: 'Shamail Muhammadiyah',
    arabicName: 'الشمائل المحمدية',
    author: 'Imam al-Tirmidhi',
    shortName: 'Shamail',
  },
  {
    slug: 'nawawi40',
    aliases: ['nawawi40', 'by-book__forties__nawawi40', 'by-book__forties__nawawi40__eng-nawawi40'],
    filename: 'nawawi40.json',
    group: 'forties',
    displayName: 'Forty Hadith of Imam Nawawi',
    arabicName: 'الأربعون النووية',
    author: 'Imam Yahya ibn Sharaf al-Nawawi',
    shortName: 'Nawawi 40',
  },
  {
    slug: 'qudsi40',
    aliases: ['qudsi40', 'by-book__forties__qudsi40', 'by-book__forties__qudsi40__eng-qudsi40'],
    filename: 'qudsi40.json',
    group: 'forties',
    displayName: 'Forty Hadith Qudsi',
    arabicName: 'الأربعون القدسية',
    author: 'Collected',
    shortName: 'Qudsi 40',
  },
  {
    slug: 'shahwaliullah40',
    aliases: ['shahwaliullah40', 'by-book__forties__shahwaliullah40', 'by-book__forties__shahwaliullah40__eng-shahwaliullah40'],
    filename: 'shahwaliullah40.json',
    group: 'forties',
    displayName: 'Forty Hadith of Shah Waliullah',
    arabicName: 'أربعون ولي الله الدهلوي',
    author: 'Shah Waliullah Dahlawi',
    shortName: 'Waliullah 40',
  },
];

const GROUPS = {
  the_9_books: {
    label: 'The Nine Books',
    description: 'The foundational corpus of authenticated hadith literature',
    order: 1,
  },
  other_books: {
    label: 'Other Collections',
    description: 'Renowned compiled works of hadith and sunnah',
    order: 2,
  },
  forties: {
    label: "The Forties — Arba'een",
    description: 'Selected collections of forty significant narrations',
    order: 3,
  },
};

function log(message) {
  console.log(message);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeJson(relativePath, data) {
  const fullPath = path.join(ROOT, relativePath);
  await ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  log(`  ✓ wrote ${relativePath}`);
}

async function writeText(relativePath, text) {
  const fullPath = path.join(ROOT, relativePath);
  await ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, text, 'utf8');
  log(`  ✓ wrote ${relativePath}`);
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchText(res.headers.location).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`GET ${url} failed with status ${res.statusCode}`));
          res.resume();
          return;
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve(body));
      })
      .on('error', reject);
  });
}

async function readLegacy(relativePath, { required = true } = {}) {
  if (LEGACY_REPO_PATH) {
    const localPath = path.join(LEGACY_REPO_PATH, relativePath);
    if (fssync.existsSync(localPath)) {
      log(`  ↳ local legacy: ${relativePath}`);
      return fs.readFile(localPath, 'utf8');
    }
  }

  const url = `${LEGACY_RAW_BASE}/${relativePath.replaceAll('\\', '/')}`;
  try {
    log(`  ↳ download legacy: ${relativePath}`);
    return await fetchText(url);
  } catch (error) {
    if (required) throw error;
    log(`  ⚠ optional legacy file unavailable: ${relativePath}`);
    return '';
  }
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse ${label}: ${error.message}`);
  }
}

function sourceMeta(pathInLegacy) {
  return {
    repo: SOURCE_REPO,
    ref: 'main',
    path: pathInLegacy,
    importedAt: GENERATED_AT,
    sprint: SPRINT_ID,
    reviewStatus: 'staging-imported-metadata',
  };
}

function normalizeSurahMetadata(legacy) {
  const records = legacy.surahs_metadata || legacy.surahs || [];
  return {
    schema: 'noor.quran.surah-metadata.v1',
    generatedAt: GENERATED_AT,
    source: sourceMeta('content/quran/source/metadata/surah_info.json'),
    metadata: {
      ...(legacy.metadata || {}),
      totalSurahs: records.length,
    },
    surahs: records.map((s) => ({
      number: Number(s.number ?? s.id),
      nameArabic: s.name_arabic || '',
      nameEnglish: s.name_english || '',
      nameTransliteration: s.name_transliterated || s.name_translit || '',
      meaning: s.meaning || '',
      otherNames: s.other_names || [],
      revelation: {
        place: s.revelation?.place || '',
        order: s.revelation?.order ?? null,
        period: s.revelation?.period || '',
      },
      structure: {
        ayahCount: s.structure?.verse_count ?? s.ayahCount ?? null,
        wordCount: s.structure?.word_count ?? null,
        letterCount: s.structure?.letter_count ?? null,
        juz: s.structure?.juz ?? null,
        hizb: s.structure?.hizb ?? null,
        pageStart: s.structure?.page_start ?? s.pageStart ?? null,
        pageEnd: s.structure?.page_end ?? null,
      },
      themes: s.themes || [],
      significance: s.significance || '',
    })),
  };
}

function attrsFromTag(tag) {
  const attrs = {};
  const attrRe = /([:\w-]+)\s*=\s*"([^"]*)"/g;
  let match;
  while ((match = attrRe.exec(tag))) attrs[match[1]] = match[2];
  return attrs;
}

function buildSurahNameMap(surahMetadata) {
  const map = new Map();
  for (const surah of surahMetadata.surahs || []) {
    map.set(Number(surah.number), {
      nameArabic: surah.nameArabic,
      nameEnglish: surah.nameEnglish,
      nameTransliteration: surah.nameTransliteration,
    });
  }
  return map;
}

function juzForPage(juzIndex, pageNumber) {
  const list = juzIndex.juz_info || juzIndex.juzs || [];
  const found = list.find((j) => {
    const start = Number(j.page_start ?? j.pageStart ?? 0);
    const end = Number(j.page_end ?? j.pageEnd ?? 0);
    return start && end && pageNumber >= start && pageNumber <= end;
  });
  return found ? Number(found.number ?? found.index) : null;
}

function parsePageIndexFromQuranDataXml(xml, juzIndex, surahMetadata) {
  const surahNames = buildSurahNameMap(surahMetadata);
  const pageTags = [...xml.matchAll(/<page\b[^>]*\/?>/g)].map((m) => m[0]);
  const pages = [];

  for (const tag of pageTags) {
    const attrs = attrsFromTag(tag);
    const page = Number(attrs.index ?? attrs.number ?? attrs.page);
    const surah = Number(attrs.sura ?? attrs.surah);
    const ayah = Number(attrs.aya ?? attrs.ayah);

    if (!page || !surah || !ayah) continue;

    const names = surahNames.get(surah) || {};
    pages.push({
      page,
      startSurah: surah,
      startAyah: ayah,
      key: `${surah}:${ayah}`,
      juz: juzForPage(juzIndex, page),
      surahNameArabic: names.nameArabic || '',
      surahNameEnglish: names.nameEnglish || '',
      surahNameTransliteration: names.nameTransliteration || '',
    });
  }

  pages.sort((a, b) => a.page - b.page);
  return pages;
}

function buildFallbackPageRangeIndex(juzIndex, surahMetadata) {
  const pages = [];
  for (let page = 1; page <= 604; page++) {
    const surahsOnPage = (surahMetadata.surahs || [])
      .filter((s) => {
        const start = Number(s.structure?.pageStart ?? 0);
        const end = Number(s.structure?.pageEnd ?? 0);
        return start && end && page >= start && page <= end;
      })
      .map((s) => ({
        surah: s.number,
        nameArabic: s.nameArabic,
        nameEnglish: s.nameEnglish,
        nameTransliteration: s.nameTransliteration,
      }));

    pages.push({
      page,
      startSurah: null,
      startAyah: null,
      key: null,
      juz: juzForPage(juzIndex, page),
      surahsOnPage,
    });
  }
  return pages;
}

async function buildPageIndex(juzIndex, surahMetadata) {
  const xmlCandidates = [
    'content/quran/archive/quran-data.xml',
    'content/quran/source/metadata/quran-data.xml',
    'content/quran/quran-data.xml',
  ];

  for (const candidate of xmlCandidates) {
    const xml = await readLegacy(candidate, { required: false });
    if (!xml) continue;

    const pages = parsePageIndexFromQuranDataXml(xml, juzIndex, surahMetadata);
    if (pages.length >= 604) {
      return {
        schema: 'noor.quran.page-index.v1',
        generatedAt: GENERATED_AT,
        source: sourceMeta(candidate),
        precision: 'tanzil-quran-data-pages',
        totalPages: pages.length,
        pages,
      };
    }

    log(`  ⚠ ${candidate} found, but only ${pages.length} page records parsed`);
  }

  log('  ⚠ using fallback page-range index because precise page XML was unavailable');
  return {
    schema: 'noor.quran.page-index.v1',
    generatedAt: GENERATED_AT,
    source: {
      ...sourceMeta('content/quran/source/metadata/surah_info.json + content/quran/db/metadata/juz-index.json'),
      warning: 'Precise Mushaf page starts were not available. This fallback contains page-to-surah-range data only.',
    },
    precision: 'metadata-derived-surah-page-range',
    totalPages: 604,
    pages: buildFallbackPageRangeIndex(juzIndex, surahMetadata),
  };
}

async function main() {
  log('\nBismillah — Sprint 28.6A.1 legacy navigation metadata import\n');

  const maybeManifest = path.join(ROOT, 'noor-cdn', 'manifest', 'noor-content-manifest.json');
  if (!fssync.existsSync(maybeManifest)) {
    log('  ⚠ noor-cdn/manifest/noor-content-manifest.json not found.');
    log('    Continue only if you are intentionally running from the noor-cdn repository root.\n');
  }

  const juzRaw = await readLegacy('content/quran/db/metadata/juz-index.json');
  const surahRaw = await readLegacy('content/quran/source/metadata/surah_info.json');
  const editionsRaw = await readLegacy('content/quran/selected-editions.json');
  const tafseerGapsRaw = await readLegacy('content/tafsir/GAPS.md');

  const legacyJuz = parseJson(juzRaw, 'legacy juz-index.json');
  const legacySurahInfo = parseJson(surahRaw, 'legacy surah_info.json');
  const legacyEditions = parseJson(editionsRaw, 'legacy selected-editions.json');

  const juzIndex = {
    _noor: {
      schema: 'noor.quran.juz-index.v1',
      ...sourceMeta('content/quran/db/metadata/juz-index.json'),
    },
    ...legacyJuz,
  };

  const surahMetadata = normalizeSurahMetadata(legacySurahInfo);

  const editionRegistry = {
    _noor: {
      schema: 'noor.manifest.edition-registry.v1',
      ...sourceMeta('content/quran/selected-editions.json'),
      note: 'Legacy edition registry imported for display/source labels only.',
    },
    ...legacyEditions,
  };

  const pageIndex = await buildPageIndex(juzIndex, surahMetadata);

  const hadithCollectionDisplayMetadata = {
    schema: 'noor.hadith.collection-display-metadata.v1',
    generatedAt: GENERATED_AT,
    source: sourceMeta('apps/web/lib/collections.ts'),
    groups: GROUPS,
    groupOrder: ['the_9_books', 'other_books', 'forties'],
    collections: HADITH_COLLECTIONS.map((collection) => ({
      normalizedSlug: collection.normalizedSlug || collection.slug,
      ...collection,
    })),
  };

  const tafseerGaps = [
    '# NOOR Tafseer Language Gaps',
    '',
    `Imported by Sprint ${SPRINT_ID} on ${GENERATED_AT}.`,
    '',
    'Source: `EffortEdutech/muslim-companion-poc/content/tafsir/GAPS.md`',
    '',
    'This is a roadmap/reference document only. It is not a content certification document.',
    '',
    '---',
    '',
    tafseerGapsRaw,
  ].join('\n');

  const navManifest = {
    schema: 'noor.navigation-metadata-manifest.v1',
    sprint: SPRINT_ID,
    generatedAt: GENERATED_AT,
    status: 'staging',
    sourceRepo: SOURCE_REPO,
    importedFiles: [
      {
        target: 'quran/navigation/juz-index.json',
        source: 'content/quran/db/metadata/juz-index.json',
        purpose: 'Quran Juz navigation and Juz ranges',
      },
      {
        target: 'quran/navigation/surah-metadata.json',
        source: 'content/quran/source/metadata/surah_info.json',
        purpose: 'Richer Surah metadata for browsing, teaching, and source panels',
      },
      {
        target: 'quran/navigation/page-index.json',
        source: pageIndex.source.path,
        purpose: 'Mushaf page navigation foundation',
        precision: pageIndex.precision,
      },
      {
        target: 'manifest/edition-registry.json',
        source: 'content/quran/selected-editions.json',
        purpose: 'Edition/source display labels and language direction metadata',
      },
      {
        target: 'hadith/collection-display-metadata.json',
        source: 'apps/web/lib/collections.ts',
        purpose: 'Hadith collection display names, Arabic names, authors, groups',
      },
      {
        target: '../../docs/content/TAFSEER_LANGUAGE_GAPS.md',
        source: 'content/tafsir/GAPS.md',
        purpose: 'Content roadmap for missing Tafseer languages',
      },
    ],
    warnings: [
      'Imported metadata is staging metadata only.',
      'Do not claim scholarly certification until provenance/licensing/scholar review is complete.',
      pageIndex.precision === 'metadata-derived-surah-page-range'
        ? 'Page index is fallback page-range metadata only. Replace with verified 604-page start references when available.'
        : null,
    ].filter(Boolean),
  };

  await writeJson('noor-cdn/quran/navigation/juz-index.json', juzIndex);
  await writeJson('noor-cdn/quran/navigation/surah-metadata.json', surahMetadata);
  await writeJson('noor-cdn/quran/navigation/page-index.json', pageIndex);
  await writeJson('noor-cdn/manifest/edition-registry.json', editionRegistry);
  await writeJson('noor-cdn/hadith/collection-display-metadata.json', hadithCollectionDisplayMetadata);
  await writeJson('noor-cdn/manifest/navigation-metadata-manifest.json', navManifest);
  await writeText('docs/content/TAFSEER_LANGUAGE_GAPS.md', tafseerGaps);

  log('\nAlhamdulillah — Sprint 28.6A.1 metadata import complete.\n');
  log('Next: node scripts/validate-legacy-navigation-metadata.mjs\n');
}

main().catch((error) => {
  console.error('\nImport failed:');
  console.error(error);
  process.exit(1);
});
