# Library research: notes for the next rounds

Started after round 1 (Oct 28, 2026); updated after round 3. Round 1 produced 34 fact sheets; the shared web-search
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
Every id in `batches/*.txt` without a file in `../data/entries/` is still to do: 178 after round 3
(169 to research; the 9 blends are composed from their parts' sheets). Write entries to
`library/data/entries/<id>.json`, run `python3 library/research/validate.py`, then
`node scripts/build_library.mjs`, and commit. Work on a branch until the two desk reviews are done and
fixed; the site deploys from main.

Suggested round 4 (about 44): the hormones (abaloparatide, calcitonin, ndt, estriol, hydrocortisone,
insulin, levothyroxine, liothyronine, mecasermin, teriparatide), the remaining medications (amino1mq,
acarbose, phenylpiracetam, piracetam, tesofensine), and the peptides (ace031, ahkcu, ara290,
argireline, cartalax, chonluten, cortagen, cortexin, foxo4dri, larazotide, livagen, matrixyl, naselank,
nasemax, p21, pinealon, teduglutide, thymalin, thymogen, thymulin, vip, vesugen, vilon), plus a few
popular supplements. Rounds 5 to 7: the remaining supplements (ODS fact sheets cover 3–4 per search).

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
- tb4: SEER-2 (RGN-259 eye drops) results were due in November 2026; update the sheet when out.
- Decisions to watch: CagriSema (filed Dec 2025), orforglipron for type 2 diabetes, pemvidutide's
  phase 3 start, survodutide's filing; pramlintide's US discontinuation rests on one drug reference;
  exenatide's generic availability is unconfirmed.
- tb4 has 10 sources, so its compounding status (not nominated on FDA's 503A list) isn't on the page;
  add it if a source can be retired.
- finasteride: blood-donation deferral (in dutasteride's label) wasn't checked for finasteride.

## Round 2 additions (Oct 28, 2026)
- SS-31 (elamipretide): FDA accelerated approval as Forzinity for Barth syndrome (patients of at
  least 30 kg body weight), Sept 19, 2025, after a May 2025 rejection. Label:
  https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=146bf34c-76f2-48db-ac07-fb29cce2cd75
- AOD-9604: FDA's own evaluation (Dec 2024 PCAC briefing): main obesity trial OPTIONS, 502
  randomized, no significant difference in weight loss; obesity development ended after a
  Feb 21, 2007 announcement. https://fda.gov/media/183584/download (advisers voted 0-12).
- Thymosin alpha-1: FDA memo https://fda.gov/media/183820/download, slides
  https://fda.gov/media/183892/download, 2025 BMJ sepsis trial https://pubmed.ncbi.nlm.nih.gov/39814420/
- FDA 503B nominations list (March 21, 2025): https://www.fda.gov/media/94164/download
  (gonadorelin acetate Category 1 and a component of an approved drug; ibutamoren Category 2;
  thymosin alpha-1 Category 3).
- Ibutamoren (MK-677): Category 2 for pharmacies since Sept 29, 2023 and for outsourcing
  facilities since Dec 29, 2022 (heart failure).
- Non-injectable GHK-Cu: removed from Category 1 on April 22, 2026, re-added after a May 5, 2026
  clarification (May 14, 2026 list).
- WADA 2026 names ibutamoren, AOD-9604 and gonadorelin (males only); it does not name
  bremelanotide, thymosin alpha-1, LL-37, elamipretide, selank, Cerebrolysin or GHK.
- Vyleesi (bremelanotide) label, FDALabel copy (Jan 10, 2025):
  https://nctr-crs.fda.gov/fdalabel/services/spl/set-ids/8c9607a2-5b57-4a59-b159-cf196deebdd9/spl-doc
- Access: pubmed.gov redirect links are refused; PubMed/PMC bot checks come and go (a retry
  sometimes works); university repositories, Cochrane PDFs and MDPI open reliably.
- FDA 503A categories list (May 14, 2026): Category 1 includes NAD, NADH, glutathione,
  pregnenolone, melatonin and 7-keto-DHEA; a disodium salt of NAD is Category 3. Not listed:
  DHEA, oxytocin, humanin, pentadeca arginate, dihexa, afamelanotide, sirolimus, collagen.
- FDA interim policy (Jan 2025): no action against compounding with Category 1 substances that
  have no USP monograph and aren't a component of an approved drug. https://www.fda.gov/media/174456/download
- FDA, Aug 27, 2026: reactions in at least 30 patients to IV glutathione compounded from
  supplement-grade ingredient. https://www.fda.gov/drugs/human-drug-compounding/fda-reminds-compounders-not-use-dietary-supplement-grade-glutathione-injectables
- BPC-157 briefing: "multiple salts, and derivatives" are sold under the name; FDA plans
  notice-and-comment rulemaking (McDermott, July 27, 2026), possibly 2027 or later.
- WADA 2026: DHEA (prasterone) banned under S1.1; S0 names BPC-157. Not named: pregnenolone,
  oxytocin, glutathione, NAD+, melatonin, dihexa, humanin.
- Scenesse (afamelanotide): US approval for adults only; vitiligo phase 3 recruiting closed May
  2025. Melanotan I = afamelanotide per the Norwegian Food Safety Authority risk profile (2013).
- Labels: Rapamune (Oct 2024) https://labeling.pfizer.com/ShowLabeling.aspx?id=139 ;
  Pitocin (March 2026, Drugs.com mirror) https://www.drugs.com/pro/pitocin.html ;
  Intrarosa (2018) https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/208470s001lbl.pdf
- Searches restricted to nccih.nih.gov or ods.od.nih.gov work well; ODS's sports-supplement
  fact sheet covers DHEA and other performance supplements. Every new source costs a search
  (WebFetch refuses URLs not seen in a result).
- Supplements: searching with allowed_domains ods.od.nih.gov and several nutrient names returns
  3-4 fact sheets per search. Fetch URLs exactly as returned (iron's is
  https://ods.od.nih.gov/factsheets/Iron%20%20-HealthProfessional/). NIH pages over 100k
  characters get cut off at the end (interactions, update date).
- Hub pages: ODS exercise and athletic performance (beta-alanine, citrulline, arginine,
  caffeine) https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/ ;
  ODS vitamins and minerals list https://ods.od.nih.gov/factsheets/list-VitaminsMinerals/ ;
  ODS weight loss https://ods.od.nih.gov/factsheets/WeightLoss-HealthProfessional/ ;
  ODS immune function https://ods.od.nih.gov/factsheets/ImmuneFunction-HealthProfessional/ ;
  NCCIH diabetes and supplements (chromium) https://www.nccih.nih.gov/health/diabetes-and-dietary-supplements-what-you-need-to-know ;
  NCCIH headaches (riboflavin) https://www.nccih.nih.gov/health/headaches-what-you-need-to-know ;
  NCCIH herb-drug interactions https://www.nccih.nih.gov/health/providers/digest/herb-drug-interactions-science
- Opened fine: NCCIH, MDPI, Frontiers, PLOS, Dove Press, cochrane.org summaries, Cochrane
  abstract PDFs, aafp.org PDFs, accessdata.fda.gov labels, FDA's GRAS inventory, the UNT web
  archive of old FDA pages, university repositories, DOAJ. LiverTox opens sometimes.
  Blocked: ahajournals.org, tandfonline.com, nature.com, most of cmaj.ca, BMC/Springer (cookie
  wall), PMC (bot check, intermittent).
- Approved drugs: Zepbound label (April 2026; sleep apnea; suicidal-thoughts warning removed
  Feb 2026) https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/217806Orig1s050lbl.pdf ;
  Saxenda (Feb 2026) https://nctr-crs.fda.gov/fdalabel/services/spl/set-ids/3946d389-0926-4f77-a708-0acb8153b143/spl-doc ;
  Victoza (Oct 2025) https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/022341s046lbl.pdf ;
  first generic Victoza Dec 23, 2024 https://content.govdelivery.com/accounts/USFDA/bulletins/3c8fbca ;
  retatrutide phase 3 (TRIUMPH-2/3) and a Q1 2027 filing plan, Lilly release
  https://lilly.gcs-web.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-successful-two-additional
- Testosterone: FDA class-wide labeling changes (Feb 28, 2025: TRAVERSE results added, heart
  language out of the boxed warning, blood-pressure warning for all products)
  https://www.fda.gov/drugs/drug-alerts-and-statements/fda-issues-class-wide-labeling-changes-testosterone-products ;
  Endocrine Society 2018 guideline (full copy)
  https://www.albme.gov/uploads/forms/Testosterone_Therapy_in_Men_with_Hypogonadism_An_Endocrone_Society_Clinical_Practice_Guideline.pdf
- HGH: FDA Import Alert 66-71 (revised April 7, 2026): distributing HGH for unapproved uses is
  illegal (21 U.S.C. 333(e)), no anti-aging use is authorized, and as a biologic it can't be
  compounded. https://www.accessdata.fda.gov/cms_ia/importalert_204.html
- hCG: compounding trade-group post https://a4pc.org/news/2022-04/why-not-compound-peptides-and-hcg ;
  FDA 2011 "HCG diet products are illegal" (archived)
  https://webarchive.library.unt.edu/web/20121019100019/http://www.fda.gov/ForConsumers/ConsumerUpdates/ucm281333.htm
- Clomiphene/enclomiphene 2025 meta-analysis (10 trials) https://new.scielo.br/j/aem/a/jyRkLt4MbHqk3tpgvsMfMmP/?lang=en ;
  generic clomiphene label (Aug 2025) https://nctr-crs.fda.gov/fdalabel/services/spl/set-ids/72719958-7454-4c54-9bb4-f3054d0c5d82/spl-doc
- Drugs.com /pro/ pages give current label text with revision dates when FDA's own copy is old.
  FDALabel pages cut off around 100k characters (often before clinical studies).

## Round 3 additions (Oct 28, 2026)

### Access
- URLs already listed in NEXT_ROUND.md or in existing entry files fetch directly without a search.
- `www.pubmed.gov/<id>/` links from search results opened while pubmed.ncbi and PMC showed bot
  checks; `www.ncbi.nlm.nih.gov/pmc/` links redirect to a blocked address.
- ecfr.gov fails; law.cornell.edu works for the CFR. cochranelibrary.com failed; cochrane.org
  summaries opened.
- Drugs.com `/npp/` monographs cover herbs with no NIH page. One drugs.com-restricted search
  naming 4–5 brands returns several `/pro/` label pages.

### Supplements
- NMN: FDA's Sept 2025 reversal is cited in nad.json; follow-up letters Dec 2, 2025 (trade news):
  https://www.nutraingredients.com/Article/2025/12/09/fda-reinstates-ndi-status-of-nmn-with-new-letters-to-ingredient-players ;
  NMN meta-analysis (open PDF): https://ira.lib.polyu.edu.hk/bitstream/10397/110061/1/s11892-024-01557-z.pdf
- NAC: FDA guidance (Aug 2022) https://www.fda.gov/media/157784/download ; final guidance (Nov 2023)
  https://www.fda.gov/food/hfp-constituent-updates/fda-releases-final-guidance-enforcement-discretion-certain-nac-products ;
  Acetadote label (July 2025) https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/021539s021lbl.pdf .
  FDA's 2023 safety review: findings not found.
- NR GRAS letter (foods, not supplements): https://www.fda.gov/food/gras-notice-inventory/agency-response-letter-gras-notice-no-grn-000635
- NCCIH turmeric https://www.nccih.nih.gov/health/turmeric ; rhodiola https://www.nccih.nih.gov/health/rhodiola ;
  musculoskeletal pain digest https://www.nccih.nih.gov/health/providers/digest/nutritional-approaches-for-musculoskeletal-pain-and-inflammation-science
- Turmeric liver-injury case series (US DILIN): https://scholarworks.indianapolis.iu.edu/items/4caeb25f-beb5-43e6-9c89-30931674fa03
- Glycine food rule: https://www.law.cornell.edu/cfr/text/21/170.50
- NIH taurine release (2025): https://www.nih.gov/news-events/news-releases/nih-researchers-conclude-taurine-unlikely-be-good-aging-biomarker

### Hormone and men's-health drugs
- Enclomiphene: PCAC June 8, 2022 voted 4 yes, 8 no on compounding https://www.fda.gov/media/161293/download ;
  transcript with FDA's 2015 complete response https://www.fda.gov/media/161294/download ; still
  Category 1 on the May 14, 2026 list; EMA refused EnCyzix (2018) https://www.ema.europa.eu/en/medicines/human/EPAR/encyzix
- Menopur, Gonal-f, Follistim AQ, Bravelle, Novarel and Pregnyl became biologics on March 23, 2020:
  https://fda.gov/media/119229/download
- WADA 2026: S4.1 names anastrozole, letrozole, exemestane; S4.2 names clomifene, raloxifene,
  tamoxifen ("including, but not limited to"); hCG and LH banned in males; FSH, hMG, finasteride,
  dutasteride, cabergoline and PDE5 inhibitors not named.
- FDA alert on compounded topical finasteride (Apr 22, 2025):
  https://www.fda.gov/drugs/human-drug-compounding/fda-alerts-health-care-providers-compounders-and-consumers-potential-risks-associated-compounded
- EMA on suicidal thoughts with finasteride and dutasteride (May 8, 2025):
  https://www.ema.europa.eu/en/news/measures-minimise-risk-suicidal-thoughts-finasteride-dutasteride-medicines
- Guidelines: AUA ED (2018) https://www.auanet.org/documents/Guidelines/PDF/ED-JU.pdf ; AUA BPH (2021)
  https://www.auanet.org/documents/guidelines/pdf/bph%20surgical-mgmt.pdf ; EAA gynecomastia (2019)
  https://www.pubmed.gov/31099174/ ; Handbook of Andrology chapter
  https://andrologysociety.org/wp-content/uploads/2023/04/Chapter-34-Bieniek-and-Lo.pdf
- MAP.3 exemestane trial PDF opens at cinj.org.

### Off-label drugs and research compounds
- WADA 2026 (https://www.wada-ama.org/en/prohibited-list): "Thymosin-β4 and its derivatives e.g.
  TB-500" under S2.3; modafinil, adrafinil and phentermine S6.A (in competition only);
  spironolactone S5 (at all times); S4.4.1 names BAM15, AICAR, MOTS-c, GW1516, SR9009, SR9011.
  Not named: armodafinil, methylene blue, telmisartan, naltrexone, minoxidil, SLU-PP-332.
- RGN-259 (thymosin beta-4 eye drops): SEER-3 missed its primary endpoint (July 1, 2025)
  https://www.ophthalmologytimes.com/view/hlb-therapeutics-misses-primary-endpoint-in-phase-3-seer-3-trial-of-rgn-259?b=ot ;
  SEER-2 last visit Aug 26, 2026, results expected November 2026 (re-check), orphan designation
  https://en.edaily.co.kr/news/eda202608265430 ; FDA said in 2022 the dry-eye data weren't enough
  https://www.biospace.com/regenerx-reasses-pipeline-in-light-of-development-delays-with-lead-asset
- FDA TB-500 briefing, footnote 35 (p. 21): "thymosin beta-4 and TB-500 are not the same
  substance"; thymosin beta-4 is 43 amino acids. https://www.fda.gov/media/193349/download
- FDA 503A list (May 14, 2026): none of tb4's group listed; a garbled "Thylene blue" in Category 3
  may be methylene blue (unverified).
- Labels: ProvayBlue (Feb 2024) https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/204630Orig1s023correctedlbl.pdf ;
  Provigil (Feb 2025) https://www.drugs.com/pro/provigil.html ; Nuvigil (Feb 2025)
  https://www.drugs.com/pro/nuvigil.html ; Adipex-P (Mar 2024) https://drugs.com/pro/adipex-p.html ;
  Aldactone (Nov 2025, no boxed warning) https://labeling.pfizer.com/showlabeling.aspx?id=520 ;
  Micardis (Dec 2022) https://www.drugs.com/pro/micardis.html ; Loniten (Jan 2015)
  https://www.rxlist.com/loniten-drug.htm ; Rogaine https://www.drugs.com/pro/rogaine-mens.html ,
  https://www.drugs.com/pro/rogaine-women-s.html ; tretinoin microsphere gel (Sept 2025)
  https://www.drugs.com/pro/tretinoin.html
- SLU-PP-332: Cologne anti-doping glossary (2026)
  https://www.dshs-koeln.de/en/universitaet/organisation/institute-einrichtungen/department-of-biochemistry/doping-substances/doping-glossary/s/slu-pp-332-and-slu-pp-915-estrogen-receptor-related-err-agonists ;
  mouse papers https://collections.uhsp.edu/pharm-admin-sciences_pubs/48 ,
  https://collections.uhsp.edu/pharm-admin-sciences_pubs/44/
- Access: PMC opens only when the exact pmc.ncbi.nlm.nih.gov link appears in a search result.
  MDPI pages not seen in results are refused. Boehringer's label site is bot-blocked. Opened
  fine: bvsalud.org, QxMD, collections.uhsp.edu, scholars.uthscsa.edu, eprints.soton.ac.uk,
  core.ac.uk, Cochrane abstract PDFs, DrugCentral, MedLibrary.

### Metabolic drugs
- Orforglipron (Foundayo) approved April 1, 2026 for weight management only; first new molecular
  entity under FDA's priority-voucher pilot.
  https://www.fda.gov/news-events/press-announcements/fda-approves-first-new-molecular-entity-under-national-priority-voucher-program ;
  label (July 2026) https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/220934s003lbl.pdf ;
  Lilly diabetes trials (June 2026) https://investor.lilly.com/node/54406/pdf
- CagriSema filed with FDA Dec 18, 2025 (Novo release); no decision through Oct 20, 2026
  (https://www.drugs.com/history/cagrisema.html). REDEFINE 1 copy: https://art.torvergata.it/handle/2108/426724
- Mazdutide approved in China: weight (June 2025)
  https://filingreader.com/news-wire/hongkong/2025-06-27/innovents-mazdutide-approved-in-china-for-weight-management ;
  type 2 diabetes (Sept 2025)
  https://www.biospace.com/press-releases/innovent-announces-mazdutide-received-approval-from-chinas-nmpa-for-glycemic-control-in-adults-with-type-2-diabetes
- Survodutide phase 3 (company releases): June 2026
  https://www.boehringer-ingelheim.com/us/human-health/metabolic-diseases/positive-data-two-phase-iii-synchronize-obesity-trials ;
  Oct 2026 https://www.boehringer-ingelheim.com/us/human-health/metabolic-diseases/new-phase-iii-data-people-obesity-and-diabetes ;
  Fast Track (2021) and Breakthrough (2024) for MASH.
- Pemvidutide: alcohol-use-disorder trial (July 2026, SEC 8-K)
  https://www.sec.gov/Archives/edgar/data/0001326190/000132619026000044/alt-20260728xex99d1.htm ;
  Breakthrough for MASH (Dec 2025, SEC prospectus)
  https://www.sec.gov/Archives/edgar/data/0001326190/000110465926047979/alt-20260423x424b5.htm
- Exenatide: Byetta and Bydureon BCise discontinued Oct 2024 (insurer notice)
  https://www.uhcprovider.com/en/resource-library/news/2024/discontinuation-bydureon-bcise-byetta.html ;
  generic Byetta approved Nov 2024 (Amneal); phase 3 Parkinson's trial negative
  https://www.dpag.ox.ac.uk/publications/2084557/modal
- Pramlintide discontinued in the US per AHFS: https://www.drugs.com/monograph/symlin.html
- Labels: Jardiance (Oct 2025) https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/204629s063lbl.pdf ;
  Farxiga (June 2026; genital/urinary infection warning expanded June 3, 2026)
  https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/202293s035lbl.pdf ; Invokana (Dec 2024,
  no boxed warning) https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/204042s043lbl.pdf ;
  Trulicity (Nov 2024) https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/125469s061s062lbl.pdf
- DAPA-CKD (Glasgow copy) https://eprints.gla.ac.uk/223971 ; canagliflozin mouse lifespan
  https://scholars.uthscsa.edu/en/publications/canagliflozin-extends-life-span-in-genetically-heterogeneous-male/
- Access: long FDA label PDFs cut off around section 14 (trial results); older, shorter labels
  from the same search usually still have the numbers. FDA's safety-labeling-changes pages
  (accessdata.fda.gov/scripts/cder/safetylabelingchanges/) give dated changes. SEC filings and
  asoi.info opened reliably.

### Checked during the round 3 reviews
- Soltamox boxed warning: applies to risk reduction (high-risk women, DCIS); "For most patients already
  diagnosed with breast cancer, the benefits of tamoxifen outweigh its risks."
- Viagra and Cialis labels: stop and get medical care for sudden vision or hearing loss; people who had
  NAION before are at higher risk of recurrence. Viagra's patient information names "poppers".
- Adipex-P: primary pulmonary hypertension "frequently fatal"; combining with SSRIs not recommended;
  contraindications include heart disease, MAOIs within 14 days, hyperthyroidism, glaucoma, agitated
  states, drug-abuse history, pregnancy and nursing; approved only for short-term use (a few weeks).
- Provigil: not recommended with left ventricular hypertrophy or symptomatic mitral valve prolapse on
  stimulants; closer heart rate and blood pressure monitoring may be appropriate; IUGR and miscarriage
  reported in pregnancy.
- WADA S6: "All stimulants, including all optical isomers ... are prohibited", which covers armodafinil.
- Aldactone (Nov 2025): no boxed warning; salt substitutes with potassium named; no drospirenone.
- Labels with gallbladder and aspiration warnings: Trulicity (5.8, 5.9), Byetta (5.9, 5.10).
- SGLT2 labels: Invokana, Farxiga and Jardiance list only hypersensitivity as a contraindication (no
  dialysis contraindication); all three report post-marketing acute kidney injury.
- Cagrilintide phase 2 trial: 706 participants (asoi.info abstract).
- Survodutide releases: 16.6% and 13.1% are efficacy-estimand figures (as if everyone stayed on
  treatment); no heart-rate data given.
- Orforglipron label: both 72-week trials had 26.8% of placebo patients losing at least 5%.
- LDN: "Because there is no commercial formulation of LDN, research studies obtain the medication via
  compounding pharmacies" (Younger 2014, core.ac.uk).
- NAC with nitroglycerin: symptomatic hypotension in 7 vs 0 patients (Horowitz, Circulation 1988):
  https://ahro.austin.org.au/austinjspui/handle/1/12932
- Turmeric professional monograph (Nov 2025): bleeding-risk interactions, CYP2D6/CYP3A, avoid with
  gallstones, avoid in pregnancy and lactation: https://www.drugs.com/npp/turmeric.html
- FDA tainted-supplements guide (2010): hidden drugs are typically in products promoted for sexual
  enhancement, weight loss, bodybuilding and diabetes:
  https://www.fda.gov/files/drugs/published/Tainted-Dietary-Supplements-and-Foods--Responsibilities-of-Retailers-and-Distributors.pdf
- MedlinePlus no longer returns herb and supplement monographs in search; don't spend searches on it.
