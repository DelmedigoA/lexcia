# Reviewed visuals in Lexcia answers

The answer model chooses one optional `visual` in the existing hidden follow-up
JSON footer. This is a model decision using the visitor question and conversation,
not a local keyword router. The Python backend maps the enum to reviewed data and
returns it in final SSE `ui`. The frontend validates and renders it through the
existing assistant-ui generative UI library. No extra model request or dependency
was added. An invalid/missing footer keeps the prose without a graphic.

| Choice | Visitor question | Renderer |
| --- | --- | --- |
| `integration_diagram` | How easy is integration? | Drawn process with zoom, reset and full-screen view |
| `integration_flow` | What are the onboarding steps? | Mapping, source connections and UI/brand/name work, testing, embedding and readiness |
| `pricing_table` | What does Lexcia cost? | Sortable table; cards and sorting selector in narrow panels |
| `api_cost_chart` | What are the additional API costs? | Two estimate series, style controls, replay and exact values |
| `contact_form` | I want to contact/email the Lexcia team | Compact Email/Subject/Content form with a fictional Send button |

These adapt the MIT-licensed assistant-ui Elements [Diagram](https://www.assistant-ui.com/elements/diagram),
[Flow graph](https://www.assistant-ui.com/elements/flow-graph),
[Data table](https://www.assistant-ui.com/elements/data-table), and
[Chart](https://www.assistant-ui.com/elements/chart) to Lexcia's existing runtime,
DOM/SSE controller, and paper/ochre/sage design. The shared MIT notice remains in
`website/public/licenses/assistant-ui.txt`. Integration graphics describe the
proposed onboarding approach rather than live progress or guaranteed sequencing.
English and Hebrew preset labels are supported; other languages currently use
English graphics alongside the model's localized prose.

## Pricing and source assumptions

[Target Market, Problem Definition, Pricing](https://docs.google.com/document/d/1__zDd0ZhdbDSQjDmCZIFABKPeqHIL2tu1kb3rxN7dhM/edit)
contains the original shekel ranges. Converted using the
[Bank of Israel October 16, 2026 rate](https://www.boi.org.il/roles/markets/exchangerates/usdollar/)
of ILS 3.089 per USD and rounded to $10:

| Terms | One-time setup | Monthly |
| --- | --- | --- |
| Early customers | $810–$2,430 | $80–$240 |
| Future standard pricing | $3,240–$8,090 | $320–$810 |

These are approximate planning ranges, not quotes. Scope affects pricing and API
usage is billed separately. This fixed conversion is dated; it does not track FX.
Asaf requested dollars only: the runtime presets now store fixed USD ranges, and
public answers, knowledge context and graphic footnotes omit shekel figures and
conversion details. The conversion provenance above is retained internally.

The October 11 [architecture brief](https://docs.google.com/document/d/1PvhcdWcqXxwvZjKGQxj3qyZrDg7Awb3LEoofBGgbzhw/edit)
provides the API model-token baseline: $1.82 per 1,000 answered questions and $3.05
per 1,000 tool-using questions. The chart scales these averages linearly by monthly
answered-question count and rounds monetary values to cents. At 750/month the
range is $1.37–$2.29; at 5,000/month it is $9.10–$15.25.

The source used 32 development requests / 85 calls, with 26 answered-question
traces and 13 tool-using traces, September 29–October 9. Mostly GPT-5.6 Luna traces
were repriced to GPT-6 Luna Standard ($0.10/million uncached input tokens and
$0.50/million output tokens). This is the historical planning assumption requested
by Asaf, not a live provider tariff, a GPT-6 Luna benchmark, or measured costs of
this landing assistant. No cache savings are assumed. Search, indexing, hosting,
paid tools, added protection and support are excluded from the token estimate;
some may be included in Lexcia's subscription. Actual usage costs vary with
models, context, output length, calls and paid operations.

Source content and provenance are in the `pricing` record in
`knowledge/lexcia.json`. Preset figures live in `backend/lexcia/visuals.py`; keep
these in sync with any revised commercial decision or estimate.

## Explicit contact requests

The former Draft email composer has been replaced by a compact native React form
with only Email, Subject and Content. There is no recipient field, draft badge,
review screen or edit/discard workflow. The model selects `contact_form` only when
the visitor explicitly asks to contact Lexcia; product, pricing, integration,
incidental email mentions, negated/hypothetical requests and mail to third parties
must not trigger it. Demo scheduling remains separate.

The recipient is fixed to `delmedigo.asaf@gmail.com`, explicitly supplied by Asaf
on October 18. The backend supplies this address and the frontend schema rejects
other recipients. The form's Send button is fictional: it only records a local preview-complete
state and shows ‘Preview only — no message was sent.’ It opens no email app and
makes no network request. Editing re-enables the button. Nothing is sent by the
chat and there is no mail-provider integration.
Typed fields are retained in page memory only and never included in answer-model
messages. No follow-up suggestions are shown on the contact-form turn. Retain the
MIT notice for the original assistant-ui form styling.

## Integration wording and welcome pinning

Asaf revised the integration story on October 18: the diagram is titled
“Bringing Lexcia to your website” and shows mapping/connections, building the
UI around customer needs and branding (including choosing a name), embedding
the snippet, and “You're ready to go.” Testing/refinement belongs within
preparation. The detailed graph ends in readiness after embedding. Knowledge
records and model instructions use this same sequence.

The first welcome suggestion pins the chat on desktop through its click callback
before submission. Other welcome choices keep their existing behavior. Mobile
retains its floating layout.

Integration icons follow the outline style in the visual-reference figure of
[Website Integration & Client Onboarding](https://docs.google.com/document/d/1NhgfU4uTeF1W7WlT6mng80LXYGMigmqtfHcLEAIx-o8/edit):
network (mapping/connections), palette (UI/branding), code brackets (embedding),
and circled check (ready). The detailed graph also uses a database for sources.
These are local SVG primitives, with allowed icon names checked by the component
schema. No external icon package, remote asset or image-generation dependency is
used. Icons are decorative; the graphics retain their accessible text labels.

## Incremental follow-up suggestions

The footer now places `visual` first (including explicit null) and `suggestions`
second. Complete suggestion objects are parsed and validated as chunks arrive,
deduplicated, and published as individual `suggestion` SSE events before `final`.
Contact-form or unknown visual prefixes never stream follow-ups. Legacy/unordered
footers retain final-only rendering, and final validation remains authoritative.

The browser displays streamed suggestions while the reply is finishing, keeping
them disabled until completion. New buttons fade in over 0.55 seconds with opacity
only; there is no translation or stagger delay. Stable prompt keys avoid replaying
the animation when later buttons arrive or the final list is reconciled. Reduced
motion disables the fade. Failed turns hide partial suggestions.
