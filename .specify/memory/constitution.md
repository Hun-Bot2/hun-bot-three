<!--
Sync Impact Report
- Version change: (none) → 1.0.0
- Modified principles: N/A (initial adoption)
- Added sections: Core Principles; Performance Standards & Asset Budgets; Development Workflow & Quality Gates; Governance
- Removed sections: None
- Templates requiring updates:
	- .specify/templates/plan-template.md: ✅ updated (Constitution Check gates aligned)
	- .specify/templates/spec-template.md: ✅ aligned (no conflicting guidance)
	- .specify/templates/tasks-template.md: ✅ updated (added constitution-aligned polish tasks)
	- .specify/templates/commands/*.md: N/A (no commands directory in templates)
- Follow-up TODOs: None
-->

# Hun Dreamscape Portfolio Constitution

## Core Principles

### I. UX Consistency & Emotional Tone (NON-NEGOTIABLE)
All interactions, visuals, copy, and sound MUST sustain a dreamy, mysterious, and calm
immersion. Motion language is elegant, subtle, and organic: no jarring jumps, harsh cuts,
or abrupt changes. Transitions MUST use eased timing and continuity-preserving techniques
(cross-fades, gentle camera arcs, progressive reveal/occlusion) to maintain presence.
Rationale: The portfolio’s primary value is a cohesive emotional experience that reflects
identity and creativity; inconsistency breaks immersion and undermines intent.

### II. Smooth Performance & Motion Quality
The experience MUST feel fluid on modern browsers and GPUs.
- Target 60 FPS; frame time budget ≤ 16.7 ms. Brief dips below 50 FPS MUST recover within
	250 ms; sustained dips below 45 FPS are release blockers.
- Camera and major transitions SHOULD complete in 300–700 ms using perceptually smooth
	easing (e.g., easeInOutCubic) and MUST never stutter.
- Implement performance techniques: requestAnimationFrame scheduling, throttled/debounced
	inputs, object pooling, geometry instancing, texture atlases, LODs, lazy loading, and
	prefetch/preload for critical assets.
Rationale: Fluid motion is essential to preserve immersion and reduce cybersickness.

### III. Stability, Readability, and Safe Interactions
Published builds MUST contain no critical bugs. Interactions MUST behave as intended
under expected and edge conditions (resize, tab visibility changes, GPU context loss,
pointer leave, low battery modes).
- Code MUST be clean, readable, and thoughtfully commented where non-obvious.
- Lint/typecheck MUST pass with zero errors; console MUST be free of uncaught errors.
- Critical paths MUST include defensive checks and graceful fallbacks.
Rationale: Stability builds trust and enables sustainable iteration.

### IV. Composable Scene Architecture
Three.js elements MUST be modular and lifecycle-aware with explicit hooks for init,
mount, update, and dispose. A single source of truth MUST control timing and camera.
Resources (geometries, materials, textures, render targets) MUST be disposed on unmount
or scene transitions to prevent leaks. Globals and implicit side effects are prohibited.
Rationale: Clear structure prevents regressions and supports performance.

### V. Accessibility & Input Gracefulness
Input MUST be robust across pointer and keyboard; reduced motion preferences MUST be
respected with alternate timing/animation intensity. Interactive targets MUST remain
usable without precise pointing; focus and hover states MUST be perceivable within the
visual language. If WebGL is unavailable, a graceful fallback or message MUST appear.
Rationale: Accessibility broadens reach while preserving tone.

## Performance Standards & Asset Budgets

- Draw calls: Landing scene ≤ 150; typical scenes ≤ 300. Exceeding budgets MUST be
	justified with measurable benefit and profiling evidence.
- Textures: Total resident texture memory SHOULD be ≤ 64 MB at 1× DPR; use compression
	(Basis/ASTC/ETC) when feasible. Max individual texture dimension 2048 unless visual
	quality demands otherwise with profiling.
- Materials: Prefer MeshStandardMaterial or custom shaders with care; avoid excessive
	unique materials. Reuse where possible.
- Geometry: Merge or instance repeated meshes. Keep vertex count appropriate for target
	silhouette and distance; introduce LODs for distant assets.
- Post-processing: Limit passes; each pass MUST be justified by perceptual impact.
- Asset loading: Lazy-load non-critical assets; prewarm critical ones before transition.
- Power/thermal: Avoid busy loops; prefer interval updates for non-visual work.

## Development Workflow & Quality Gates

1) Pre-commit gates
- Lint/format/typecheck MUST pass.
- No new console errors/warnings in dev run of the focused scene.

2) Pre-push gates
- Build MUST succeed.
- Smoke boot test: Scene initializes, renders first frame, and disposes without leaks.
- Performance smoke: On a reference machine, landing scene ≥ 55 FPS median over 10 s;
	no stutters > 250 ms.
- UX consistency pass: New interactions/transitions reviewed against Principle I.

3) PR review checklist
- Architecture conforms to lifecycle and disposal rules (Principle IV).
- Performance changes come with before/after metrics or profiler screenshot.
- Accessibility/regressions considered; reduced motion pathway verified.

4) Release checklist
- All gates green; manual exploratory run through primary flows; Lighthouse/WebGL report
	captured for record.

## Governance

- Authority: This constitution supersedes ad-hoc practices for UX, performance, and
	quality. Conflicts MUST be resolved in favor of these principles.
- Amendments: Proposals require a change log entry explaining rationale and impact,
	with an example of compliance. Upon merge, update version and Last Amended date.
- Versioning policy: Semantic versioning
	- MAJOR: Remove/redefine principles or governance in backward-incompatible ways.
	- MINOR: Add principles/sections or materially expand guidance.
	- PATCH: Clarifications and non-semantic refinements.
- Compliance reviews: At least once per milestone, perform a constitutional audit
	covering principles, budgets, and gates; file actions for violations.

**Version**: 1.0.0 | **Ratified**: 2025-11-04 | **Last Amended**: 2025-11-04
