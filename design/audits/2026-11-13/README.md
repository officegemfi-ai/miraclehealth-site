# Design audit, November 13, 2026

The whole system: the website's 23 page types, Ask Sig and the community app's 16 screens, each at 1440, 1024, 768 and 390. Five specialists audited one area each. The art director checked the top findings against the captures and merged duplicates.

| Report | Area | High | Medium | Low |
| --- | --- | --- | --- | --- |
| [brand-colour.md](brand-colour.md) | Brand and colour | 3 | 8 | 10 |
| [typography.md](typography.md) | Type | 7 | 11 | 1 |
| [layout-symmetry.md](layout-symmetry.md) | Layout, grid and symmetry | 3 | 8 | 10 |
| [components.md](components.md) | Components and states | 5 | 12 | 5 |
| [responsive.md](responsive.md) | Phone and tablet | 12 | 10 | 7 |

That is 112 findings, 100 once these duplicates are merged:

- BC-02 = COMP-04: two blue actions in the community.
- BC-07 = COMP-03: the community's focus rings.
- COMP-11 is part of TYPE-04: the community's mono capitals.
- LAYOUT-01 = PT-01: How it works from 901 to 1279px.
- LAYOUT-02 = PT-25: the side panel's width.
- LAYOUT-03 = PT-04: the community's Signal board.
- LAYOUT-04 and PT-10: the page margin and the top bar's edges.
- LAYOUT-17 = PT-07: the community's phone margins.
- BC-21, COMP-22, LAYOUT-21, TYPE-19 and PT-29: the brand book trails the build.

## The ten to fix first

1. How it works breaks between tablet and laptop widths (PT-01).
2. The real example slips one column from 861 to 1100px (PT-02).
3. Both Signal boards are cut (PT-03, PT-04).
4. Two main actions in one view (BC-01, BC-02).
5. The community still wears the old window (COMP-01, COMP-03, TYPE-04).
6. The community is narrower at 1024 than at 768 (PT-05).
7. Ask Sig's agents list cuts every line from 1101 to 1700px (PT-17).
8. Lines too long to read (TYPE-03, TYPE-07, TYPE-13).
9. Headings in five voices (TYPE-01, TYPE-02).
10. Small text and small targets on phones (PT-06, PT-08, PT-09, PT-11, PT-12).

## The suggested update

1. **Fix what's broken:** items 1 to 4 and 7, plus a check that fails the build on sideways scroll or cut text.
2. **One kit for both apps:** one tokens file, one set of components, one type scale, floors for phones, and checks for states and type.
3. **The community takes the website's frame.** Its side panel stays, docked from 1280px and a drawer below, with the Signal added to its places.
4. **Page heads and a shorter front page.**
5. **The brand book catches up.**

## Waiting on the owner

1. Corners: square everywhere, or rounded by role.
2. The community's frame.
3. The front page's length.
4. The Evidence librarian's colour: blue or mint.
5. Interior page heads: a card on the right.
6. Headline tracking: −0.022em or −0.028em.

Nothing in this folder changes the site. The evidence images and the scripts behind every number stayed in `.design/` on the machine that ran the audit; they are not committed.
