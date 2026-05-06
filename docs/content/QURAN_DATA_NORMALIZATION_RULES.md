# Quran Data Normalization Rules

**Project:** NOOR CDN  
**Rule status:** Locked content normalization rule  
**Applies to:** `noor-cdn/quran/surahs/*.json`

---

## 1. Bismillah Canonical Rule

Canonical Quran CDN JSON must not embed Bismillah inside ayah 1 for Surah 2 to Surah 114.

Exception:

```text
Surah 1, Al-Fatihah:
Bismillah is ayah 1.
```

Special case:

```text
Surah 9, At-Tawbah:
No Bismillah header.
```

---

## 2. Canonical Metadata

### 2.1 Surah 1

```json
{
  "bismillah": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
  "hasBismillahHeader": false,
  "bismillahIsAyah": true
}
```

### 2.2 Surah 2 to Surah 114, except Surah 9

```json
{
  "bismillah": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
  "hasBismillahHeader": true,
  "bismillahIsAyah": false
}
```

Ayah 1 Arabic text must not start with Bismillah.

### 2.3 Surah 9

```json
{
  "hasBismillahHeader": false,
  "bismillahIsAyah": false
}
```

No `bismillah` field is required for Surah 9.

---

## 3. Script

Use:

```powershell
node scripts/normalize-quran-bismillah.mjs --check
node scripts/normalize-quran-bismillah.mjs --write
node scripts/normalize-quran-bismillah.mjs --check
```

---

## 4. Safety Rules

```text
[ ] Do not manually edit 114 Surah JSON files.
[ ] Use the normalization script.
[ ] Review git diff before commit.
[ ] Keep app-side display guard in noor even after CDN is normalized.
[ ] If publish-manifest.json tracks a modified file, update its bytes and SHA-256.
```
