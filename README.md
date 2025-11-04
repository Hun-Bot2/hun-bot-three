# Three.js Portfolio

> An immersive 3D portfolio experience built with vanilla Three.js, TypeScript, and GSAP
> 
> 🎯 Built with [GitHub Speckit](https://github.com/githubnext/speckit) - A systematic approach to feature development

## ✨ Features

### 🎨 3D Experience
- **Immersive Landing Scene** - Atmospheric particle effects with smooth 60 FPS animations
- **Camera-Based Navigation** - Seamless transitions between portfolio sections (500-800ms eased)
- **Interactive 3D Elements** - Hover, click, and drag interactions with raycasting
- **glTF Model Loading** - Optimized 3D asset pipeline with caching and retry logic

### ⚡ Performance & Quality
- **Constitution-Driven Budgets** - ≤150 draw calls (landing), ≤300 (typical), 60 FPS sustained
- **Resource Management** - Automatic disposal of geometries, materials, and textures
- **Performance Monitoring** - Real-time FPS tracking with budget validation (Shift+F)
- **Optimized Build** - Code splitting, tree shaking, and asset compression

### ♿ Accessibility
- **Reduced Motion Support** - Respects `prefers-reduced-motion` OS preference
- **Keyboard Navigation** - Full keyboard support (Tab, Enter, Space, Arrow keys)
- **WebGL Fallback** - Graceful degradation with helpful error messages
- **Desktop-Optimized** - Designed for screens 1280px+ (mobile warning included)

### 🛠️ Developer Experience
- **TypeScript Strict Mode** - Full type safety with ES2022 target
- **Hot Module Replacement** - Instant dev feedback with Vite
- **Lifecycle Architecture** - Scene interface with init/mount/update/dispose hooks
- **Systematic Planning** - Feature development with GitHub Speckit methodology

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Modern Browser** with WebGL 2.0 support ([Check compatibility](https://get.webgl.org/webgl2/))
- **Desktop Screen** 1280px+ width recommended

### Installation

```bash
# Clone the repository
git clone https://github.com/Hun-Bot2/hun-bot-three.git
cd hun-bot-three

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Troubleshooting Installation

<details>
<summary>If <code>npm</code> command not found (macOS/Homebrew users)</summary>

Add Homebrew's bin directory to your PATH:

```bash
# Temporary fix (current session only)
export PATH="/opt/homebrew/bin:$PATH"

# Permanent fix (add to ~/.zshrc or ~/.bashrc)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```
</details>

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR at http://localhost:5173 |
| `npm run build` | Build for production (type check + optimize) |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript compiler (no emit) |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting without changes |

## 🏗️ Project Structure

```
hun-bot-three/
├── src/
│   ├── core/              # Core systems
│   │   ├── AssetLoader.ts         # glTF/texture loading with caching
│   │   ├── InputHandler.ts        # Unified input (pointer, keyboard, scroll)
│   │   └── CameraController.ts    # Camera transitions with GSAP
│   ├── scenes/            # Scene implementations (future)
│   ├── objects/           # 3D objects (future)
│   ├── animations/        # Animation utilities (future)
│   ├── utils/             # Utilities
│   │   ├── PerformanceMonitor.ts  # FPS tracking & budget validation
│   │   ├── ResourceDisposer.ts    # Memory cleanup utilities
│   │   └── ReducedMotion.ts       # Accessibility support
│   ├── types/             # TypeScript definitions
│   │   └── Scene.ts               # Scene lifecycle interface
│   ├── content/           # Static data
│   │   └── portfolio-data.json    # Content & camera positions
│   ├── styles/            # Styles
│   │   └── global.css             # UI components & animations
│   └── main.ts            # Application entry point
├── public/
│   ├── models/            # .glb 3D models (optimized with Draco)
│   └── textures/          # Compressed textures (WebP/Basis)
├── specs/                 # Speckit documentation
│   └── three-hb-portfolio/
│       ├── spec.md        # Feature specification
│       ├── plan.md        # Implementation plan
│       ├── tasks.md       # Task breakdown
│       └── ...            # Research, data models, contracts
├── .specify/              # Speckit framework
│   ├── memory/            # Constitution & principles
│   ├── scripts/           # Workflow automation
│   └── templates/         # Document templates
├── index.html             # HTML entry point
├── vite.config.ts         # Vite build config
├── tsconfig.json          # TypeScript config (strict mode)
└── package.json           # Dependencies & scripts
```

## 🎯 Development Workflow

This project uses **[GitHub Speckit](https://github.com/githubnext/speckit)** for systematic feature development:

### Speckit Workflow
1. **Specify** → Define feature requirements in `specs/`
2. **Plan** → Break down into phases and tasks
3. **Implement** → Build incrementally with constitution principles
4. **Validate** → Ensure performance budgets and accessibility

### Daily Development
1. **Start server** → `npm run dev`
2. **Edit code** → Changes hot-reload automatically
3. **Check types** → `npm run typecheck` (or run on save in VS Code)
4. **Lint & format** → `npm run lint && npm run format`
5. **Build** → `npm run build` for production

### Constitution Principles
All code must adhere to these principles (see `.specify/memory/constitution.md`):
- **I. UX Consistency** - Dreamy, mysterious, smooth (no abrupt jumps)
- **II. Performance** - 60 FPS sustained, <3s load time
- **III. Stability** - Handle resize, visibility, context loss
- **IV. Architecture** - Lifecycle hooks (init/mount/update/dispose)
- **V. Accessibility** - Reduced motion, keyboard nav, fallbacks

## 🔍 Performance Monitoring

### Built-in Monitor
Press **`Shift + F`** in dev mode to toggle real-time stats:
- Current/Average/Median FPS
- Draw calls and triangle count
- Memory usage
- Frame time
- Constitution budget violations

### Performance Budgets
| Metric | Budget | Why |
|--------|--------|-----|
| **FPS** | 60 sustained | Smooth animations (16.7ms/frame) |
| **Draw Calls (Landing)** | ≤150 | Minimal scene complexity |
| **Draw Calls (Typical)** | ≤300 | Interactive scenes |
| **Texture Memory** | ≤64 MB | Mobile GPU compatibility |
| **Load Time** | <3s | First contentful paint |
| **Stutter** | <250ms | No frame drops |

### Profiling Tools
- **Vite DevTools** - Built-in HMR stats
- **Chrome DevTools** - Performance tab (record + analyze)
- **Three.js Inspector** - [Browser extension](https://github.com/threejs/three-devtools)

## 🎨 Content Management

Edit `src/content/portfolio-data.json` to update:
- Section titles and descriptions
- Camera positions for each section
- Project listings with thumbnails and models
- Contact information

## 🛠️ Asset Optimization

Optimize 3D models and textures before adding to `public/`:

```bash
# Install glTF-Transform CLI globally
npm install -g @gltf-transform/cli

# Optimize glTF models
gltf-transform optimize input.glb output.glb --compress draco

# Resize textures
gltf-transform resize input.glb output.glb --width 1024 --height 1024
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Manual Build

```bash
npm run build
# Output in dist/ directory
```

## ♿ Accessibility

- **Reduced Motion**: Respects `prefers-reduced-motion` OS preference
- **Keyboard Navigation**: Tab through interactive elements, Enter/Space to activate
- **WebGL Fallback**: Graceful error message if WebGL 2.0 not supported
- **Focus Indicators**: Visible focus states for all interactive elements

## Documentation

- **Feature Specification**: [specs/three-hb-portfolio/spec.md](specs/three-hb-portfolio/spec.md)
- **Implementation Plan**: [specs/three-hb-portfolio/plan.md](specs/three-hb-portfolio/plan.md)
- **Technical Decisions**: [specs/three-hb-portfolio/research.md](specs/three-hb-portfolio/research.md)
- **Data Model**: [specs/three-hb-portfolio/data-model.md](specs/three-hb-portfolio/data-model.md)
- **Task List**: [specs/three-hb-portfolio/tasks.md](specs/three-hb-portfolio/tasks.md)

## 🐛 Troubleshooting

### Black Screen
- Check browser console for errors
- Verify WebGL 2.0 support: Visit https://get.webgl.org/webgl2/
- Ensure 3D models exist in `public/models/`

### Low FPS
- Press `Shift + F` to show FPS overlay
- Check draw call count in performance monitor
- Reduce particle count or model complexity

### Memory Leaks
- Verify all scenes implement `dispose()` method
- Check Chrome DevTools Memory tab
- Ensure `ResourceDisposer` is called on scene transitions

### HMR Not Working
- Restart dev server
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check for TypeScript errors: `npm run typecheck`

## 🧪 Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **3D Engine** | Three.js | ^0.181.0 | WebGL rendering & 3D scene graph |
| **Animation** | GSAP | ^3.13.0 | Camera transitions & tweening |
| **Language** | TypeScript | ^5.9.3 | Type safety & tooling |
| **Build Tool** | Vite | ^7.1.12 | Dev server & bundling |
| **Module** | ES2022 | - | Modern JavaScript features |
| **Architecture** | Vanilla JS | - | No framework overhead |

### Why Vanilla Three.js (not React Three Fiber)?
- ✅ **Better Performance** - No React reconciler overhead (~2ms/frame)
- ✅ **Smaller Bundle** - Save ~100KB (no React/React-DOM/R3F)
- ✅ **Direct Control** - Access to low-level Three.js APIs
- ✅ **Simpler Stack** - Fewer abstractions to learn
- ✅ **Budget Alignment** - Easier to hit 60 FPS with strict budgets

For complex apps with many components, R3F is great. For a lean portfolio, vanilla is ideal.

## � Documentation

### Speckit Specs (Feature Development)
- **[Feature Spec](specs/three-hb-portfolio/spec.md)** - What we're building
- **[Implementation Plan](specs/three-hb-portfolio/plan.md)** - How we build it (6 phases)
- **[Task List](specs/three-hb-portfolio/tasks.md)** - 100 granular tasks with dependencies
- **[Research](specs/three-hb-portfolio/research.md)** - Technical decisions & tradeoffs
- **[Data Model](specs/three-hb-portfolio/data-model.md)** - Content structure
- **[API Contracts](specs/three-hb-portfolio/contracts/api-contracts.md)** - Public interfaces

### Constitution
- **[Constitution Principles](.specify/memory/constitution.md)** - Non-negotiable project values

## 🤝 Contributing

This is a personal portfolio project, but feel free to:
- 🐛 **Report bugs** via GitHub Issues
- 💡 **Suggest features** via GitHub Discussions
- 🍴 **Fork** and adapt for your own portfolio
- ⭐ **Star** if you find it useful!

## �📜 License

MIT License - Feel free to use this project as a template for your own portfolio!

## 🙏 Acknowledgments

- **[GitHub Speckit](https://github.com/githubnext/speckit)** - Systematic feature development methodology
- **[Three.js](https://threejs.org/)** - Amazing 3D library and documentation
- **[GSAP](https://greensock.com/gsap/)** - Industry-standard animation library
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool

---

**Built with ❤️ using GitHub Speckit**
