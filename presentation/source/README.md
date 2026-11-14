# Asset authoring source

The editable PowerPoint file is the primary source for slide edits. Mermaid and Graphviz files in `../er-diagrams/` are portable diagram sources. SVG files are editable vector assets. None of these authoring tools is needed to run the web app.

`build-graphics.mjs` requires Node.js, `@viz-js/viz` and `sharp`. `build-deck.mjs` uses the Codex bundled `@oai/artifact-tool`, `sharp`, Python validation helpers and the presentation skill's finalizer. Both scripts locate the project relative to their own path.

In the original Codex environment:

```bash
node presentation/source/build-graphics.mjs
node presentation/source/build-deck.mjs
```

For another Codex installation, set `RUNTIME_NODE_MODULES` to its bundled Node packages, `PRESENTATION_SKILL_DIR` to the presentation skill, and `ARTIFACT_PYTHON` to its Python runtime. Optional `CHEMISTRY_PROJECT` overrides the project root. Temporary authoring/validation files go into the ignored `.local/presentation-build/` directory.

The portrait loader accepts local WebP and converts it to PNG bytes for PowerPoint embedding. The deck remains editable directly in PowerPoint without the authoring runtime. A user outside Codex should edit the PPTX/Mermaid/SVG sources directly, rather than install a private artifact library.

`render-video.py` uses standard Python and FFmpeg to assemble the screenshot storyboard draft. See `../video/README.md`. The draft is not a live recording.
