# Economics Internal Assessment — Commentary (Microeconomics)

Reformatted version of the WHO tobacco IA. The **content is the author's own and unchanged**;
only presentation was reworked, using the NYC rent-freeze IA purely as a layout model.

## Files

| File | Purpose |
|---|---|
| `Economics_IA_Commentary_WHO_Tobacco.docx` | The document (Word, A4, 5 pages) |
| `Economics_IA_Commentary_WHO_Tobacco.pdf` | PDF export of the same |
| `build/build.js` | Rebuilds the .docx; body text is read from `who_runs.json`, never re-typed |
| `build/diagrams.js` | Generates the two figures as SVG |
| `build/render.js` | Rasterises the SVGs to 2480px-wide PNGs via headless Chromium |
| `build/who_runs.json` | Text runs extracted verbatim from the original .docx |

## What changed

Formatting only:

- Cover sheet with the information laid out in a bordered table.
- Sections: Article / Commentary (Introduction, Diagram Analysis, Evaluation, Conclusion) / Works Cited.
- One typeface throughout (Times New Roman 12pt), justified body, consistent heading levels.
- Both diagrams redrawn at the same geometry but ~2.7x the area, with readable labels,
  bold captions above them, and each placed next to the paragraph that analyses it.
- Paragraphs that the original had split mid-sentence to flow around a floating shape
  were rejoined into single paragraphs.

Two diagram labels were corrected because they contradicted the author's own text:

- Figure 2: `Pp` and `Pm` were attached to each other's lines. The geometry was always
  correct (Pc > Pm > Pp); only the labels were swapped.
- Figure 2: the downward-sloping demand curve was labelled `MPC`; it is `MPB`.

Three cover-sheet fields are not present anywhere in the source document and are left
marked for completion rather than invented: article URL, date the commentary was written,
and key concept.

## Rebuilding

```sh
cd build
npm install docx
node diagrams.js && node render.js && node build.js
```
