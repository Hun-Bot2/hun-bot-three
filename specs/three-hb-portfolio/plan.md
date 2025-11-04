# Implementation Plan: Dreamy Three.js Portfolio

**Branch**: `three-hb-portfolio` | **Date**: 2025-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/three-hb-portfolio/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an immersive desktop Three.js portfolio featuring a dreamy, mysterious 3D landing scene with smooth camera-based navigation between content sections (landing, about, projects, contact) and interactive 3D elements. Prioritizes visual depth, fluid 60 FPS animations, and atmospheric cohesion over minimalism. Technical approach combines modular Three.js scene architecture with lifecycle-aware components, performance budgets (≤150 draw calls landing, ≤300 typical), and optional Azure backend for dynamic content if needed.

## Technical Context

**Language/Version**: TypeScript 5.3+ (for type safety and tooling), JavaScript ES2022+ (Three.js ecosystem standard)  
**Primary Dependencies**: Three.js r160+, Vite 5.x (dev server + build), GSAP 3.x (easing/timeline animations), glTF-Transform (asset optimization), TypeScript 5.3+  
**Storage**: Optional Azure Blob Storage or Static JSON files for portfolio content (projects, blog posts); to be determined in research phase  
**Testing**: Vitest (unit tests for utilities), Playwright (E2E for scene initialization/navigation), manual profiling with Chrome DevTools Performance  
**Target Platform**: Desktop browsers (Chrome 110+, Firefox 115+, Safari 16.4+, Edge 110+); WebGL 2.0 required; no mobile optimization for MVP  
**Project Type**: Web (frontend-only static site with optional backend for CMS)  
**Performance Goals**: 60 FPS sustained, ≤16.7ms frame time, ≤3s load to first interactive frame on broadband (10 Mbps+), camera transitions 500-800ms  
**Constraints**: Landing scene ≤150 draw calls, typical scenes ≤300 draw calls, texture memory ≤64 MB, no stutters >250ms, desktop-only (min 1280px width)  
**Scale/Scope**: 3-5 content sections, 5-10 project items, ~10-15 3D models/objects, ~20-30 textures, single-user experience (no auth/multi-user)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- UX Consistency (Principle I): Proposed interactions and transitions explicitly
  describe how they sustain dreamy, mysterious, calm immersion. No abrupt jumps.
- Performance (Principle II): Document expected FPS and transition timings; list
  performance techniques (instancing, LOD, lazy loading) relevant to the feature.
- Stability (Principle III): Identify edge conditions (resize, tab hidden, context
  loss) and the plan for defensive handling.
- Architecture (Principle IV): Define lifecycle hooks (init/mount/update/dispose)
  for new scene components; resource disposal accounted for.
- Accessibility (Principle V): Input methods, reduced motion pathway, and fallback
  behavior considered and testable.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── SceneManager.ts          # Central coordinator for scene lifecycle
│   ├── CameraController.ts      # Camera position/transition management
│   ├── InputHandler.ts          # Unified pointer/keyboard/scroll input
│   └── AssetLoader.ts           # Resource loading/caching/disposal
├── scenes/
│   ├── LandingScene.ts          # P1: Initial immersive landing
│   ├── AboutScene.ts            # P2: About section scene
│   ├── ProjectsScene.ts         # P2: Projects gallery scene
│   └── ContactScene.ts          # P2: Contact section scene
├── objects/
│   ├── InteractiveObject.ts     # P3: Base class for hover/click objects
│   ├── AmbientParticles.ts      # Atmospheric particle systems
│   └── [custom-models]/         # Scene-specific 3D object modules
├── animations/
│   ├── CameraTransition.ts      # Smooth eased camera movements
│   ├── ObjectAnimator.ts        # Object-level animation utilities
│   └── TimelineManager.ts       # GSAP timeline coordination
├── utils/
│   ├── PerformanceMonitor.ts    # FPS tracking, draw call counting
│   ├── ResourceDisposer.ts      # Geometry/material/texture cleanup
│   └──ReducedMotion.ts         # Accessibility: motion preferences
├── content/
│   └── portfolio-data.json      # Static content (or fetched from Azure)
├── styles/
│   └── global.css               # Minimal UI overlay styles
└── main.ts                      # Entry point, app bootstrap

public/
├── models/                      # glTF/GLB 3D assets
├── textures/                    # Compressed texture files
└── fonts/                       # Web fonts for UI overlays

tests/
├── unit/
│   ├── utils.test.ts
│   └── animations.test.ts
└── e2e/
    ├── landing.spec.ts          # Scene init, FPS, no leaks
    ├── navigation.spec.ts       # Camera transitions
    └── interaction.spec.ts      # Interactive objects
```

**Structure Decision**: Web application (frontend-only) with optional backend consideration. Selected "single project" pattern with frontend-focused structure since the core deliverable is a client-side 3D experience. If Azure backend is adopted for dynamic content (blog/projects CMS), it will be a separate lightweight API service and not tightly coupled to the frontend build. The frontend remains fully static-capable with JSON fallback.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution principles are satisfied by the proposed architecture:
- UX Consistency: Modular scene architecture supports consistent transitions and animations
- Performance: Explicit budgets (draw calls, texture memory) and monitoring planned
- Stability: Lifecycle hooks (init/mount/update/dispose) enforce resource cleanup
- Architecture: SceneManager + lifecycle pattern aligns with Principle IV
- Accessibility: InputHandler + ReducedMotion utility cover Principle V requirements
