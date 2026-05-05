#!/usr/bin/env node
/**
 * Sprint 28.6A.1 — Validate Legacy Navigation Metadata
 *
 * Run from noor-cdn repo root:
 *   node scripts/validate-legacy-navigation-metadata.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing file: ${relativePath}`);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function warn(message) {
  console.warn(`  ⚠ ${message}`);
}

function ok(message) {
  console.log(`  ✓ ${message}`);
}

function main() {
  console.log('\nBismillah — validating Sprint 28.6A.1 legacy navigation metadata\n');

  const juz = readJson('noor-cdn/quran/navigation/juz-index.json');
  const surah = readJson('noor-cdn/quran/navigation/surah-metadata.json');
  const page = readJson('noor-cdn/quran/navigation/page-index.json');
  const editions = readJson('noor-cdn/manifest/edition-registry.json');
  const hadithCollections = readJson('noor-cdn/hadith/collection-display-metadata.json');
  const navManifest = readJson('noor-cdn/manifest/navigation-metadata-manifest.json');

  const juzList = juz.juz_info || [];
  assert(juzList.length === 30, `Expected 30 juz records, found ${juzList.length}`);
  ok('Quran Juz index has 30 records');

  assert(Array.isArray(surah.surahs), 'surah-metadata.json must contain surahs[]');
  assert(surah.surahs.length === 114, `Expected 114 Surah records, found ${surah.surahs.length}`);
  ok('Quran Surah metadata has 114 records');

  assert(Array.isArray(page.pages), 'page-index.json must contain pages[]');
  assert(page.pages.length === 604, `Expected 604 page records, found ${page.pages.length}`);
  ok('Quran page index has 604 records');

  if (page.precision !== 'tanzil-quran-data-pages') {
    warn(`page-index precision is "${page.precision}". This is acceptable for staging, but replace it with verified page starts before production Quran page navigation.`);
  } else {
    ok('Quran page index uses precise Tanzil page-start metadata');
  }

  assert(editions.quran?.editions?.length > 0, 'edition-registry.json missing quran.editions');
  assert(editions.tafsir?.editions?.length > 0, 'edition-registry.json missing tafsir.editions');
  assert(editions.hadith?.tier1_editions?.length > 0, 'edition-registry.json missing hadith.tier1_editions');
  ok('Edition registry has Quran, Tafseer, and Hadith sections');

  assert(Array.isArray(hadithCollections.collections), 'collection-display-metadata.json must contain collections[]');
  assert(hadithCollections.collections.length === 17, `Expected 17 Hadith collection display records, found ${hadithCollections.collections.length}`);
  ok('Hadith collection display metadata has 17 records');

  for (const group of ['the_9_books', 'other_books', 'forties']) {
    assert(hadithCollections.groups?.[group], `Missing Hadith group ${group}`);
  }
  ok('Hadith collection groups exist');

  assert(navManifest.sprint === '28.6A.1', 'navigation-metadata-manifest.json sprint should be 28.6A.1');
  ok('Navigation metadata manifest exists');

  const tafseerGapsPath = path.join(ROOT, 'docs/content/TAFSEER_LANGUAGE_GAPS.md');
  assert(fs.existsSync(tafseerGapsPath), 'Missing docs/content/TAFSEER_LANGUAGE_GAPS.md');
  ok('Tafseer language gap document exists');

  console.log('\nAlhamdulillah — validation complete.\n');
}

try {
  main();
} catch (error) {
  console.error('\nValidation failed:');
  console.error(`  ✗ ${error.message}`);
  process.exit(1);
}
