# Sprint 28.6A.1 Juz Index Hotfix

The old `muslim-companion-poc` legacy Juz file declares 30 Juz but contains only 7 records. This hotfix generates a complete standard 30-Juz navigation index.

Copy `scripts/fix-complete-juz-index.mjs` into your `noor-cdn/scripts/` folder, then run:

```powershell
node .\scripts\fix-complete-juz-index.mjs
node .\scripts\validate-legacy-navigation-metadata.mjs
```
