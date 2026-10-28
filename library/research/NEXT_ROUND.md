# Library research: notes for the next rounds

Written after round 1 (Oct 28, 2026). Round 1 produced 34 fact sheets; the shared web-search
budget (200 searches per turn, all agents together) ran out. Give each agent this file with
BRIEF.md.

## Budget and access
- About 200 web searches per turn, shared by every agent. Aim for 4–6 searches per entry:
  one for the label or fact sheet, one or two for the best review or trial, one for US status
  only if it isn't covered below. Run fewer agents (4) with more entries each, so the budget
  isn't burned on parallel duplicate searches.
- PubMed and NCBI Bookshelf often show a bot check to the page fetcher; PMC works sometimes.
  University repository copies, journal sites, Cochrane PDFs and Europe PMC worked instead.
- Links found inside a fetched page are usually refused; search for them instead.
- The shell can't reach fda.gov or NCBI; don't try.

## Status keys (normalized)
- `under_review`: off FDA's Category 2 list and waiting on an FDA decision about compounding
  (BPC-157, TB-500, KPV, MOTS-c, epitalon, semax, MT-2, PEG-MGF so far). Label: say what's pending.
- `not_approved`: not approved and on no list that allows compounding (including ones the
  advisers voted against).
- `category2`: still on FDA's Category 2 list (say 503A or 503B if it differs).

## The peptide compounding landscape (already sourced; cite these if you re-open them)
- FDA, Certain bulk drug substances that may present significant safety risks (Category 2):
  https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks
- FDA 503A categories list (May 14, 2026): https://www.fda.gov/media/94155/download
- FDA interim policy: https://www.fda.gov/media/174456/download
- April 2026: FDA took 12 peptides off Category 2 after nominations were withdrawn
  (FDA Law Blog: https://thefdalawblog.com/2026/04/fdas-peptide-rally-what-compounders-and-industry-need-to-know-post-1-of-2)
- July 23–24, 2026 PCAC meeting votes (McDermott summary:
  https://www.mcdermottlaw.com/insights/bulk-list-bound-pcac-backs-majority-of-peptides-in-two-day-public-meeting/):
  BPC-157 8-6, TB-500 8-6, KPV 8-6, semax 8-5, epitalon 7-4, MOTS-c 7-5 in favor; DSIP
  (emideltide) 6-7 against. FDA hadn't acted by late October.
- Federal Register notice of that meeting: https://www.federalregister.gov/documents/2026/04/16/2026-07361/pharmacy-compounding-advisory-committee-notice-of-meeting-establishment-of-a-public-docket-request
- FDA briefing documents (July 2026): BPC-157 https://www.fda.gov/media/193343/download,
  emideltide (DSIP) https://www.fda.gov/media/193344/download, KPV https://www.fda.gov/media/193346/download,
  semax https://www.fda.gov/media/193348/download, TB-500 https://www.fda.gov/media/193349/download
- Oct 14, 2026: HHS sent an "Interim Access Policy for Compounding Using Certain Peptides" to
  the White House (OIRA): https://www.reginfo.gov/public/do/eoDetails?rrid=1568964 ; unpublished
  as of Oct 26 (Holland & Knight: https://www.hklaw.com/en/insights/publications/2026/10/peptides-at-a-crossroads-what-wellness-providers-need-to-know)
- Second advisory review expected before end of February 2027 for MT-2, LL-37, dihexa, PEG-MGF,
  injectable GHK-Cu (no date set).
- October 2024 PCAC minutes: https://fda.gov/media/185412/download (kisspeptin 11-0 against;
  ipamorelin 0-12). December 4, 2024 minutes: https://www.fda.gov/media/185642/download
  (thymosin alpha-1 17-4 against; all five CJC-1295 forms against).
- Frier Levitt on the 2026 do-not-compound list: https://www.frierlevitt.com/articles/fda-peptides-do-not-compound-list-update-2026/
- WADA prohibited list 2026: https://www.wada-ama.org/en/prohibited-list (BPC-157, TB-4 and
  derivatives, ACE-031 banned)

## Facts already confirmed for unwritten entries
- tirzepatide: FDA ended its shortage Oct 2, 2024 (confirmed Dec 19, 2024); grace periods for
  copies ended Feb 18 and Mar 19, 2025. https://www.fda.gov/drugs/drug-alerts-and-statements/fda-clarifies-policies-compounders-national-glp-1-supply-begins-stabilize
- GLP-1 bulks list: May 2026 FDA proposal to keep semaglutide, tirzepatide and liraglutide off
  the 503B bulks list; comments closed July 30, 2026; no final decision found.
  https://www.govinfo.gov/content/pkg/FR-2026-05-01/html/2026-08552.htm ,
  https://www.govinfo.gov/content/pkg/FR-2026-06-26/html/2026-12937.htm ,
  https://www.ebglaw.com/health-law-advisor/fda-proposal-would-leave-semaglutide-tirzepatide-and-liraglutide-off-503b-bulks-list
- Jan 13, 2026: FDA asked to remove the suicidal behavior warning from Saxenda, Wegovy and
  Zepbound labels. https://www.fda.gov/drugs/drug-safety-and-availability/fda-requests-removal-suicidal-behavior-and-ideation-warning-glucagon-peptide-1-receptor-agonist-glp
- FDA's unapproved GLP-1 page (Oct 1, 2026): retatrutide and cagrilintide "cannot be used in
  compounding under federal law"; warning letters over research-use retatrutide, survodutide,
  mazdutide. https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss
- liraglutide: in shortage per FDA's Feb 2025 update; a law-firm article says still listed May
  2026 (unconfirmed on FDA's database).
- AOD-9604: off Category 2 only because the nomination was withdrawn; FDA still cites safety
  concerns; not among the April 2026 removals for review; never legally compoundable (law blog).
- thymosin alpha-1 (ta1): off Category 2 since Sept 2024 (withdrawn); PCAC voted 17-4 against
  on Dec 4, 2024.
- LL-37: off Category 2 since April 2026; review by end of Feb 2027; FDA cites animal/lab
  findings of harm to male reproduction and possible tumor promotion.
- VIP: Category 1 (under evaluation), May 14, 2026 list. Thymulin: Category 3.
  Afamelanotide, teduglutide, larazotide, thymalin, thymogen: not nominated.
- GHK-Cu: non-injectable back in Category 1; injectable off Category 2, awaiting review.
- Cibinetide (ARA-290): Category 3.
- selank: withdrawn nomination (possible immune reactions, no human safety data); on no current
  category; not scheduled for review.
- dihexa: FDA found no human exposure data; off Category 2 April 2026; review by end Feb 2027.
- cortexin: one randomized, unblinded Russian trial in 122 stroke patients:
  https://www.mediasphera.ru/issues/zhurnal-nevrologii-i-psikhiatrii-im-s-s-korsakova/2018/7/1199772982018071030
- pinealon: MDPI review (lab and modeling data only): https://www.mdpi.com/1420-3049/26/22/7053
- glutathione: Category 1 (under evaluation). Gonadorelin, hCG, menotropins (hMG), follitropin
  (FSH), testosterone: not on the nominations list (approved products exist for several).
- progesterone: Prometrium 2026 label https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/019781s026lbl.pdf ;
  Bijuva 2026 label https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/210132s013lbl.pdf ;
  FDA list of relabeled menopausal hormone therapy products
  https://www.fda.gov/drugs/drug-safety-and-availability/menopausal-hormone-therapies-updated-prescribing-information ;
  FDA label approvals Feb 2026 https://www.fda.gov/news-events/press-announcements/fda-approves-labeling-changes-menopausal-hormone-therapy-products
- estriol: Menopause Society 2022 statement summary (compounded "bioidentical" hormones raise
  safety concerns): https://www.eurekalert.org/news-releases/958174
- SS-31 (elamipretide): the old record says FDA approved it as Forzinity for Barth syndrome in
  2025. Confirm.
- igf1lr3, igf1des: add hypoglycemia from the Increlex (mecasermin) label.
- CJC-1295 / ipamorelin / AOD-9604: an FDA-law blog mentions a lawsuit; no outcome reported.

## Where to pick up
Every id in `batches/*.txt` without a file in `../data/entries/` is still to do (266 after round 1,
including 8 of the 9 blends, which are composed from their parts' sheets). Write entries to
`library/data/entries/<id>.json`, run `python3 library/research/validate.py`, then
`node scripts/build_library.mjs`, and commit.

## Entries written in round 1 (34)
bpc157 bronchogen cjc1295 crystagen dsip epithalon estradiol follistatin ghrp2 ghrp6 hexarelin
hghfrag igf1des igf1lr3 ipamorelin kisspeptin kpv leuprolide mgf modgrf129 motsc mt2 ovagen
pancragen pegmgf prostamax semaglutide semax sermorelin snap8 tb500 tesamorelin testagen
triptorelin

## Editor's follow-ups on written entries
- semaglutide: check the US label wording on NAION (the "very rare" rating is from EMA).
- estradiol: boxed-warning removals are rolling out product by product; WHI numbers come from
  conjugated estrogens; FDA dropped the dementia warning despite WHI's 65+ finding.
- leuprolide: heart-risk evidence conflicts (cohort vs. trial meta-analysis).
- hghfrag: the failed AOD-9604 trials are sourced only to a 2013 news report.
- sermorelin, cjc1295, ipamorelin, ghrp2, ghrp6: several findings come through FDA transcripts
  or reviews; primary papers still to add.
- ovagen: identity rests on one peptide catalog; bronchogen: sources disagree on amino-acid order.
- mgf vs pegmgf: make sure the two agree.
