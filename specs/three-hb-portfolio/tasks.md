---
description: "Task list for Dreamy Three.js Portfolio implementation"
---

# Tasks: Dreamy Three.js Portfolio

**Input**: Design documents from `/specs/three-hb-portfolio/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL in this project. Performance validation will be done manually with Chrome DevTools and FPS monitoring.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/`, `public/` at repository root
- Paths shown below use absolute structure based on plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic tooling configuration

- [x] T001 Initialize Node.js project with package.json and configure npm scripts
- [ ] T002 Install core dependencies: three@^0.160.0, vite@^5.0.0, typescript@^5.3.0 ⚠️ **REQUIRES NODE.JS**
- [ ] T003 [P] Install animation and tooling dependencies: gsap@^3.12.0, @types/three@^0.160.0 ⚠️ **REQUIRES NODE.JS**
- [ ] T004 [P] Install development dependencies: vitest@^1.0.0, @playwright/test@^1.40.0, eslint@^8.50.0, prettier@^3.0.0 ⚠️ **REQUIRES NODE.JS**
- [x] T005 Create tsconfig.json with strict mode, ES2022 target, and bundler moduleResolution
- [x] T006 [P] Create vite.config.ts with GLSL plugin configuration and asset handling for .glb/.gltf files
- [x] T007 [P] Create .eslintrc.json and .prettierrc.json with TypeScript and Three.js best practices
- [x] T008 Create project structure directories: src/{core,scenes,objects,animations,utils,content,styles}, public/{models,textures,fonts}, tests/{unit,e2e}
- [x] T009 Create index.html entry point with canvas element and basic meta tags
- [x] T010 [P] Create src/styles/global.css with CSS reset and minimal UI overlay styles
- [ ] T011 [P] Set up Husky pre-commit hooks for lint and typecheck ⚠️ **REQUIRES NODE.JS**
- [x] T012 Create src/content/portfolio-data.json with initial structure for sections (landing, about, projects, contact)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Create src/utils/ReducedMotion.ts utility to detect and respect prefers-reduced-motion preferences
- [x] T014 Create src/utils/ResourceDisposer.ts utility with dispose methods for geometries, materials, textures
- [x] T015 Create src/utils/PerformanceMonitor.ts class to track FPS, draw calls, and memory usage with constitution budget checks
- [x] T016 Create src/core/AssetLoader.ts with GLTFLoader and texture loading, caching, and disposal
- [x] T017 Create src/core/InputHandler.ts to capture and normalize pointer, keyboard, scroll, and touch events
- [x] T018 Create src/core/CameraController.ts with camera position management and GSAP transition methods
- [ ] T019 Create src/core/SceneManager.ts singleton to orchestrate scene lifecycle (init, mount, update, dispose) ⏸️ **PAUSED: Install dependencies first**
- [x] T020 Create Scene interface in src/types/Scene.ts with init(), mount(), update(delta), dispose() methods
- [ ] T021 Implement WebGL 2.0 feature detection and fallback message UI in src/main.ts ⏸️ **PAUSED: Install dependencies first**
- [ ] T022 Implement GPU context loss and recovery handlers in src/core/SceneManager.ts ⏸️ **PAUSED: Install dependencies first**
- [ ] T023 Set up window resize handler in src/core/SceneManager.ts with camera aspect ratio adjustment ⏸️ **PAUSED: Install dependencies first**
- [ ] T024 Implement tab visibility change detection to pause/resume animations in src/core/SceneManager.ts ⏸️ **PAUSED: Install dependencies first**
- [ ] T025 Create main render loop in src/main.ts with requestAnimationFrame and SceneManager.update() integration ⏸️ **PAUSED: Install dependencies first**

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - First Visit & Landing Experience (Priority: P1) 🎯 MVP

**Goal**: Deliver an immersive 3D landing scene with ambient lighting, focal 3D object, smooth 60 FPS animations, and responsive pointer feedback

**Independent Test**: Load homepage in browser, verify scene initializes <3s, ambient objects rendered, 60 FPS sustained, pointer movement triggers parallax, reduced-motion respected

### Implementation for User Story 1

- [ ] T026 [P] [US1] Create src/scenes/LandingScene.ts implementing Scene interface with init/mount/update/dispose methods
- [ ] T027 [P] [US1] Create src/objects/AmbientParticles.ts particle system class with Points geometry and custom shader
- [ ] T028 [US1] Implement LandingScene.init() to load glTF model from public/models/landing-focal.glb using AssetLoader
- [ ] T029 [US1] Set up ambient and directional lighting in LandingScene with appropriate intensity for dreamy atmosphere
- [ ] T030 [US1] Add focal 3D object (loaded model) to LandingScene with initial position and scale
- [ ] T031 [US1] Instantiate AmbientParticles and add to LandingScene with subtle floating animation
- [ ] T032 [US1] Implement LandingScene.update(delta) with particle animation loop and FPS-synced motion
- [ ] T033 [US1] Integrate PerformanceMonitor in LandingScene to log FPS and draw call counts to console in dev mode
- [ ] T034 [US1] Add pointer parallax effect in LandingScene using InputHandler pointer position to offset camera lookAt
- [ ] T035 [US1] Implement ReducedMotion check in LandingScene to disable/reduce particle animations when preference detected
- [ ] T036 [US1] Implement LandingScene.dispose() to call ResourceDisposer on all geometries, materials, and textures
- [ ] T037 [US1] Mount LandingScene in src/main.ts SceneManager on app initialization
- [ ] T038 [US1] Add loading progress indicator UI overlay in src/styles/global.css and wire to AssetLoader LoadingManager
- [ ] T039 [US1] Optimize landing glTF model with glTF-Transform CLI: draco compression, texture resizing, place in public/models/
- [ ] T040 [US1] Compress landing textures to WebP or Basis format, ensure total size <10 MB, place in public/textures/
- [ ] T041 [US1] Validate landing scene meets constitution budgets: ≤150 draw calls, 60 FPS median, <3s load time

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently as MVP

---

## Phase 4: User Story 2 - Navigation & Content Discovery (Priority: P2)

**Goal**: Enable smooth camera transitions between portfolio sections (about, projects, contact) with 500-800ms easing and clear navigation affordances

**Independent Test**: Click navigation menu items, verify camera transitions smoothly in 500-800ms, content appears in each section, keyboard Tab navigation works, scene state preserved on revisit

### Implementation for User Story 2

- [ ] T042 [P] [US2] Create src/scenes/AboutScene.ts implementing Scene interface
- [ ] T043 [P] [US2] Create src/scenes/ProjectsScene.ts implementing Scene interface
- [ ] T044 [P] [US2] Create src/scenes/ContactScene.ts implementing Scene interface
- [ ] T045 [P] [US2] Create src/animations/CameraTransition.ts with GSAP timeline methods for smooth camera movement
- [ ] T046 [US2] Define camera positions and lookAt targets for each section in src/content/portfolio-data.json
- [ ] T047 [US2] Implement CameraTransition.moveTo(position, target, duration) with easeInOutCubic easing and ReducedMotion respect
- [ ] T048 [US2] Create navigation menu component in src/styles/global.css with buttons for Landing, About, Projects, Contact
- [ ] T049 [US2] Wire navigation menu click events in src/main.ts to call SceneManager.transitionTo(sceneId)
- [ ] T050 [US2] Implement SceneManager.transitionTo(sceneId) to dispose current scene, init/mount next scene, and trigger camera transition
- [ ] T051 [US2] Implement AboutScene with text content overlay (HTML/CSS) reading from portfolio-data.json
- [ ] T052 [US2] Implement ProjectsScene with grid layout of project thumbnail cards reading from portfolio-data.json
- [ ] T053 [US2] Implement ContactScene with contact information overlay and optional contact form
- [ ] T054 [US2] Add keyboard accessibility: Tab through navigation buttons, Enter to activate, visible focus indicators
- [ ] T055 [US2] Implement scene state preservation: store visited section IDs in localStorage, restore camera position if revisiting
- [ ] T056 [US2] Add scroll gesture detection in InputHandler to trigger navigation to next/previous section
- [ ] T057 [US2] Add visual scroll hint indicators in landing scene (e.g., animated arrow or text "Scroll to explore")
- [ ] T058 [US2] Optimize section glTF models with glTF-Transform, ensure each scene ≤300 draw calls
- [ ] T059 [US2] Test all section transitions meet 500-800ms timing and feel smooth without stutter

**Checkpoint**: All sections should now be navigable independently with smooth transitions

---

## Phase 5: User Story 3 - Interactive 3D Elements (Priority: P3)

**Goal**: Add hover, click, and drag interactions to 3D objects with <100ms response time and visual feedback aligned with dreamy aesthetic

**Independent Test**: Hover over 3D objects, verify visual feedback (glow/scale) appears <100ms, click reveals content, drag rotates object smoothly, rapid interactions remain performant

### Implementation for User Story 3

- [ ] T060 [P] [US3] Create src/objects/InteractiveObject.ts base class extending Object3D with hover/click/drag event handlers
- [ ] T061 [P] [US3] Create src/animations/ObjectAnimator.ts utility for object-level animations (glow, scale, rotation)
- [ ] T062 [US3] Implement InteractiveObject.onPointerEnter() to apply emissive glow or scale animation via ObjectAnimator
- [ ] T063 [US3] Implement InteractiveObject.onPointerLeave() to remove hover effects and restore original state
- [ ] T064 [US3] Implement InteractiveObject.onClick() to trigger content reveal animation (e.g., modal popup or scene transition)
- [ ] T065 [US3] Implement InteractiveObject drag rotation using InputHandler pointer delta and quaternion rotation
- [ ] T066 [US3] Add raycasting in InputHandler to detect pointer intersections with InteractiveObject instances
- [ ] T067 [US3] Update InteractionState in SceneManager to track hoveredObjectId, focusedObjectId, activeObjectId
- [ ] T068 [US3] Integrate InteractiveObject instances into ProjectsScene for project thumbnail 3D models
- [ ] T069 [US3] Load project 3D models from portfolio-data.json modelUrl field using AssetLoader lazy loading
- [ ] T070 [US3] Add touch gesture support for drag rotation on touch devices in InputHandler
- [ ] T071 [US3] Implement interaction rate limiting to prevent animation queue overflow during rapid interactions
- [ ] T072 [US3] Add keyboard interaction support: Space/Enter on focused InteractiveObject triggers onClick
- [ ] T073 [US3] Test hover feedback appears <100ms, click animations complete smoothly, drag rotation feels natural
- [ ] T074 [US3] Optimize interactive object models to minimize additional draw calls (target: maintain ≤300 total in ProjectsScene)

**Checkpoint**: All user stories should now be independently functional with interactive elements enhancing experience

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [ ] T075 [P] Add FPS overlay toggle (Shift+F) in src/utils/PerformanceMonitor.ts using Stats.js for development
- [ ] T076 [P] Create comprehensive quickstart documentation in README.md with setup, dev workflow, and deployment instructions
- [ ] T077 Implement dev-only performance profiling script in package.json to run Chrome headless with performance trace
- [ ] T078 Add environment variable support for API_URL (future Azure backend) with fallback to static JSON
- [ ] T079 Implement custom error boundary in src/main.ts to catch and display graceful error messages for asset load failures
- [ ] T080 Add retry logic with exponential backoff in AssetLoader for failed model/texture fetches (3 retries max)
- [ ] T081 [P] Optimize all glTF models with glTF-Transform batch script: compress, simplify, texture resize
- [ ] T082 [P] Compress all textures to Basis Universal format with basisu CLI for 50-70% size reduction
- [ ] T083 Create build optimization config in vite.config.ts: code splitting, tree shaking, minification
- [ ] T084 Add Cache-Control headers configuration for Vercel deployment in vercel.json (1 year for hashed assets)
- [ ] T085 [P] Add OpenGraph and Twitter Card meta tags in index.html for social sharing previews
- [ ] T086 [P] Add favicon and app icons in public/ for browser tabs and bookmarks
- [ ] T087 Run Lighthouse audit on dev build, ensure Performance score ≥90, Accessibility ≥90
- [ ] T088 Run E2E smoke tests with Playwright: scene initialization, navigation flow, interaction responsiveness
- [ ] T089 Conduct manual QA pass: test on Chrome/Firefox/Safari/Edge desktop, verify 60 FPS, smooth transitions, no console errors
- [ ] T090 Create deployment workflow: build for production, preview locally, deploy to Vercel staging
- [ ] T091 Validate production build meets all constitution requirements: FPS ≥55 median, draw calls within budgets, load time <3s

### Constitution Quality Gates (Global)

- [ ] T092 Add dev-only FPS overlay (Stats.js) and renderer.info display for draw call/triangle counts
- [ ] T093 Implement window resize, tab visibility change, and GPU context loss recovery handlers in SceneManager
- [ ] T094 Ensure all Scene dispose() methods call ResourceDisposer to free geometries, materials, textures
- [ ] T095 Validate reduced-motion pathway: test with OS preference enabled, verify animations reduce to <100ms duration
- [ ] T096 Validate keyboard navigation: Tab through all interactive elements, verify focus indicators visible, Enter/Space activate
- [ ] T097 Test WebGL fallback: disable WebGL in browser, verify graceful fallback message displays
- [ ] T098 Run memory leak test: interact with portfolio for 10 minutes, check Chrome DevTools Memory tab for <10 MB delta
- [ ] T099 Profile landing scene in Chrome DevTools Performance tab: verify ≥55 FPS median, no frames >250ms
- [ ] T100 Validate constitution compliance checklist: UX consistency (smooth transitions), Performance (budgets met), Stability (error handling), Architecture (lifecycle hooks), Accessibility (reduced motion + keyboard)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase - MVP can ship after this
- **User Story 2 (Phase 4)**: Depends on Foundational phase - Can start after US1 or in parallel if multi-dev
- **User Story 3 (Phase 5)**: Depends on Foundational phase - Can start after US1 or in parallel
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - Standalone MVP
- **User Story 2 (P2)**: No dependencies on US1 or US3 - Independently testable (navigation can work without US1 landing or US3 interactions)
- **User Story 3 (P3)**: Depends on US2 ProjectsScene existing to add interactive project models - But can be developed in parallel and integrated

### Within Each User Story

**User Story 1 (Landing Experience)**:
- T026-T027 (scenes/objects) can run in parallel
- T028-T031 (scene setup) must run sequentially
- T032-T036 (features) can run after scene setup
- T037 (mounting) after all scene implementation
- T038-T041 (optimization) can run in parallel after scene works

**User Story 2 (Navigation)**:
- T042-T045 (create scenes + transitions) can run in parallel
- T046-T047 (camera transitions) sequential
- T048-T050 (navigation menu) sequential after camera transitions work
- T051-T053 (scene content) can run in parallel
- T054-T059 (polish) can run in parallel after scenes exist

**User Story 3 (Interactive Elements)**:
- T060-T061 (base classes) can run in parallel
- T062-T065 (interaction handlers) sequential on InteractiveObject
- T066-T068 (integration) sequential after handlers
- T069-T074 (features + optimization) can run in parallel after integration

### Parallel Opportunities

**Setup Phase** (can run simultaneously):
- T002-T004 (dependency installation)
- T006-T007 (config files)
- T010 (CSS), T011 (Husky), T012 (JSON)

**Foundational Phase** (can run simultaneously after utilities):
- T013-T015 (utilities) → then T016-T019 (core modules) in parallel
- T020-T025 (integration) sequential after core modules

**User Story 1** (within story):
- T026 + T027 (scene + particles classes)
- T039 + T040 (asset optimization)

**User Story 2** (within story):
- T042-T045 (all scene files)
- T051-T053 (scene content implementation)
- T054-T059 (accessibility + optimization)

**User Story 3** (within story):
- T060 + T061 (base classes)
- T069-T074 (features + optimization after integration)

**Polish Phase** (can run simultaneously):
- T075-T076 (docs + overlay)
- T081-T082 (asset optimization)
- T085-T086 (meta tags + icons)

---

## Parallel Example: User Story 1 (MVP)

```bash
# After Foundational phase completes, launch in parallel:
Task T026: "Create src/scenes/LandingScene.ts"
Task T027: "Create src/objects/AmbientParticles.ts"

# After T028-T031 sequential scene setup, launch in parallel:
Task T032: "Implement update() method"
Task T033: "Integrate PerformanceMonitor"
Task T034: "Add pointer parallax"
Task T035: "Implement ReducedMotion check"
Task T036: "Implement dispose() method"

# After scene implementation, launch in parallel:
Task T039: "Optimize landing model with glTF-Transform"
Task T040: "Compress landing textures"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Landing Experience)
4. **STOP and VALIDATE**: 
   - Load homepage, verify <3s load time
   - Check FPS overlay: ≥55 median over 10s
   - Test pointer parallax feedback
   - Verify reduced-motion preference respected
   - Check console: no errors
   - Chrome DevTools Memory: no leaks after 5 minutes
5. Deploy MVP to Vercel staging → Test in production environment
6. **Ship MVP**: User Story 1 is a complete, shippable portfolio experience

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready ✅
2. Add User Story 1 (Landing) → Test independently → Deploy/Demo (MVP!) 🎯
3. Add User Story 2 (Navigation) → Test independently → Deploy/Demo
4. Add User Story 3 (Interactions) → Test independently → Deploy/Demo
5. Add Polish phase tasks → Final production release
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Landing Experience)
   - Developer B: User Story 2 (Navigation) - can start immediately, no US1 dependency
   - Developer C: User Story 3 (Interactions) - can prep InteractiveObject base class
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

---

## Notes

- **[P] tasks**: Different files, no dependencies on incomplete tasks - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- Each user story is independently completable and testable (no cross-story blocking dependencies except US3 uses US2 ProjectsScene for integration)
- No formal unit/E2E tests generated (performance validation manual)
- Constitution budgets enforced: ≤150 draw calls landing, ≤300 typical, 60 FPS, <3s load
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, tightly coupled cross-story dependencies

---

## Task Count Summary

- **Phase 1 (Setup)**: 12 tasks
- **Phase 2 (Foundational)**: 13 tasks (BLOCKS all stories)
- **Phase 3 (User Story 1 - Landing)**: 16 tasks → **MVP SHIP HERE** 🎯
- **Phase 4 (User Story 2 - Navigation)**: 18 tasks
- **Phase 5 (User Story 3 - Interactions)**: 15 tasks
- **Phase 6 (Polish)**: 26 tasks (17 general + 9 constitution gates)

**Total Tasks**: 100

**Parallel Opportunities**: 31 tasks marked [P] can run simultaneously within their phases

**MVP Scope**: Phases 1-3 (41 tasks) deliver shippable landing experience

**Full Feature**: All phases (100 tasks) deliver complete portfolio with navigation and interactions
