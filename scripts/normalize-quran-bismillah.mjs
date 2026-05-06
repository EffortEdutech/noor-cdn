#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const QURAN_BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
const SURAH_WITHOUT_BISMILLAH_HEADER = 9;

const BISMILLAH_PREFIXES = [
  'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  'بسم الله الرحمن الرحيم'
];

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');
const shouldCheck = args.has('--check');

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function stripBismillahPrefix(arabic) {
  const trimmed = String(arabic ?? '').trimStart();

  for (const prefix of BISMILLAH_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      const next = trimmed.slice(prefix.length).trimStart();
      return { changed: next !== trimmed, value: next };
    }
  }

  return { changed: false, value: arabic };
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return { raw, json: JSON.parse(raw) };
}

async function listSurahFiles(quranDir) {
  const entries = await fs.readdir(quranDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /^\d{3}\.json$/.test(entry.name))
    .map((entry) => path.join(quranDir, entry.name))
    .sort();
}

function normalizeSurahJson(data, filePath) {
  const notes = [];
  const surahNumber = Number(data?.surah?.number ?? path.basename(filePath, '.json'));
  const firstAyah = Array.isArray(data?.ayahs)
    ? data.ayahs.find((ayah) => Number(ayah.ayah) === 1) ?? data.ayahs[0]
    : null;

  if (!data || typeof data !== 'object' || !data.surah || !Array.isArray(data.ayahs)) {
    return { changed: false, notes: [`SKIP ${path.basename(filePath)} invalid Surah JSON shape`], data };
  }

  if (!firstAyah) {
    return { changed: false, notes: [`SKIP ${String(surahNumber).padStart(3, '0')} no ayah 1 found`], data };
  }

  const before = stableStringify(data);

  if (surahNumber === 1) {
    data.surah.bismillah = QURAN_BISMILLAH;
    data.surah.hasBismillahHeader = false;
    data.surah.bismillahIsAyah = true;
  } else if (surahNumber === SURAH_WITHOUT_BISMILLAH_HEADER) {
    delete data.surah.bismillah;
    data.surah.hasBismillahHeader = false;
    data.surah.bismillahIsAyah = false;
  } else {
    const result = stripBismillahPrefix(firstAyah.arabic);

    if (result.changed && String(result.value ?? '').trim().length > 0) {
      firstAyah.arabic = result.value;
      notes.push(`Removed embedded Bismillah from ${surahNumber}:1`);
    } else if (result.changed) {
      notes.push(`WARNING ${surahNumber}:1 looked Bismillah-only; ayah text was not emptied`);
    }

    data.surah.bismillah = QURAN_BISMILLAH;
    data.surah.hasBismillahHeader = true;
    data.surah.bismillahIsAyah = false;
  }

  const after = stableStringify(data);
  return { changed: before !== after, notes, data };
}

async function updatePublishManifest(repoRoot, changedRelativePaths) {
  const manifestPath = path.join(repoRoot, 'publish-manifest.json');
  if (!existsSync(manifestPath)) return { changed: false, notes: ['publish-manifest.json not found; skipped'] };

  const { raw, json } = await readJson(manifestPath);
  if (!Array.isArray(json.files)) return { changed: false, notes: ['publish-manifest.json has no files array; skipped'] };

  const changedSet = new Set(changedRelativePaths.map((item) => item.replaceAll('\\', '/')));
  const notes = [];

  for (const file of json.files) {
    if (!changedSet.has(file.path)) continue;
    const absolute = path.join(repoRoot, file.path);
    if (!existsSync(absolute)) continue;
    const buffer = await fs.readFile(absolute);
    file.bytes = buffer.length;
    file.sha256 = sha256(buffer);
    notes.push(`Updated manifest checksum for ${file.path}`);
  }

  if (notes.length > 0) json.generatedAt = new Date().toISOString();

  const after = stableStringify(json);
  const changed = raw !== after;

  if (shouldWrite && changed) await fs.writeFile(manifestPath, after, 'utf8');
  return { changed, notes };
}

async function main() {
  const repoRoot = process.cwd();
  const quranDir = path.join(repoRoot, 'noor-cdn', 'quran', 'surahs');

  if (!existsSync(quranDir)) {
    console.error(`Cannot find Quran Surah directory: ${quranDir}`);
    console.error('Run this script from the root of the noor-cdn repository.');
    process.exit(2);
  }

  const files = await listSurahFiles(quranDir);
  const changedPaths = [];
  const warnings = [];

  for (const filePath of files) {
    const { raw, json } = await readJson(filePath);
    const result = normalizeSurahJson(json, filePath);
    const nextRaw = stableStringify(result.data);
    const relativePath = path.relative(repoRoot, filePath).replaceAll('\\', '/');

    if (raw !== nextRaw || result.changed) {
      changedPaths.push(relativePath);
      if (shouldWrite) await fs.writeFile(filePath, nextRaw, 'utf8');
    }

    warnings.push(...result.notes.filter((note) => note.includes('WARNING') || note.includes('SKIP')).map((note) => `${relativePath}: ${note}`));
  }

  const manifestResult = await updatePublishManifest(repoRoot, changedPaths);

  console.log(`Checked ${files.length} Quran Surah JSON files.`);

  if (changedPaths.length > 0) {
    console.log(shouldWrite ? 'Updated files:' : 'Files requiring normalization:');
    for (const item of changedPaths) console.log(`- ${item}`);
  }

  if (manifestResult.notes.length > 0) {
    console.log('Manifest:');
    for (const note of manifestResult.notes) console.log(`- ${note}`);
  }

  if (warnings.length > 0) {
    console.log('Warnings:');
    for (const item of warnings) console.log(`- ${item}`);
  }

  if (changedPaths.length === 0 && !manifestResult.changed) {
    console.log('Quran Bismillah normalization is already clean.');
  } else if (!shouldWrite && !shouldCheck) {
    console.log('Dry-run only. Re-run with --write to apply changes.');
  }

  if (shouldCheck && (changedPaths.length > 0 || manifestResult.changed)) {
    console.error('Quran Bismillah normalization is required.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
