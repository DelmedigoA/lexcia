# Bearing Witness homepage and ArchiveLens integration

**Date:** October 4, 2026\
**Workspace:** `/Users/delmedigo/Dev/rabota/demos/bearing-witness`\
**Local frontend:** http://127.0.0.1:5174/\
**ArchiveLens backend:** http://127.0.0.1:8766/

## Purpose

We reviewed the September 29 product-design meeting summary in Google Drive. The agreed exercise was to copy the Bearing Witness homepage, integrate the existing bot through an embedded assistant, and iterate on the launcher and conversation interface. The broader purpose was to assess design quality and delivery effort before approaching potential customers.

Meeting source: [2026-09-29 — Product Design.md](https://drive.google.com/file/d/1qw5ZpgzE9Y9Rpn0mnnqYx5m3R3uA0Vn4/view).

## Design decisions

The assistant should feel like a research tool: quiet, minimal, elegant and appropriate to the archive. We deliberately avoided a named assistant persona, robot imagery, avatars and promotional greetings.

The final direction uses:

- **Brand accent:** `#8b2120`.
- **Typography:** IBM Plex Sans for headings and controls; Figtree for answer text, matching the font families used on Bearing Witness.
- **Launcher:** a small outlined button with an abstract line icon. Its “Explore the archive” label expands on hover or keyboard focus over 200 ms. Touch devices retain the label.
- **Panel:** “Archive” title, new inquiry, pin, expand and close controls, conversation area, and a question composer.
- **Empty state:** “Ask the archive.”
- **Responsive behavior:** a floating desktop panel and a viewport-constrained mobile layout.
- **Accessibility:** accessible control names, focus return on close, Escape to close, Enter to submit, Shift+Enter for a newline, and reduced-motion support.

## Pinned assistant update

The launcher now sits at the lower-left of the homepage. The pin control docks the live ArchiveLens session at the left edge and gives the rest of the viewport to the Bearing Witness page, following ArchiveLens’s split-workspace document-viewer behavior. The floating modal now uses native dialog focus management, returns focus to its launcher on close, responds to Escape, and animates open/close while honoring reduced-motion preferences.

The pinned divider supports pointer dragging and keyboard resizing: Left/Right Arrow adjusts its width, while Home and End set the minimum and maximum. Its selected width is stored locally. The floating window can also be resized from its upper-right corner or with arrow keys; double-click or Home restores its default dimensions. Its size is stored locally. On narrow/mobile viewports, pinning leaves the assistant in its floating layout so the page is not split.

The header's conversations control lists local transcript history and the plus control starts a new ArchiveLens inquiry. Earlier transcripts open read-only because the current ArchiveLens server exposes one shared in-memory conversation and no session restore endpoint. The active transcript is also saved in browser storage.

We removed the earlier “THE ARCHIVE / AI-ASSISTED INQUIRY” and “RESEARCH / 01” labels, the extra brand heading, starter prompts, example-format buttons, sample badges, preview labels and keyboard-help copy. The final product surface contains no sample responses or statistics.

## Reference interfaces

The work combined ideas from Sefaria and assistant-ui, adapted to Bearing Witness rather than copying either product’s complete stack.

| Reference | What informed our implementation |
| --- | --- |
| [Bearing Witness homepage](https://bearing-witness.com/) | Actual page content, images, logo, colors and font families |
| [Sefaria](https://www.sefaria.org.il/) and [LCChatbot.svelte](https://github.com/Sefaria/ai-chatbot/blob/main/src/components/LCChatbot.svelte) | Expanding launcher label, restrained floating panel and compact controls |
| [Sefaria HeaderButton.svelte](https://github.com/Sefaria/ai-chatbot/blob/main/src/components/HeaderButton.svelte) | Subtle toolbar hover and focus treatment |
| [assistant-ui modal](https://github.com/assistant-ui/assistant-ui/blob/main/apps/docs/components/pages/docs/samples/assistant-modal.tsx) and [modal features](https://www.assistant-ui.com/examples/modal#features) | Focus-managed modal, thread-list and new-thread controls, resize behavior, keyboard access and motion, adapted to this app's one-session backend |
| [AiButton reference](https://github.com/neuronection/assistant-ui/blob/main/docs/components/ai-button.md) | Labeled entry point and prompt-panel interaction |
| [assistant-ui components](https://www.assistant-ui.com/components) | Answer rendering, charts, tables and generative UI patterns |

Sefaria’s ai-chatbot README identifies the repository as MIT-licensed. We inspected its source for relevant interaction patterns. The installed assistant-ui package supplies the generative UI renderer; the final chat shell is custom HTML/CSS/JavaScript.

## Homepage copy

The first iteration used a design canvas. We subsequently replaced it with the actual public Bearing Witness homepage downloaded on October 4, 2026. No user upload was needed.

The local copy includes the deployed homepage bundle, stylesheets, header script, logo and image assets. Asset origins and sizes are recorded in `public/mirror/manifest.json`. Original copyright notices remain.

The homepage runs in a local, same-origin iframe so its styles do not interfere with the assistant. Deeper site navigation opens the original public pages; those pages were not copied. Google Fonts remains an external dependency. Nothing was deployed or published to the live Bearing Witness site.

## ArchiveLens connection

We located the existing project at `/Users/delmedigo/Dev/ArchiveLens`, read its project guidance and API implementation, and started its web server using `config/archive-lens.yaml`.

The frontend reuses the existing backend rather than implementing another retrieval or model service:

1. The composer sends `{ "question": "…" }` to `POST /api/chat/stream`.
2. Vite proxies the request to ArchiveLens on port 8766.
3. The frontend handles the backend’s `status`, `delta`, `item`, `final` and `error` SSE events.
4. Answers render with ArchiveLens’s existing Markdown and citation formatter.
5. Archive citations open source URLs; document citations open the proxied PDF at the referenced page.
6. New inquiry calls `POST /api/chat/reset`; Stop aborts the active request.

The formatter was copied into `src/vendor/archivelens-formatting.js`. No backend source code was changed. Existing model settings, relevance guard, retrieval and evidence-selection behavior remain in ArchiveLens. Credentials stay on the backend and are not exposed to the browser.

### Session behavior

The existing backend maintains one in-memory conversation shared by clients of that server process. It does not currently provide separate per-user sessions or a history-loading endpoint.

The panel uses that conversation context directly. Visible messages live in the current page; refreshing the frontend clears its visible messages without resetting backend context. New inquiry resets the server conversation. This is a local development integration, not a multi-user deployment.

## Charts, tables and generative UI

We added reusable answer components:

- Area, line and bar charts, with progressive point reveal, variant selection, replay and accessible values.
- Sortable tables with numeric/text formatting and responsive card layouts.
- Composed answers built from cards, rows, facts, text and source links.

`@assistant-ui/react-generative-ui` renders JSON component trees. Zod validation restricts output to `Card`, `Row`, `Text`, `Fact`, `Chart`, `DataTable` and `Source`. Validation rejects unsupported components and props, unsafe source URL schemes, non-finite numeric data, and excessive tree depth or size.

Early iterations exposed synthetic examples to review these components. Those examples were removed from the application after the request to connect real ArchiveLens answers. Synthetic fixtures remain only in automated tests.

**Current boundary:** ArchiveLens returns Markdown and source items, not model-generated component trees. The frontend can render a validated `ui` field in a final event, and exports a present-tool factory for future integration. The backend still needs explicit structured-output/tool wiring before the model can compose charts and tables. We do not invent data or automatically turn ordinary answers into charts.

## Main files

| File | Responsibility |
| --- | --- |
| `index.html` | Homepage iframe, launcher, minimal panel and composer |
| `src/style.css` | Brand fonts, hover expansion, panel styling and responsive answer layouts |
| `src/app.js` | Panel controls, live request lifecycle, answer rendering and citations |
| `src/archive-client.js` | ArchiveLens requests, SSE parsing and reset |
| `src/vendor/archivelens-formatting.js` | Reused ArchiveLens Markdown/citation formatting |
| `src/answer-ui.jsx` | Chart/table components and assistant-ui generative rendering |
| `src/ui-schema.js` | Structured-answer validation |
| `vite.config.js` | Backend and PDF proxy configuration |
| `public/mirror/` | Homepage entry point, navigation adaptation and asset manifest |
| `tests/` | Stream parsing and structured-output tests |
| `output/playwright/` | Screenshots from development and verification |
| `README.md` | Current setup and implementation notes |

## Verification completed

- Production build passed with `npm run build`.
- All **13 automated tests** passed: SSE parsing, split UTF-8/CRLF chunks, incomplete/error streams and structured-output validation.
- Browser checks covered launcher expansion/collapse, keyboard focus, Escape close, mobile panel bounds and removal of sample labels.
- Earlier component checks verified chart variants, ascending/descending numeric sorting and mobile table cards.
- The copied homepage’s desktop dropdown and mobile menu were checked.
- A real question was submitted through the panel: “What is Bearing Witness and what can I research here?” ArchiveLens streamed a substantive answer with links to Bearing Witness’s archive and document.
- The new-inquiry control successfully reset that test conversation.
- Computed fonts were confirmed as IBM Plex Sans for the panel heading and Figtree for answer text.

Relevant screenshots include `minimal-closed.png`, `minimal-hover.png`, `minimal-open.png`, `minimal-mobile.png` and `live-answer.png` in `output/playwright/`. Older screenshots show superseded design iterations.

## Running the result

Start ArchiveLens:

```sh
cd /Users/delmedigo/Dev/ArchiveLens
PYTHONPATH=src uv run python -m archivelens.web --config config/archive-lens.yaml
```

Start this frontend in another terminal:

```sh
cd "/Users/delmedigo/Dev/rabota/demos/bearing-witness"
npm install
npm run dev
```

Open http://127.0.0.1:5174/. The default backend target is http://127.0.0.1:8766; `ARCHIVELENS_URL` can override it for Vite. A production host would need equivalent `/api` and `/documents` proxy routes.

## Remaining work

- Wire model-generated component trees into ArchiveLens if live generative charts/tables are required.
- Add isolated user sessions and history restoration before a multi-user deployment.
- Decide on hosting and production proxy configuration if the local implementation will be published.
- Record delivery time and assess design quality against the meeting’s evaluation goals; this session did not establish a formal time-tracking record.
