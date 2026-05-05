# Sprint 28.6A.1 — Legacy Navigation Metadata Import

## 1. Purpose

Sprint 28.6A.1 prepares the NOOR CDN data foundation for the upcoming Quran navigation and GUI work.

The immediate objective is to import useful **navigation and display metadata** from the old `muslim-companion-poc` project into `noor-cdn`, without re-importing raw Quran/Tafseer/Hadith content.

## 2. Scope

Imported metadata:

| Area | Imported file |
|---|---|
| Quran Juz navigation | `noor-cdn/quran/navigation/juz-index.json` |
| Quran Surah metadata | `noor-cdn/quran/navigation/surah-metadata.json` |
| Quran page navigation | `noor-cdn/quran/navigation/page-index.json` |
| Quran/Tafseer/Hadith edition display labels | `noor-cdn/manifest/edition-registry.json` |
| Hadith collection display metadata | `noor-cdn/hadith/collection-display-metadata.json` |
| Navigation metadata manifest | `noor-cdn/manifest/navigation-metadata-manifest.json` |
| Tafseer language gap roadmap | `docs/content/TAFSEER_LANGUAGE_GAPS.md` |

## 3. Non-scope

This sprint does not:

- redesign the NOOR GUI,
- alter raw Quran/Tafseer/Hadith item files,
- promote content to production,
- certify scholarly correctness,
- change CDN publish rules,
- change the NOOR app repo.

## 4. Why this is needed before GUI work

The upcoming Quran reader must support professional navigation:

```txt
Surah
Verse
Juz
Page
```

The current Quran reader already has Surah/Ayah data, but the GUI needs metadata for:

- Juz ranges,
- page ranges,
- Surah themes,
- Surah significance,
- source labels,
- display names,
- Hadith collection grouping.

This sprint adds those foundations.

## 5. Review status

All imported metadata is marked as staging/imported metadata. It should be reviewed before being presented as final scholarly-certified content.

## 6. Validation

Run:

```powershell
node .\scripts\validate-legacy-navigation-metadata.mjs
```

Expected checks:

- 30 Juz records,
- 114 Surah metadata records,
- 604 Quran page navigation entries,
- Quran/Tafseer/Hadith edition registry exists,
- 17 Hadith collection display records,
- Tafseer language gap document exists.

If page metadata cannot be generated from legacy XML, the validator will warn that the page index is less precise.
