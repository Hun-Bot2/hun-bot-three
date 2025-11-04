# Research: Dreamy Three.js Portfolio

**Phase**: 0 - Outline & Research  
**Date**: 2025-11-04  
**Purpose**: Resolve technical unknowns, document architecture decisions, and establish best practices for immersive desktop Three.js experience

---

## 1. Build Tooling & Development Environment

### Decision: Vite 5.x

**Rationale**:
- Native ES modules support with instant HMR for rapid Three.js iteration
- Optimized production builds with code splitting and tree-shaking
- Built-in TypeScript support without additional configuration
- Excellent Three.js ecosystem compatibility (official examples use Vite)
- Fast cold starts (<1s) crucial for frequent scene testing

**Alternatives Considered**:
- **Webpack 5**: More mature but slower dev server; HMR less reliable for Three.js hot-swapping shaders/geometries
- **Parcel**: Zero-config appealing but less control over asset pipeline for glTF/texture optimization
- **Rollup**: Lower-level, requires more configuration; Vite wraps Rollup for production anyway

**Best Practices**:
- Use `vite-plugin-glsl` for shader module imports with HMR
- Configure `assetsInclude` for `.glb`, `.gltf`, `.hdr` files
- Enable `build.sourcemap` for production debugging of WebGL errors
- Set `optimizeDeps.include: ['three']` to pre-bundle Three.js for faster dev startup

---

## 2. Three.js Scene Architecture Pattern

### Decision: Modular Scene Manager + Lifecycle Hooks

**Rationale**:
- Aligns with Constitution Principle IV (Composable Scene Architecture)
- Each scene (Landing, About, Projects, Contact) is a self-contained module with explicit `init()`, `mount()`, `update(delta)`, `dispose()` methods
- Single SceneManager orchestrates transitions, owns WebGLRenderer/Clock, prevents resource leaks
- Simplifies testing: scenes can be instantiated/disposed independently

**Alternatives Considered**:
- **Single monolithic scene**: Simpler initially but becomes unmaintainable with 3-5 sections; hard to lazy-load
- **React Three Fiber (R3F)**: Declarative and elegant but adds React overhead; potential performance ceiling for 60 FPS target with complex scenes
- **Entity-Component-System (ECS)**: Over-engineered for portfolio scope; better for games with hundreds of entities

**Architecture Blueprint**:

```typescript
// Core pattern
interface Scene {
  init(): Promise<void>;        // Load assets, create objects
  mount(renderer: WebGLRenderer): void;  // Add to scene graph
  update(delta: number): void;  // Animation loop
  dispose(): void;              // Cleanup resources
}

class SceneManager {
  private currentScene: Scene | null;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  
  async transitionTo(nextScene: Scene) {
    await nextScene.init();
    if (this.currentScene) this.currentScene.dispose();
    nextScene.mount(this.renderer);
    this.currentScene = nextScene;
  }
  
  animate() {
    requestAnimationFrame(this.animate);
    const delta = clock.getDelta();
    this.currentScene?.update(delta);
    this.renderer.render(scene, camera);
  }
}
```

**Best Practices**:
- Use `Object3D.traverse()` in `dispose()` to recursively clean geometries, materials, textures
- Dispose of render targets, framebuffers, and WebGL resources explicitly
- Implement `ResourceDisposer` utility to centralize cleanup logic
- Track active resources in dev mode with `PerformanceMonitor` to detect leaks

---

## 3. Animation & Transition Library

### Decision: GSAP 3.x for Timelines + Three.js for Mesh Animations

**Rationale**:
- GSAP excels at camera transitions (position, rotation, lookAt) with built-in easing curves (Power2.easeInOut, CustomEase)
- Timeline feature allows choreographing multi-step transitions (fade out UI → move camera → fade in new content)
- Direct integration: `gsap.to(camera.position, { x: 10, y: 5, z: 20, duration: 0.7, ease: 'power2.inOut' })`
- Three.js handles mesh-level animations (rotation, scale) in `update()` loop for 60 FPS sync

**Alternatives Considered**:
- **Tween.js**: Lighter but lacks timeline orchestration; manual sequencing error-prone
- **Anime.js**: Good for DOM but less Three.js-specific tooling; GSAP has ThreePlugin
- **Pure Three.js AnimationMixer**: Designed for skeletal/morph animations (glTF), overkill for camera/UI

**Best Practices**:
- Register GSAP ticker with Three.js clock: `gsap.ticker.add(() => renderer.render(scene, camera))`
- Use `onComplete` callbacks to trigger lifecycle events (e.g., mount next scene after camera arrives)
- Respect reduced motion: `if (prefersReducedMotion) duration = 0.1` for instant transitions
- Profile timeline overhead: keep total tween count <50 simultaneous for 60 FPS

---

## 4. Asset Pipeline & Optimization

### Decision: glTF 2.0 (GLB) + glTF-Transform + Basis Texture Compression

**Rationale**:
- glTF is Three.js native format; smallest file size with Draco compression
- glTF-Transform CLI automates optimization (mesh simplification, Draco encode, texture resize)
- Basis Universal textures → 50-70% smaller than PNG, GPU-decodable (ASTC/ETC/BC formats)
- Supports PBR materials (metalness/roughness) for MeshStandardMaterial consistency

**Alternatives Considered**:
- **FBX**: Proprietary Autodesk format; larger files, less web-optimized
- **OBJ/MTL**: No animation support, no PBR, verbose text format
- **USDZ**: Apple-specific, poor browser support

**Pipeline Steps**:

```bash
# Example optimization workflow
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp \
  --simplify 0.95 \
  --instance

# Texture compression (run separately)
basisu input.png -output_file output.basis -mipmap -q 128
```

**Best Practices**:
- Target <2 MB per glTF model for landing scene (budget: 5-10 models = 10-20 MB total)
- Use texture atlases for UI elements and repeated materials
- Bake ambient occlusion into vertex colors or textures to reduce real-time lighting cost
- Defer non-critical models with `GLTFLoader` + `DRACOLoader` lazy loading
- Store optimized assets in `public/models/` and `public/textures/` with CDN-friendly cache headers

---

## 5. Performance Monitoring & Profiling

### Decision: Custom PerformanceMonitor + Chrome DevTools

**Rationale**:
- Three.js `WebGLRenderer.info` exposes draw calls, triangles, textures in real-time
- `Stats.js` (fps/ms/mb) lightweight overlay for dev builds
- Chrome Performance tab critical for identifying jank (>16.7ms frames) and forced reflows
- Constitution mandates ≥55 FPS median, no stutters >250ms; need programmatic tracking

**Implementation**:

```typescript
class PerformanceMonitor {
  private fpsHistory: number[] = [];
  
  update(renderer: WebGLRenderer) {
    const fps = 1 / delta;
    this.fpsHistory.push(fps);
    
    if (this.fpsHistory.length > 600) { // 10s @ 60fps
      const median = this.getMedian(this.fpsHistory);
      if (median < 55) console.warn('FPS below threshold:', median);
      this.fpsHistory = [];
    }
    
    // Constitution budget checks
    if (renderer.info.render.calls > 150) {
      console.warn('Draw calls exceed landing budget:', renderer.info.render.calls);
    }
  }
}
```

**Best Practices**:
- Profile on target hardware: mid-range 2022+ laptop (e.g., MacBook Air M2, Dell XPS Intel i5)
- Use `chrome://gpu` to verify WebGL 2.0 and GPU acceleration active
- Enable `preserveDrawingBuffer: true` for debugging screenshots (disable in prod for perf)
- Test with network throttling (Fast 3G) to simulate slow CDN asset loads

---

## 6. Content Storage Strategy

### Decision: Static JSON (MVP) → Optional Azure Blob + Functions (v2)

**Rationale**:
- MVP: `public/content/portfolio-data.json` is simplest, zero backend, Vercel/Azure Static Web Apps ready
- Future: If client wants CMS for blog posts or project updates, Azure Functions (serverless) + Blob Storage provides pay-per-use scalability
- Avoids premature infrastructure complexity; portfolio content changes infrequently

**Data Structure (portfolio-data.json)**:

```json
{
  "sections": [
    {
      "id": "landing",
      "title": "Welcome",
      "subtitle": "Immersive 3D Portfolio"
    },
    {
      "id": "projects",
      "items": [
        {
          "id": "project-1",
          "title": "Dreamscape Explorer",
          "description": "Interactive 3D narrative experience",
          "thumbnailUrl": "/textures/project-1-thumb.jpg",
          "modelUrl": "/models/project-1.glb"
        }
      ]
    }
  ],
  "metadata": {
    "lastUpdated": "2025-11-04"
  }
}
```

**Azure Backend Option (Future)**:
- Azure Blob Storage: Host glTF models and images with CDN (Azure Front Door)
- Azure Functions: HTTP endpoint `/api/projects` returns JSON dynamically from Cosmos DB or Blob
- Authentication: Azure AD B2C if admin CMS needed; public read-only for visitors

**Best Practices**:
- Fetch JSON in `AssetLoader.init()` before scene creation
- Cache parsed content in memory; no repeated fetches during navigation
- Add `Cache-Control: max-age=3600` headers for CDN efficiency
- If Azure: use managed identity for Functions → Blob access (no keys in code)

---

## 7. TypeScript Configuration for Three.js

### Decision: Strict Mode + @types/three

**Rationale**:
- Strict null checks catch runtime errors (e.g., accessing `.dispose()` on undefined material)
- Three.js official types (`@types/three`) well-maintained and accurate
- Constitution Principle III requires "zero lint/typecheck errors"

**tsconfig.json Essentials**:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "WebWorker"],
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Best Practices**:
- Use `import type` for type-only imports to reduce bundle size
- Enable `noUncheckedIndexedAccess` to force checks on array access
- Add custom type guards for Three.js object checks: `isMesh(obj: Object3D): obj is Mesh`

---

## 8. Testing Strategy

### Decision: Vitest (Unit) + Playwright (E2E) + Manual Profiling

**Rationale**:
- **Vitest**: Vite-native, fast unit tests for utilities (easing functions, resource disposal helpers)
- **Playwright**: Headless browser E2E for scene initialization, navigation flows, performance assertions
- **Manual**: Profiling requires human judgment (visual smoothness, emotional tone) + DevTools analysis

**Test Coverage Goals**:
- Unit: `ReducedMotion`, `ResourceDisposer`, animation math utilities (80%+ coverage)
- E2E: Scene initialization (<3s), FPS ≥55 median over 10s, navigation transitions complete <800ms
- Integration: Not applicable (no backend contracts for MVP)

**Example Playwright Test**:

```typescript
test('Landing scene loads within 3 seconds and maintains 55 FPS', async ({ page }) => {
  await page.goto('/');
  
  // Wait for WebGL canvas
  await page.waitForSelector('canvas', { timeout: 3000 });
  
  // Inject FPS monitor
  const fps = await page.evaluate(() => {
    let frames = 0;
    const start = performance.now();
    function count() {
      frames++;
      if (performance.now() - start < 10000) requestAnimationFrame(count);
    }
    count();
    return new Promise(resolve => setTimeout(() => resolve(frames / 10), 10000));
  });
  
  expect(fps).toBeGreaterThan(55);
});
```

**Best Practices**:
- Mock `GLTFLoader` in unit tests to avoid loading real assets
- Use `page.coverage()` in Playwright to identify unused code in bundles
- Run E2E tests on CI with `xvfb` (headless Linux) and macOS WebKit for Safari simulation

---

## 9. Deployment Platform

### Decision: Vercel (Primary) with Azure Static Web Apps (Fallback)

**Rationale**:
- **Vercel**: Best-in-class Vite integration, instant previews, edge CDN, zero config HTTPS
- **Azure Static Web Apps**: Good if client prefers Microsoft ecosystem or needs Azure Functions integration
- Both support custom domains, automatic HTTPS, global CDN, and deploy from GitHub

**Vercel Advantages**:
- Native Vite support (`vite build` → automatic optimization)
- Edge network with 100+ locations for low latency asset delivery
- Built-in image optimization (future enhancement for thumbnails)
- Generous free tier for personal portfolios

**Azure Advantages**:
- Tight Azure Functions integration if CMS backend added
- Azure Blob Storage CDN for large 3D assets
- Enterprise-friendly (if client is Microsoft shop)

**Best Practices**:
- Set `Cache-Control` headers for glTF/textures: `public, max-age=31536000, immutable`
- Use content hashing in build (`[name].[hash].js`) for cache busting
- Enable gzip/brotli compression (both platforms handle automatically)
- Add `vercel.json` or `staticwebapp.config.json` for custom headers/redirects

---

## 10. Accessibility: Reduced Motion & Keyboard Navigation

### Decision: `prefers-reduced-motion` Query + ARIA + Focus Traps

**Rationale**:
- Constitution Principle V mandates reduced motion support
- CSS media query `@media (prefers-reduced-motion: reduce)` detects OS-level preference
- JavaScript: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
- Keyboard nav: `Tab` through interactive 3D objects (use invisible DOM proxies with `aria-label`)

**Implementation Pattern**:

```typescript
class ReducedMotion {
  static isEnabled(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  static getDuration(standard: number): number {
    return this.isEnabled() ? 0.1 : standard; // Near-instant transitions
  }
}

// Usage
gsap.to(camera.position, {
  x: 10,
  duration: ReducedMotion.getDuration(0.7),
  ease: 'power2.inOut'
});
```

**Keyboard Navigation**:
- Create invisible `<button>` elements positioned over 3D objects
- On focus, highlight corresponding 3D object (add emissive glow)
- On Enter/Space, trigger click interaction
- Announce state changes with `aria-live` regions

**Best Practices**:
- Test with VoiceOver (macOS), NVDA (Windows), JAWS
- Ensure focus order matches visual/spatial order (left-to-right, top-to-bottom)
- Add skip link: "Skip to main content" for screen reader users
- Contrast check: text overlays must meet WCAG AA (4.5:1 ratio)

---

## 11. Error Handling & Graceful Degradation

### Decision: WebGL Feature Detection + Context Loss Recovery + Fallback UI

**Rationale**:
- ~5% of users have WebGL disabled (corporate policies, old browsers, privacy tools)
- GPU context loss happens (driver crashes, tab backgrounding on mobile)
- Constitution Principle III requires graceful fallbacks

**Feature Detection**:

```typescript
function supportsWebGL2(): boolean {
  const canvas = document.createElement('canvas');
  return !!(canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2'));
}

if (!supportsWebGL2()) {
  document.body.innerHTML = `
    <div class="fallback">
      <h1>WebGL 2.0 Required</h1>
      <p>Please use a modern browser: Chrome 56+, Firefox 51+, Safari 15+</p>
    </div>
  `;
}
```

**Context Loss Recovery**:

```typescript
renderer.domElement.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  console.warn('WebGL context lost. Attempting recovery...');
  cancelAnimationFrame(animationId);
});

renderer.domElement.addEventListener('webglcontextrestored', () => {
  console.log('WebGL context restored. Reinitializing scene...');
  initScene(); // Reload assets, recreate geometries
  animate();
});
```

**Best Practices**:
- Show loading indicator during asset fetch (progress bar tied to `LoadingManager`)
- Add error boundary for async asset failures (retry 3× with exponential backoff)
- Log WebGL errors to analytics (e.g., Sentry) for monitoring

---

## 12. Draw Call Optimization Techniques

### Decision: Instancing + Geometry Merging + Frustum Culling

**Rationale**:
- Constitution budget: ≤150 draw calls (landing), ≤300 (typical scenes)
- Three.js default: 1 draw call per mesh; 100 meshes = 100 calls → need batching

**Techniques**:

1. **InstancedMesh**: Render N copies of same geometry/material in 1 draw call
   ```typescript
   const geometry = new IcosahedronGeometry(0.5);
   const material = new MeshStandardMaterial({ color: 0x4a90e2 });
   const instancedMesh = new InstancedMesh(geometry, material, 100);
   
   for (let i = 0; i < 100; i++) {
     const matrix = new Matrix4().setPosition(random(), random(), random());
     instancedMesh.setMatrixAt(i, matrix);
   }
   ```

2. **BufferGeometryUtils.mergeGeometries**: Combine static meshes
   ```typescript
   import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
   const merged = mergeGeometries([geo1, geo2, geo3]);
   const mesh = new Mesh(merged, sharedMaterial);
   ```

3. **Frustum Culling**: Automatic (Three.js default) but verify with `mesh.frustumCulled = true`

**Best Practices**:
- Use InstancedMesh for particle systems, repeated decorative elements
- Merge background/static geometry that never animates independently
- Profile with `renderer.info.render.calls` after each optimization pass
- Trade-off: Merging loses individual object interactivity (can't click merged mesh)

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Build Tool | Vite 5.x | Fast HMR, native Three.js support, TypeScript ready |
| Architecture | Modular Scene Manager + Lifecycle | Constitution Principle IV, testable, leak-proof |
| Animations | GSAP 3.x + Three.js | Timeline orchestration + 60 FPS mesh sync |
| Assets | glTF + glTF-Transform + Basis | Smallest size, PBR support, GPU texture decode |
| Performance | Custom Monitor + Chrome DevTools | Constitution metrics (≥55 FPS, ≤150 calls) |
| Content | Static JSON → Optional Azure | Simple MVP, scalable future if CMS needed |
| TypeScript | Strict Mode + @types/three | Zero errors mandate (Principle III) |
| Testing | Vitest + Playwright + Manual | Unit utils, E2E flows, human UX judgment |
| Deployment | Vercel (primary) / Azure SWA (alt) | CDN, HTTPS, Vite-native, both viable |
| Accessibility | Reduced Motion + Keyboard Nav | Principle V compliance, WCAG AA |
| Error Handling | WebGL Detection + Context Recovery | Graceful degradation (Principle III) |
| Draw Calls | Instancing + Merging + Culling | Constitution budgets (≤150/≤300) |

All NEEDS CLARIFICATION items resolved. Ready for Phase 1: Design & Contracts.
