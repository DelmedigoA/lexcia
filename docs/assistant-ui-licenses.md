# Assistant UI license review

Reviewed October 18, 2026 against `website/package-lock.json`, installed package
metadata and license files, copied-source comments, and the upstream assistant-ui
[MIT license](https://github.com/assistant-ui/assistant-ui/blob/main/LICENSE).

## Findings

All five installed `@assistant-ui/*` packages declare MIT and include the MIT text:

| Package | Locked version |
| --- | --- |
| @assistant-ui/react | 0.15.23 |
| @assistant-ui/react-generative-ui | 0.0.22 |
| @assistant-ui/core | 0.3.22 |
| @assistant-ui/store | 0.3.16 |
| @assistant-ui/tap | 0.9.20 |

The adapted welcome/thread, TraceLine/ShimmerLabel, follow-up suggestions,
GuardrailNotice, Diagram, FlowGraph, Chart, DataTable, table-reservation form and create-event summary come from the
same MIT-licensed project. Their source references and shared copyright/permission
notice are retained in `website/public/licenses/assistant-ui.txt`, which Vite
copies into the deployed site's `/licenses/assistant-ui.txt`.

MIT permits commercial use and modification with retention of its copyright and
permission notice. No paid license, mandatory visible assistant-ui branding, or
source-disclosure requirement was found in these licenses. Hosted assistant-ui
services are separate products; this review covers the UI code used here.

## Supporting dependencies and attribution gaps

The full frontend runtime dependency tree is **not entirely MIT**. It also declares
BSD-2-Clause (`entities`), BSD-3-Clause (`secure-json-parse`), Python-2.0 (`argparse`)
and 0BSD (`tslib`). These are permissive licenses; no copyleft or commercial-use
prohibition was found in the locked runtime dependency license metadata.

`website/public/licenses/runtime-dependencies.txt` now retains the available full
license texts for all locked non-development dependencies, including packages
that tree shaking may omit. Regenerate it after `npm ci` or dependency updates:

```sh
cd website
node scripts/license-notices.mjs
```

Two published packages declare MIT but omit a license file:

- `react-remove-scroll-bar@2.3.8`: README also says MIT. The current upstream
  [license](https://github.com/theKashey/react-remove-scroll-bar/blob/master/LICENSE)
  identifies Anton Korzunov, but a license tied to the installed release was not
  verified.
- `use-composed-ref@1.4.0`: package metadata declares MIT; no separate license or
  copyright text was found in its published package or the inspected upstream
  [repository](https://github.com/Andarist/use-composed-ref).

The generated notices explicitly identify these gaps rather than inventing
copyright notices. Confirm release-specific attribution with the upstream
maintainers before treating the entire dependency tree's notice compliance as
fully resolved. This does not change the verified MIT status of assistant-ui's
own packages and copied components.

Scope excludes the Python backend, development-only tools, unrelated subprojects,
fonts, and branding assets. This is a source/dependency review, not a guarantee
about all intellectual-property rights or future dependency versions.
