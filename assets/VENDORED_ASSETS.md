# Vendored assets

Assets in this directory are vendored so the public site has no third-party
runtime CDN dependency. Each asset records its source, license, integrity
hash, and update procedure.

## three.module.js

- Version: 0.160.0 (Three.js)
- Source: https://unpkg.com/three@0.160.0/build/three.module.js
- License: MIT — see `THREE_LICENSE.txt`
- SHA-256: 76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495
- Imported by `app.js` as a local ES module (`./assets/three.module.js`).
- Update procedure:
  1. Download the new version from the pinned source URL.
  2. Verify the file header comment and the MIT license (see THREE_LICENSE.txt).
  3. Verify the SHA-256 and update this file.
  4. Run `python scripts/verify-site.py` (checks the import resolves).
  5. Manually verify the 3D city renders (WebGL) and the static fallback works
     (no-WebGL / reduced-motion) before merging.
