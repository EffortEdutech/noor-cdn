# CDN-QURAN-01 — Normalize Quran Bismillah in noor-cdn

**Project:** NOOR CDN  
**Task:** CDN-QURAN-01  
**Scope:** Add repeatable Quran Bismillah normalization script and governance docs

---

## 1. Purpose

Normalize Quran Surah JSON so Bismillah is not embedded inside ayah 1 for Surah 2 to Surah 114.

Surah 1 remains unchanged because Bismillah is ayah 1 in Al-Fatihah.

Surah 9 remains without Bismillah header.

---

## 2. Files Added

```text
docs/content/QURAN_DATA_NORMALIZATION_RULES.md
docs/CDN_QURAN_01_NORMALIZE_BISMILLAH.md
scripts/normalize-quran-bismillah.mjs
```

The script will modify Quran JSON files only when run with:

```powershell
node scripts/normalize-quran-bismillah.mjs --write
```

---

## 3. Script Behavior

```text
[ ] Reads noor-cdn/quran/surahs/*.json.
[ ] Keeps Surah 1 Bismillah as ayah 1.
[ ] Removes Bismillah prefix from ayah 1 for Surah 2 to 114 except Surah 9.
[ ] Adds Surah-level Bismillah metadata.
[ ] Keeps Surah 9 without Bismillah header.
[ ] Updates publish-manifest.json byte sizes and SHA-256 for modified paths already tracked by that manifest.
[ ] Supports --check for CI/manual verification.
[ ] Supports dry-run mode when neither --check nor --write is passed.
```

---

## 4. Commands

From the `noor-cdn` repo:

```powershell
git checkout main
git pull origin main
git checkout -b content/quran-bismillah-normalization

node scripts/normalize-quran-bismillah.mjs --check
node scripts/normalize-quran-bismillah.mjs --write
node scripts/normalize-quran-bismillah.mjs --check

git status
```

The first `--check` may fail if normalization is needed. That is expected.

The final `--check` should pass after `--write`.

---

## 5. Commit

```powershell
git add docs/content/QURAN_DATA_NORMALIZATION_RULES.md `
        docs/CDN_QURAN_01_NORMALIZE_BISMILLAH.md `
        scripts/normalize-quran-bismillah.mjs `
        noor-cdn/quran/surahs `
        publish-manifest.json

git commit -m "fix: normalize Quran Bismillah metadata"
```

Do not push until content review is green.
