# Quickstart Guide: Dreamy Three.js Portfolio

**Date**: 2025-11-04  
**Purpose**: Get the portfolio running locally in <5 minutes

---

## Prerequisites

- **Node.js**: 18.x or 20.x (LTS recommended)
- **Package Manager**: npm 9+ or pnpm 8+
- **Browser**: Chrome 110+, Firefox 115+, Safari 16.4+, or Edge 110+
- **GPU**: Discrete or integrated GPU with WebGL 2.0 support
- **Display**: Minimum 1280px width (desktop-optimized)

**Check WebGL Support**:  
Visit https://get.webgl.org/webgl2/ — should show spinning cube.

---

## Installation

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/hun-bot-three.git
cd hun-bot-three

# Install dependencies
npm install
# or
pnpm install
```

**Expected Dependencies**:
- `three` (Three.js core)
- `vite` (build tool)
- `typescript` (type checking)
- `gsap` (animations)
- `@types/three` (TypeScript definitions)
- `vitest` (unit tests)
- `playwright` (E2E tests)

---

### 2. Start Development Server

```bash
npm run dev
```

**Output**:
```
VITE v5.x.x  ready in 423 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

**Open**: http://localhost:5173/ in your browser.

**Expected Behavior**:
- Landing scene loads within 3 seconds
- 3D elements appear with ambient lighting
- Smooth 60 FPS animation
- Pointer movement triggers parallax/feedback

---

## Project Structure

```
hun-bot-three/
├── src/
│   ├── core/
│   │   ├── SceneManager.ts      # Orchestrates scene lifecycle
│   │   ├── CameraController.ts  # Camera transitions
│   │   ├── InputHandler.ts      # Pointer/keyboard input
│   │   └── AssetLoader.ts       # Resource management
│   ├── scenes/
│   │   ├── LandingScene.ts      # P1: Initial experience
│   │   ├── AboutScene.ts        # P2: About section
│   │   ├── ProjectsScene.ts     # P2: Projects gallery
│   │   └── ContactScene.ts      # P2: Contact section
│   ├── objects/
│   │   ├── InteractiveObject.ts # Hover/click objects
│   │   └── AmbientParticles.ts  # Atmospheric effects
│   ├── animations/
│   │   ├── CameraTransition.ts  # Camera movement
│   │   └── ObjectAnimator.ts    # Object animations
│   ├── utils/
│   │   ├── PerformanceMonitor.ts # FPS tracking
│   │   └── ReducedMotion.ts     # Accessibility
│   ├── content/
│   │   └── portfolio-data.json  # Static content
│   ├── styles/
│   │   └── global.css           # UI overlays
│   └── main.ts                  # Entry point
├── public/
│   ├── models/                  # glTF 3D assets
│   ├── textures/                # Images/textures
│   └── fonts/                   # Web fonts
├── tests/
│   ├── unit/                    # Utility tests
│   └── e2e/                     # Playwright tests
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Development Workflow

### Hot Module Replacement (HMR)

Vite automatically reloads on file changes:

```bash
# Edit src/scenes/LandingScene.ts
# Save → Browser updates instantly (no full reload)
```

**Note**: Shader changes (`.glsl` files) trigger full reload (WebGL context limitation).

---

### TypeScript Checking

```bash
# Run type checker (does not emit files)
npm run typecheck

# Or watch mode
npm run typecheck:watch
```

**Expected Output**:
```
✓ No type errors found
```

---

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix

# Format with Prettier
npm run format
```

**Pre-commit Hook** (recommended):
```bash
# Install Husky
npm install -D husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run typecheck"
```

---

## Performance Monitoring

### Built-in FPS Overlay (Dev Mode)

Press `Shift+F` to toggle Stats.js overlay:

```
FPS: 60 (16.7 ms)
Draw calls: 87
Triangles: 54,321
```

**Thresholds** (from constitution):
- FPS: ≥55 median over 10s (target 60)
- Draw calls: ≤150 (landing), ≤300 (typical)
- Frame time: ≤16.7ms (60 FPS budget)

---

### Chrome DevTools Profiling

1. Open DevTools (`F12`)
2. Performance tab → Record (Cmd+E / Ctrl+E)
3. Interact with scene for 10s
4. Stop recording
5. Check:
   - **FPS graph**: Should stay above 55 FPS
   - **Main thread**: No red bars (jank)
   - **GPU**: Verify hardware acceleration active

**Look for**:
- Long frames (>16.7ms): Optimize draw calls or geometry
- Forced reflows: Avoid DOM reads after writes in animation loop
- Memory sawtooth: Check for leaks (geometries not disposed)

---

## Testing

### Unit Tests (Vitest)

```bash
# Run once
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Example Test** (`tests/unit/ReducedMotion.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { ReducedMotion } from '@/utils/ReducedMotion';

describe('ReducedMotion', () => {
  it('should return reduced duration when enabled', () => {
    // Mock prefers-reduced-motion: reduce
    const duration = ReducedMotion.getDuration(0.7);
    expect(duration).toBe(0.1); // Near-instant
  });
});
```

---

### E2E Tests (Playwright)

```bash
# Install browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui
```

**Example Test** (`tests/e2e/landing.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test('Landing scene loads within 3 seconds', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Wait for canvas
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 3000 });
  
  // Check FPS (inject monitor)
  const fps = await page.evaluate(() => {
    // FPS measurement logic...
    return 60; // Mock result
  });
  
  expect(fps).toBeGreaterThanOrEqual(55);
});
```

---

## Building for Production

### Build Command

```bash
npm run build
```

**Output**:
```
vite v5.x.x building for production...
✓ 127 modules transformed.
dist/index.html                  1.2 kB
dist/assets/index-a3b4c5d6.js    245.3 kB │ gzip: 78.1 kB
dist/assets/index-e7f8g9h0.css   12.4 kB │ gzip: 3.2 kB
✓ built in 4.32s
```

**Build Artifacts**:
- `dist/` folder contains optimized HTML, JS, CSS, assets
- Hashed filenames for cache busting
- Source maps included for debugging

---

### Preview Build Locally

```bash
npm run preview
```

**Output**:
```
➜  Local:   http://localhost:4173/
```

**Test Production Build**:
- Verify all scenes load correctly
- Check network tab: assets served with cache headers
- Confirm no console errors

---

### Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Automatic Deployments**:
1. Connect GitHub repo to Vercel dashboard
2. Every push to `main` branch auto-deploys to production
3. Pull requests get preview URLs

**Custom Domain**:
```bash
vercel domains add hun-portfolio.com
```

---

#### Azure Static Web Apps

```bash
# Install Azure CLI
brew install azure-cli  # macOS
# or download from https://aka.ms/installazurecliwindows

# Login
az login

# Create static web app
az staticwebapp create \
  --name hun-portfolio \
  --resource-group portfolio-rg \
  --location eastus2 \
  --source . \
  --branch main \
  --app-location "/" \
  --output-location "dist"

# Get deployment token
az staticwebapp secrets list --name hun-portfolio --query "properties.apiKey"
```

**GitHub Actions** (auto-deploys on push):
Azure creates `.github/workflows/azure-static-web-apps-*.yml` automatically.

---

## Content Management

### Editing Portfolio Content (MVP)

**File**: `src/content/portfolio-data.json`

**Example: Add New Project**

```json
{
  "sections": [
    {
      "id": "projects",
      "type": "projects",
      "projects": [
        {
          "id": "my-new-project",
          "title": "Cosmic Voyage",
          "description": "An interstellar exploration experience",
          "tags": ["Three.js", "Space", "Interactive"],
          "thumbnailUrl": "/textures/projects/cosmic-thumb.jpg",
          "modelUrl": "/models/projects/cosmic.glb",
          "featured": true,
          "createdDate": "2025-11-04T00:00:00Z"
        }
      ]
    }
  ]
}
```

**Steps**:
1. Edit `portfolio-data.json`
2. Add thumbnail to `public/textures/projects/`
3. Add model to `public/models/projects/`
4. Save → Dev server reloads automatically
5. Test in browser
6. Commit and deploy

---

### Adding 3D Models

**Recommended Format**: glTF 2.0 (.glb binary)

**Optimization Pipeline**:

```bash
# Install glTF-Transform CLI
npm install -g @gltf-transform/cli

# Optimize model
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --simplify 0.95 \
  --texture-compress webp

# Check size
ls -lh output.glb
# Target: <2 MB per model
```

**Place in**: `public/models/`

**Load in Scene**:
```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const gltf = await loader.loadAsync('/models/my-model.glb');
scene.add(gltf.scene);
```

---

## Troubleshooting

### Issue: Black Screen on Load

**Causes**:
- WebGL not supported
- GPU acceleration disabled
- Shader compilation error

**Fixes**:
1. Check browser console for errors
2. Visit https://get.webgl.org/webgl2/
3. Enable GPU in browser settings
4. Update graphics drivers

---

### Issue: Low FPS (<55)

**Causes**:
- Too many draw calls
- High-poly models
- Inefficient shaders

**Fixes**:
1. Check `renderer.info.render.calls` (should be ≤150 landing, ≤300 typical)
2. Use `InstancedMesh` for repeated objects
3. Merge static geometries with `BufferGeometryUtils.mergeGeometries`
4. Add LODs (Level of Detail) for distant objects
5. Profile in Chrome DevTools Performance tab

---

### Issue: Memory Leak (Tab Crashes)

**Causes**:
- Geometries/materials not disposed
- Textures accumulating

**Fixes**:
1. Implement `dispose()` method in all scenes:
   ```typescript
   dispose() {
     this.scene.traverse((obj) => {
       if (obj instanceof Mesh) {
         obj.geometry.dispose();
         obj.material.dispose();
       }
     });
   }
   ```
2. Use `ResourceDisposer` utility
3. Test with Chrome DevTools Memory profiler (look for detached DOM nodes)

---

### Issue: HMR Not Working

**Causes**:
- Port already in use
- File watcher limit exceeded (Linux)

**Fixes**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Increase file watchers (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Performance Checklist

Before deploying to production, verify:

- [ ] **FPS**: ≥55 median over 10s on mid-range 2022+ hardware
- [ ] **Load Time**: First frame <3s on broadband (10 Mbps+)
- [ ] **Draw Calls**: ≤150 (landing), ≤300 (typical scenes)
- [ ] **Texture Memory**: ≤64 MB resident
- [ ] **Camera Transitions**: 500-800ms smooth easing
- [ ] **No Console Errors**: Zero errors/warnings in production build
- [ ] **Memory Stable**: No leaks over 10 minutes interaction
- [ ] **Reduced Motion**: Respects `prefers-reduced-motion: reduce`
- [ ] **Keyboard Nav**: All interactive elements tabbable and focusable
- [ ] **Fallback**: Graceful message if WebGL unavailable

---

## Next Steps

1. **Customize Content**: Edit `portfolio-data.json` with your projects
2. **Add Models**: Place optimized `.glb` files in `public/models/`
3. **Adjust Camera Positions**: Modify `cameraPosition` in sections to frame content
4. **Style UI Overlays**: Edit `src/styles/global.css` for text/menu
5. **Test Performance**: Profile on target hardware, optimize if needed
6. **Deploy**: Push to GitHub → Auto-deploy to Vercel/Azure

**Full Implementation Plan**: See `specs/three-hb-portfolio/plan.md`  
**API Contracts**: See `specs/three-hb-portfolio/contracts/api-contracts.md`  
**Data Model**: See `specs/three-hb-portfolio/data-model.md`

---

## Support

**Documentation**: [README.md](../../README.md)  
**Issues**: [GitHub Issues](https://github.com/yourusername/hun-bot-three/issues)  
**Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

**Happy Coding! 🚀✨**
