# Drawing a compound on Ask Sig's body map

The screen beside Ask Sig (`/ai`) shows how compounds work in the body, place by place, head to
toe, and where two or more meet. Sig's Markers agent reads the same map to tell which blood markers
each compound may move. Both read `library/data/body.json`. This is how a compound gets its entry
there. `scripts/check_body.mjs` checks every entry against these rules and its fact sheet.

## Where an entry comes from

One compound's entry comes from its own fact sheet, `library/data/entries/<id>.json`, and nothing
else: its `what_it_is`, `benefits`, `risks`, `labs`, `interactions`, `studies` and
`ask_your_clinician`. Each line cites the sheet's own source numbers (`src`), the numbers in its
`sources` list that back the line. Plain physiology may place a line (LH is made by the pituitary),
but never adds a claim the sheet doesn't make.

## The entry

```json
"ss31": {
  "route": "injection",
  "checked": "2026-10-28",
  "lines": [
    { "at": "mitochondria", "op": "is", "say": "binds cardiolipin in their inner membrane, where cells make energy", "src": [1] },
    { "at": "kidneys", "op": "watch", "say": "levels rise when kidney function is low; not studied on dialysis", "markers": ["kidney"], "src": [1] },
    { "at": "immune system", "op": "warn", "say": "serious allergic reactions reported, from minutes to months after starting", "risk": "allergy warning", "src": [1] }
  ],
  "dirs": { "kidney": "watch" },
  "ask": ["Does my kidney function affect whether this is safe for me?"]
}
```

- `route`: how it's taken, if the sheet says: one of `injection`, `pill`, `by mouth` (taken by
  mouth in more than one form), `powder`, `liquid`, `nasal spray`, `nasal drops`, `on the skin`, `under the
  tongue`, `infusion`, `implant`, `inhaled`, or two of them joined by ` or ` (`injection or pill`).
  Left out when the sheet doesn't say.
- `checked`: the sheet's own `checked` date, so a sheet changed later shows up as needing a redraw.
- `lines`: 3 to 10, in the sheet's order: how it works first, then what it does, then what's
  checked, then the cautions.
- `dirs`: every marker named in the lines, once, with its direction: `up` (the sheet says it
  rises), `down` (the sheet says it falls or may fall) or `watch` (the sheet says to check it, with
  no direction). Exactly the markers the lines name, no more.
- `ask`: one question copied word for word from the sheet's `ask_your_clinician`, the one that
  best fits the lines (it joins the questions a member takes to a clinician).

## A line

- `at`: the place, from the list below. Nothing else: places are what lets two compounds meet.
- `op`, what happens there:
  - `is`: what it is or does there, with no direction ("binds cardiolipin…", "no gain in…")
  - `up`: something the sheet says rises or increases ("LH and FSH rise", "strength rose…")
  - `down`: something the sheet says falls ("IGF-1 falls…", "appetite falls")
  - `block`: it blocks a receptor, an enzyme, a transporter or a feedback loop
  - `watch`: the sheet says to check it ("kidney function checked if vomiting is severe")
  - `warn`: a caution from the sheet's risks or warnings; needs `risk`
- `say`: what happens, in plain words, lowercase unless it starts with a name or abbreviation,
  90 characters at most (aim for 70), no full stop at the end.
- `src`: 1 to 4 of the sheet's source numbers that back this line.
- `markers`: blood markers from the list below that this line moves or checks.
- `risk`: on a `warn` line only, the caution's short name for a clinician question (2 to 4 words:
  "clot warning", "pancreatitis risk").

## What a line may say

- **Only what the sheet says.** Directions only as the sheet states them. A trial that found no
  benefit is drawn as `is`: "no gain in walking or fatigue in a 218-person myopathy trial".
- **How strong, when it isn't strong human evidence.** Say where it comes from in brackets when
  the sheet's evidence for it is limited, preclinical or anecdotal: "(mouse study)", "(rat
  studies)", "(lab studies)", "(small trial)", "(user reports)", "(in growth hormone deficiency)".
  Never make a mouse result sound like a human one. When the sheet says it has never been studied
  in people, the first line says so, at the place of its main mechanism: "binds IGF-1 receptors
  and lasts longer than IGF-1 (lab studies; never tested in people)".
- **Relatives don't lend effects.** Draw what two compounds share the same way (same place, op and
  phrase) so the screen shows where they meet, but only when both sheets say it. An effect never
  carries over from a relative's sheet: when a sheet says it didn't happen ("IGF-1 didn't rise in
  nine healthy men"), that's an `is` line saying so.
- **The body, not the bottle.** Places are anatomy. A caution about the product itself (purity,
  identity, contamination) has no place on the map: the fact sheet carries it, and the screen
  links there.
- **No doses, ever.** No amounts (mg, mcg, IU, units, mL) and no schedules ("once a week", "per
  day"). How long a study ran is fine ("after 8 weeks"), and so are a study's results ("about 15%
  less body weight in trials") when the sheet gives them.
- **No brands, sellers or labs**, no advice ("you should…", "take it…") and no diagnosis. Generic
  names only.
- **The few that matter.** The main way it works, its main effects as studied, the markers its
  labs list, and the 1 to 3 most serious or most common cautions (label warnings first). Not every
  side effect.

## Places, head to toe

`mitochondria` · `hair` (hair and scalp) · `brain` (appetite, mood, sleep, focus, desire) ·
`hypothalamus` · `pituitary` (growth hormone release, LH and FSH) · `eyes` · `nose` (nasal sprays)
· `thyroid` · `heart` (rate, rhythm, heart muscle) · `blood vessels` (blood pressure, widening) ·
`lungs` · `breast` · `stomach` (emptying, nausea) · `liver` · `gallbladder` · `pancreas` (insulin,
glucagon, pancreatitis) · `adrenals` · `kidneys` · `gut` (bowel, diarrhea, constipation) ·
`urinary · genital` (urinary and genital tract, erections, genital infections) · `blood sugar` ·
`blood` (red cells, clotting, lipids carried in it) · `immune system` (white cells, inflammation,
allergy) · `nerves` · `bone` · `muscle` · `tendons` (tendons and ligaments) · `fat` (body fat and
weight) · `skin` (also injection sites, tanning, wounds) · `uterus` · `ovaries` · `prostate` (and
PSA) · `testes` (testosterone made there, sperm) · `joints · fluid` (joints, swelling) · `feet` · `veins`
(blood clots) · `whole body` (only for a serious event with no one place: deaths in critical
illness, tumor growth in people with cancer; never for missing data, which the evidence grade on
the screen and the fact sheet already say)

## Blood markers

Lab tests only (blood, urine, semen), by key: `igf1`, `glucose`, `hba1c`, `thyroid`, `phosphate`,
`alp`, `pth`, `cortisol`, `lh`, `fsh`, `testosterone`, `estradiol`, `hematocrit`, `psa`, `semen`,
`eosinophils`, `kidney` (creatinine and eGFR), `lipids`, `triglycerides`, `liver` (ALT and AST),
`insulin`, `potassium`, `sodium`, `magnesium`, `calcium`, `copper`, `uricacid`, `prolactin`, `inr`, `cbc`
(complete blood count), `ferritin`, `b12`, `mma` (methylmalonic acid), `homocysteine`, `vitd`,
`ketones`, `urineprotein`. Their names and what each one is are in `body.json`'s `markers`. Blood pressure,
heart rate, scans and exams aren't markers: say them in a `watch` line without one.

## Check it

```
node scripts/check_body.mjs                 # the whole map
node scripts/check_body.mjs --drafts <dir>  # drafts, one <id>.json each, before they join the map
node scripts/check_body.mjs --merge <dir>   # check the drafts, then write them into body.json
```

It refuses a line on an unknown place, op or marker, a source number the sheet doesn't have, a
dose or a schedule, advice, a `warn` without `risk`, an `ask` that isn't the sheet's own words,
and `dirs` that don't match the lines. It warns when a sheet has no entry yet, or has changed since
its entry was drawn. What it can't check is whether the sheet really says it: that's the reviewer's
job, line by line, against the sheet.
