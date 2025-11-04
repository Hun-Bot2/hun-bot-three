# Data Model: Dreamy Three.js Portfolio

**Phase**: 1 - Design & Contracts  
**Date**: 2025-11-04  
**Purpose**: Define entities, state, and relationships for the 3D portfolio application

---

## Entity Overview

This portfolio is primarily a **client-side visual experience** with minimal traditional "data" in the database sense. The data model focuses on:

1. **Runtime Scene State**: Scene objects, camera positions, animation states (ephemeral, in-memory)
2. **Content Data**: Portfolio sections, projects, metadata (static JSON or fetched from API)
3. **User Preferences**: Reduced motion, visited sections (browser localStorage)

---

## 1. Scene State (Runtime, In-Memory)

### SceneState

**Purpose**: Tracks the current active scene and transition state in the SceneManager.

**Fields**:
- `currentSceneId`: `string` — Active scene identifier (`'landing'`, `'about'`, `'projects'`, `'contact'`)
- `previousSceneId`: `string | null` — Last scene before transition (for back navigation)
- `isTransitioning`: `boolean` — True during camera transitions (locks input)
- `transitionProgress`: `number` (0.0 - 1.0) — Normalized progress of current transition

**State Transitions**:
```
Idle → Transitioning (user navigates) → Idle (transition complete)
```

**Validation Rules**:
- `currentSceneId` must match one of: `landing`, `about`, `projects`, `contact`
- `isTransitioning = true` → disable all input handlers except cancel (ESC key)
- `transitionProgress` must be clamped 0.0 - 1.0

**Relationships**:
- 1:1 with SceneManager (singleton)
- 1:N with Scene instances (one active, others disposed or lazy-loaded)

---

### CameraState

**Purpose**: Represents camera position, target, and animation parameters.

**Fields**:
- `position`: `Vector3` — Current camera world position (x, y, z)
- `target`: `Vector3` — LookAt target (where camera points)
- `fov`: `number` (45-75) — Field of view in degrees
- `targetPosition`: `Vector3 | null` — Destination during transitions
- `targetLookAt`: `Vector3 | null` — Destination lookAt target
- `transitionDuration`: `number` — Seconds for current transition (0.5-0.8)
- `easingFunction`: `string` — GSAP easing ('power2.inOut', 'circ.out', etc.)

**State Transitions**:
```
Resting → Animating (GSAP tween active) → Resting (onComplete)
```

**Validation Rules**:
- `position` and `target` must not be NaN or Infinity
- `fov` clamped to 45-75 to prevent distortion
- `transitionDuration` must be 0.3-0.8s per constitution (300-800ms)

**Relationships**:
- 1:1 with Three.js PerspectiveCamera instance
- Controlled by CameraController module

---

### InteractionState

**Purpose**: Tracks which objects are hovered, focused, or clicked for visual feedback.

**Fields**:
- `hoveredObjectId`: `string | null` — UUID of currently hovered Interactive3DObject
- `focusedObjectId`: `string | null` — UUID of keyboard-focused object (for accessibility)
- `activeObjectId`: `string | null` — UUID of object being dragged/manipulated
- `pointerPosition`: `Vector2` — Normalized device coordinates (-1 to 1)
- `raycaster`: `Raycaster` — Three.js raycaster for pointer intersection tests

**State Transitions**:
```
Idle → Hover (pointer over object) → Idle (pointer leave)
Idle → Focus (keyboard Tab) → Active (Enter/Space pressed) → Idle (release)
```

**Validation Rules**:
- Only one object can be hovered/focused/active at a time (mutually exclusive IDs)
- `pointerPosition` must be normalized to [-1, 1] range
- Raycaster must be updated every frame with camera and pointer

**Relationships**:
- N:1 with Interactive3DObject instances (many objects, one interaction state)
- 1:1 with InputHandler

---

## 2. Content Data (Static/Fetched)

### PortfolioContent

**Purpose**: Top-level container for all portfolio content (sections, projects, metadata).

**Fields**:
- `sections`: `Section[]` — Array of content sections (landing, about, projects, contact)
- `metadata`: `Metadata` — Last updated date, version, author info

**Source**:
- **MVP**: Loaded from `/public/content/portfolio-data.json` at app init
- **Future**: Fetched from Azure Functions endpoint `/api/content`

**Schema** (TypeScript):
```typescript
interface PortfolioContent {
  sections: Section[];
  metadata: Metadata;
}
```

**Validation Rules**:
- `sections` must contain exactly 1 section with `id: 'landing'`
- All section IDs must be unique
- At least 1 section with `type: 'projects'` (can be empty initially)

**Relationships**:
- 1:N with Section
- 1:1 with Metadata

---

### Section

**Purpose**: Represents a navigable area of the portfolio (landing, about, projects, contact).

**Fields**:
- `id`: `string` (PK) — Unique identifier (`'landing'`, `'about'`, `'projects'`, `'contact'`)
- `type`: `'landing' | 'content' | 'projects' | 'contact'` — Section category
- `title`: `string` — Display title (e.g., "Welcome", "My Work")
- `subtitle`: `string | null` — Optional tagline
- `cameraPosition`: `Vector3` — Predefined camera position for this section
- `cameraTarget`: `Vector3` — Predefined camera lookAt for this section
- `content`: `RichContent | null` — Markdown/HTML content for text sections
- `projects`: `Project[] | null` — Array of projects (only if `type === 'projects'`)
- `backgroundModelUrl`: `string | null` — Optional glTF model for section backdrop

**Schema**:
```typescript
interface Section {
  id: string;
  type: 'landing' | 'content' | 'projects' | 'contact';
  title: string;
  subtitle?: string;
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };
  content?: string; // Markdown or HTML
  projects?: Project[];
  backgroundModelUrl?: string;
}
```

**Validation Rules**:
- `id` must match `[a-z-]+` pattern (lowercase, hyphens only)
- `cameraPosition` and `cameraTarget` must not be identical (distance > 0.1 units)
- If `type === 'projects'`, `projects` array must be present (can be empty)
- `backgroundModelUrl` must be valid path or null

**Relationships**:
- N:1 with PortfolioContent
- 1:N with Project (if type is 'projects')
- 1:1 with Scene instance (mapped at runtime)

---

### Project

**Purpose**: Individual portfolio project with metadata, thumbnails, and 3D model.

**Fields**:
- `id`: `string` (PK) — Unique identifier (`'project-1'`, `'dreamscape-explorer'`)
- `title`: `string` — Project name
- `description`: `string` — Brief summary (1-2 sentences)
- `tags`: `string[]` — Tech stack or categories (e.g., `['Three.js', 'WebGL', 'Art']`)
- `thumbnailUrl`: `string` — Path to preview image (e.g., `/textures/project-1-thumb.jpg`)
- `modelUrl`: `string | null` — Optional 3D model to display on hover/click
- `externalUrl`: `string | null` — Link to live demo or case study
- `featured`: `boolean` — If true, highlight in gallery
- `createdDate`: `string` (ISO 8601) — Project completion date

**Schema**:
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  modelUrl?: string;
  externalUrl?: string;
  featured: boolean;
  createdDate: string; // ISO 8601
}
```

**Validation Rules**:
- `id` must be unique across all projects
- `thumbnailUrl` must be valid image path (`.jpg`, `.png`, `.webp`)
- `modelUrl` if present must be `.glb` or `.gltf`
- `externalUrl` must be valid URL or null
- `createdDate` must be valid ISO 8601 date string

**Relationships**:
- N:1 with Section (projects section)
- 1:1 with Interactive3DObject (if `modelUrl` provided)

---

### Metadata

**Purpose**: Versioning and authorship information for content.

**Fields**:
- `lastUpdated`: `string` (ISO 8601) — Timestamp of last content update
- `version`: `string` — Semantic version (`'1.0.0'`)
- `author`: `string` — Portfolio owner name

**Schema**:
```typescript
interface Metadata {
  lastUpdated: string;
  version: string;
  author: string;
}
```

**Validation Rules**:
- `lastUpdated` must be valid ISO date
- `version` must match semver pattern `\d+\.\d+\.\d+`

---

## 3. User Preferences (Browser LocalStorage)

### UserPreferences

**Purpose**: Persist user settings across sessions (reduced motion, visited sections).

**Fields**:
- `reducedMotion`: `boolean | null` — User override for motion preferences (null = use OS setting)
- `visitedSections`: `string[]` — IDs of sections user has navigated to (for analytics)
- `lastVisit`: `string` (ISO 8601) — Timestamp of last portfolio visit

**Storage Key**: `'hun-portfolio-preferences'`

**Schema**:
```typescript
interface UserPreferences {
  reducedMotion: boolean | null;
  visitedSections: string[];
  lastVisit: string;
}
```

**Validation Rules**:
- If `reducedMotion` is `null`, fallback to `prefers-reduced-motion` media query
- `visitedSections` must only contain valid section IDs
- Auto-clear `visitedSections` if `lastVisit` is >30 days old

**Persistence**:
```typescript
// Save
localStorage.setItem('hun-portfolio-preferences', JSON.stringify(prefs));

// Load
const prefs = JSON.parse(localStorage.getItem('hun-portfolio-preferences') || '{}');
```

---

## 4. Asset Metadata (Runtime, In-Memory)

### AssetCache

**Purpose**: Tracks loaded 3D models, textures, and their memory usage for disposal.

**Fields**:
- `models`: `Map<string, GLTF>` — Loaded glTF models keyed by URL
- `textures`: `Map<string, Texture>` — Loaded textures keyed by URL
- `totalMemoryMB`: `number` — Estimated GPU memory usage (tracked via texture dimensions)
- `loadingPromises`: `Map<string, Promise<any>>` — In-flight asset loads (prevent duplicate requests)

**Schema**:
```typescript
class AssetCache {
  private models = new Map<string, GLTF>();
  private textures = new Map<string, Texture>();
  
  async loadModel(url: string): Promise<GLTF> {
    if (this.models.has(url)) return this.models.get(url)!;
    const gltf = await gltfLoader.loadAsync(url);
    this.models.set(url, gltf);
    return gltf;
  }
  
  dispose() {
    this.models.forEach(gltf => gltf.scene.traverse(disposeObject));
    this.textures.forEach(tex => tex.dispose());
    this.models.clear();
    this.textures.clear();
  }
}
```

**Validation Rules**:
- `totalMemoryMB` must not exceed 64 MB (constitution budget)
- If memory limit reached, trigger lazy unload of non-visible assets
- Dispose all assets when navigating away from section

---

## 5. Performance Metrics (Runtime, Ephemeral)

### PerformanceMetrics

**Purpose**: Track FPS, draw calls, and memory for constitution compliance.

**Fields**:
- `currentFPS`: `number` — Instantaneous frames per second
- `medianFPS`: `number` — Median FPS over last 10 seconds
- `drawCalls`: `number` — Current frame's draw call count (from `renderer.info`)
- `triangles`: `number` — Total triangles rendered
- `textureMemoryMB`: `number` — GPU texture memory estimate
- `frameTimeHistory`: `number[]` — Last 600 frame times (10s @ 60fps) for median calc

**Schema**:
```typescript
class PerformanceMetrics {
  private frameTimeHistory: number[] = [];
  
  update(delta: number, renderer: WebGLRenderer) {
    this.currentFPS = 1 / delta;
    this.frameTimeHistory.push(delta * 1000); // ms
    
    if (this.frameTimeHistory.length > 600) {
      this.medianFPS = 1000 / this.median(this.frameTimeHistory);
      this.frameTimeHistory = [];
      
      if (this.medianFPS < 55) {
        console.error('Constitution violation: FPS below 55');
      }
    }
    
    this.drawCalls = renderer.info.render.calls;
    this.triangles = renderer.info.render.triangles;
  }
}
```

**Validation Rules**:
- `medianFPS` must be ≥55 (constitution requirement)
- `drawCalls` must be ≤150 (landing) or ≤300 (other scenes)
- Log violations to console (dev) or analytics (prod)

---

## Entity Relationship Diagram (Conceptual)

```
PortfolioContent (1)
  ├── Metadata (1)
  └── Section (N)
        ├── Project (N, if type='projects')
        └── Scene (1, runtime mapping)

SceneManager (1, singleton)
  ├── SceneState (1)
  ├── CameraState (1)
  ├── InteractionState (1)
  └── AssetCache (1)

UserPreferences (1, localStorage)

PerformanceMetrics (1, singleton)
```

---

## Data Flow

1. **App Initialization**:
   ```
   Load portfolio-data.json → Parse into PortfolioContent
   → Initialize SceneManager with landing scene
   → Create AssetCache, load critical assets (landing models/textures)
   → Read UserPreferences from localStorage
   ```

2. **Navigation (User clicks "Projects")**:
   ```
   InputHandler detects click → SceneManager.transitionTo('projects')
   → Update SceneState.isTransitioning = true
   → GSAP tween CameraState to projects.cameraPosition
   → On tween complete: Mount ProjectsScene, dispose LandingScene
   → Update UserPreferences.visitedSections, save to localStorage
   ```

3. **Interaction (User hovers 3D object)**:
   ```
   InputHandler raycasts pointer → Intersection detected
   → Update InteractionState.hoveredObjectId
   → Object applies emissive glow (visual feedback)
   → On pointer leave: Clear hoveredObjectId, remove glow
   ```

4. **Asset Loading (Lazy load project model)**:
   ```
   User clicks project thumbnail → AssetCache.loadModel(project.modelUrl)
   → Check cache: if cached, return immediately
   → Else: GLTFLoader.loadAsync → Store in cache → Return GLTF
   → Add model to scene, position at focal point
   ```

5. **Performance Monitoring (Every frame)**:
   ```
   SceneManager.animate → Calculate delta
   → PerformanceMetrics.update(delta, renderer)
   → Check medianFPS, drawCalls against budgets
   → If violation: Log warning, reduce quality (LOD swap)
   ```

---

## Schema Validation

All content data loaded from JSON will be validated at runtime using Zod or similar:

```typescript
import { z } from 'zod';

const ProjectSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  tags: z.array(z.string()),
  thumbnailUrl: z.string().url(),
  modelUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  featured: z.boolean(),
  createdDate: z.string().datetime(),
});

const SectionSchema = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  type: z.enum(['landing', 'content', 'projects', 'contact']),
  title: z.string(),
  subtitle: z.string().optional(),
  cameraPosition: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  cameraTarget: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  content: z.string().optional(),
  projects: z.array(ProjectSchema).optional(),
  backgroundModelUrl: z.string().optional(),
});

const PortfolioContentSchema = z.object({
  sections: z.array(SectionSchema),
  metadata: z.object({
    lastUpdated: z.string().datetime(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    author: z.string(),
  }),
});

// Usage
const data = await fetch('/content/portfolio-data.json').then(r => r.json());
const validated = PortfolioContentSchema.parse(data); // Throws if invalid
```

---

## Summary

The data model is lightweight and client-centric, focusing on:
- **Runtime state** for scenes, camera, interactions (ephemeral)
- **Static content** for portfolio sections and projects (JSON)
- **User preferences** for accessibility and analytics (localStorage)
- **Performance tracking** for constitution compliance (in-memory)

No traditional backend database is required for MVP. Future Azure integration would add:
- Cosmos DB or Blob Storage for dynamic project content
- Azure Functions for CMS API endpoints
- Managed identity for secure access

All entities are strongly typed (TypeScript interfaces), validated at runtime (Zod schemas), and designed for lifecycle-aware disposal to prevent memory leaks.
