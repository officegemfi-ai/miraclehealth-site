# Miracle Health library: research brief

You are writing entries for the Miracle Health public library (miraclehealth.us/library): one page per
peptide, hormone, supplement or medication that members of an online community take. Each page must be
the most trustworthy plain-English summary on the web, with every claim backed by a source you actually
opened. The pages will say "Fact-checked against primary sources · clinician review pending" and
"Experiences, not medical advice", so accuracy matters more than length.

## Hard rules
1. **Only state what a source you opened supports.** Use WebSearch to find sources and WebFetch to open
   them. Never invent or guess a PubMed ID, DOI, URL, author, year, trial size or finding. If you can't
   confirm something, leave it out. Fewer, solid claims beat more, shaky ones.
2. **No doses, schedules, routes-as-instructions or how-to-use, anywhere** (not in study summaries either).
   No sellers, shops, brands of research chemicals, prices or where to get it. Approved brand names
   (e.g. Ozempic) are fine in text.
3. **Neutral and plain.** Short sentences, no hype, no "miracle", no exclamation marks. Say "in rats" or
   "in a small trial of 40 adults" so readers know what the evidence is. US spelling.
4. **Prefer primary and authoritative sources**, in roughly this order: FDA (drug labels via
   DailyMed/accessdata.fda.gov, FDA compounding pages and announcements), NIH Office of Dietary
   Supplements fact sheets (ods.od.nih.gov) for vitamins, minerals and botanicals, PubMed/PMC
   (systematic reviews, meta-analyses, randomized trials first), LiverTox and other NCBI Bookshelf
   chapters, ClinicalTrials.gov, EMA, major clinical guidelines (Endocrine Society, etc.). Avoid blogs,
   vendor sites, forums and news unless nothing else exists (and then say so).
5. **Regulatory status is as of now (late 2026).** For peptides especially, check FDA's current position
   on compounding (bulk drug substance categories and any 2025-2026 changes) and say what you found,
   citing it. If sources conflict or you can't confirm the current state, say "status unclear" in the note.

## The JSON for each entry
Write one file per entry with the Write tool: `library/data/entries/<id>.json`
(valid JSON, UTF-8, no comments, no trailing commas). Shape:

```json
{
  "id": "bpc157",
  "name": "BPC-157",
  "summary": "One sentence, under 30 words: what it is and why people take it.",
  "what_it_is": "2 to 4 sentences: what kind of substance it is, where it comes from, and what it does in the body, in plain words.",
  "evidence": { "grade": "preclinical", "why": "One sentence on what the evidence for its main uses consists of." },
  "status_us": { "key": "category2", "label": "Short label, under 60 characters", "note": "One or two sentences with the specifics.", "sources": [2] },
  "goals": { "weight": 0, "muscle": 0, "recovery": 1, "energy": 0, "sleep": 0, "cognition": 0, "skin": 0.25, "sexual": 0, "longevity": 0, "gut": 0.75, "immune": 0, "hormonal": 0 },
  "benefits": [ { "claim": "Faster tendon and ligament healing in rats", "evidence": "preclinical", "sources": [1, 3] } ],
  "risks": [ { "risk": "Human safety has not been studied in trials", "how_common": "unknown", "sources": [1] } ],
  "avoid_if": [ "Pregnant or breastfeeding" ],
  "interactions": [ "None well documented" ],
  "labs": { "before": [ "..." ], "during": [ "..." ], "why": "One sentence on what the labs are for, or why none are routinely needed." },
  "studies": [ { "title": "Exact title of the paper or label", "year": 2018, "type": "Review", "people": "Rats", "finding": "One or two sentences on what it found.", "source": 1 } ],
  "ask_your_clinician": [ "Two or three practical questions to take to a clinician." ],
  "sources": [ { "n": 1, "title": "Exact title", "publisher": "Current Pharmaceutical Design (PubMed)", "year": 2018, "url": "https://pubmed.ncbi.nlm.nih.gov/..." } ],
  "notes_for_editor": "Anything uncertain, conflicting or worth a clinician's attention. Empty string if none.",
  "checked": "2026-10-28"
}
```

### Field rules
- **evidence.grade** (for its main uses): `strong` = several randomized controlled trials in humans, or an
  approved drug for that use; `moderate` = at least one good human RCT or several smaller human trials;
  `limited` = small, short or uncontrolled human studies; `preclinical` = animal or cell studies only;
  `anecdotal` = user reports only. Each benefit gets its own grade by the same scale.
- **status_us.key**, one of: `under_review` (off FDA's Category 2 list, waiting on an FDA decision about compounding; see NEXT_ROUND.md), `approved` (an FDA-approved drug; say for what, and mention DEA schedule if
  any), `otc` (approved for over-the-counter sale), `supplement` (sold as a dietary supplement; not
  FDA-evaluated for these uses), `compounded` (not an approved product, but can be compounded by a
  pharmacy under a prescription), `category2` (FDA lists it as a bulk substance with significant safety
  concerns, so pharmacies may not compound it), `investigational` (in clinical trials, not approved),
  `not_approved` (no approval anywhere for human use; sold as a "research chemical"), `restricted`
  (other restriction, e.g. banned in supplements; explain), `unclear` (sources conflict; explain).
- **goals**: how much it is used or studied for each of the 12 goals, as 0, 0.25, 0.5, 0.75 or 1. Ids:
  weight (weight & metabolic health), muscle (muscle & body composition), recovery (injury recovery &
  joints), energy (energy & mitochondria), sleep, cognition (focus, mood & cognition), skin (skin, hair &
  appearance), sexual (sexual health & libido), longevity (healthy aging), gut (gut & inflammation),
  immune (immune resilience), hormonal (hormone balance). Its main use gets 1; most goals stay 0.
- **benefits**: 2 to 6, most important first. State the effect and the population ("in adults with
  type 2 diabetes"). Each with an evidence grade and source numbers.
- **risks**: 2 to 6: the side effects and safety concerns that matter most. `how_common` is one of
  `common` (about 1 in 10 users or more), `uncommon` (1 in 100 to 1 in 10), `rare` (under 1 in 100),
  `theoretical` (a concern from how it works, not observed), `unknown` (not studied). Include boxed
  warnings for approved drugs.
- **avoid_if**: 1 to 5 groups who should avoid it or need a clinician first (contraindications).
- **interactions**: 0 to 5 notable drug or supplement interactions; ["None well documented"] if none.
- **labs** ("blood markers to watch"): `before` = baseline tests a clinician would reasonably order,
  `during` = monitoring. Use the drug label or a guideline when one exists. For research peptides with no
  evidence-based monitoring, list a general health check and say plainly in `why` that no
  evidence-based monitoring exists. For ordinary supplements, often none are needed: leave the lists
  empty and say so in `why` (or name the one marker that matters, e.g. 25(OH)D for vitamin D).
- **studies**: 1 to 4 key studies, strongest first (meta-analysis, RCT, then the rest). `type` is one
  of: Meta-analysis, Systematic review, RCT, Trial, Cohort, Case series, Case report, Animal, Cell,
  Review, Label, Guideline. `people` says who was studied ("1,961 adults with obesity", "Rats").
- **sources**: 2 to 10, numbered from 1 in the order first cited. Every number used in `status_us`,
  `benefits`, `risks` and `studies` must exist here. URLs exactly as opened.
- **notes_for_editor**: be honest about gaps.

## Seed records
Some entries existed in an older prototype. For those, the old record is in
an old prototype file (no longer kept)
(the `compounds` array, matching `id`). It was never verified: use it as a lead, check every claim,
correct what's wrong, and cite. Its evidence grades and regulatory notes are especially likely to be
out of date.

## When you finish
Validate with `python3 library/research/validate.py` (structure, source numbers, no doses), then run
`node scripts/build_library.mjs` and commit.
Reply with: the ids written, and one line per entry where the evidence was thin, sources conflicted
or the US status is uncertain. Keep the reply short; the files are the deliverable.
