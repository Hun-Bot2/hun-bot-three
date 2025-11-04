# Dreamy Three.js Portfolio

> An immersive 3D portfolio experience built with Three.js, TypeScript, and GSAP

## ✨ Features

- **Immersive 3D Landing Scene** with atmospheric particle effects and smooth 60 FPS animations
- **Camera-Based Navigation** between portfolio sections with eased transitions (500-800ms)
- **Interactive 3D Elements** with hover, click, and drag interactions
- **Performance Optimized** with budgets: ≤150 draw calls (landing), ≤300 (typical), 60 FPS sustained
- **Accessibility First** with reduced motion support, keyboard navigation, and WebGL fallback
- **Desktop-Focused** experience optimized for screens 1280px+

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (You have v23.11.0 ✅)
- Modern desktop browser with WebGL 2.0 support
- Minimum screen width: 1280px

### Installation

**If npm is not in your PATH**, add Homebrew's node to your shell:

```bash
# Temporary (current session only)
export PATH="/opt/homebrew/bin:$PATH"

# Permanent (add to ~/.zshrc)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Install dependencies:**

```bash
cd /Users/jeonghun/hun-bot-three

# Install all dependencies at once
npm install

# Or install step-by-step if needed:
# npm install three@^0.160.0 vite@^5.0.0 typescript@^5.3.0 gsap@^3.12.0
# npm install --save-dev @types/three@^0.160.0 @types/node@^20.0.0
```

**Run development server:**

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 📦 Available Scripts

- `npm run dev` - Start Vite development server with HMR
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run preview` - Preview production build locally
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🏗️ Project Structure

```
hun-bot-three/
├── src/
│   ├── core/              # Core infrastructure (SceneManager, AssetLoader, etc.)
│   ├── scenes/            # Scene implementations (Landing, About, Projects, Contact)
│   ├── objects/           # 3D objects (InteractiveObject, AmbientParticles, etc.)
│   ├── animations/        # Animation utilities (CameraTransition, ObjectAnimator)
│   ├── utils/             # Helper utilities (PerformanceMonitor, ResourceDisposer)
│   ├── content/           # Static content (portfolio-data.json)
│   ├── styles/            # CSS files (global.css)
│   ├── types/             # TypeScript type definitions
│   └── main.ts            # Application entry point
├── public/
│   ├── models/            # glTF/GLB 3D models
│   └── textures/          # Compressed texture files
├── specs/                 # Feature specifications and planning docs
├── index.html             # HTML entry point
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 🎯 Development Workflow

1. **Start dev server**: `npm run dev`
2. **Make changes**: Edit files in `src/`
3. **Hot Module Replacement (HMR)**: Changes automatically reload
4. **Type checking**: `npm run typecheck`
5. **Linting**: `npm run lint` before committing
6. **Build**: `npm run build` for production

## 🔍 Performance Monitoring

- **Toggle FPS Overlay**: Press `Shift + F` in development mode
- **Chrome DevTools**: Use Performance tab for detailed profiling
- **Constitution Budgets**:
  - Landing scene: ≤150 draw calls
  - Typical scenes: ≤300 draw calls
  - Texture memory: ≤64 MB
  - Target: 60 FPS sustained, <3s load time

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

## 📜 License

MIT License - Feel free to use this project as a template for your own portfolio!

## 🙏 Acknowledgments

Built with the speckit workflow for systematic feature development.
