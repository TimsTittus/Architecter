# 🏗️ Architect.Ai — Recursive Logic Engine

**Architect.Ai** is a high-performance, AI-driven development environment that transforms raw, unstructured requirements into production-ready JSON blueprints. It employs a recursive clarifying loop and multimodal vision analysis to extract deep logical constraints and structural dependencies from minimal human input.

---

## 🚀 Key Features (v1.1.0)

- **Multimodal Context Injection**: High-fidelity vision engine that analyzes uploaded wireframes, flowcharts, and UI notes (PNG/JPG/WEBP) alongside text prompts.
- **Logic Flow Toggle**: Integrated "English/JSON" switcher to toggle between production-ready code and human-readable architectural overviews.
- **Recursive Clarification Loop**: When logic gaps are detected, the AI generates context-aware questions (text/select/boolean) to iteratively refine the output.
- **Visual Token Extraction**: Automated detection of UI components, logic flows, and data entities from visual context, displayed as premium side-tags.
- **Dual-Model Fallback Engine**: Primary logic and vision handled by `gemini-2.5-flash` with seamless failover.
- **Live Blueprint Sync**: Real-time syntax-highlighted JSON preview that updates as you resolve architectural ambiguities.
- **Architectural Metrics**: Integrated Confidence Meter tracking context completeness and an animated Stepper for logic flow visualization.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime**: [Node.js](https://nodejs.org/)
- **AI Engine**: [Google Gemini SDK](https://ai.google.dev/) (`@google/genai`) - **Vision Enabled**
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with Persistence)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [React Dropzone](https://react-dropzone.js.org/)

---

## 📂 Project Structure

```bash
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts           # Legacy Text-only Logic Engine
│   │   └── analyze-multimodal/route.ts # Vision-aware Logic Engine
│   ├── globals.css                     # Grayscale Design System
│   └── page.tsx                        # Multimodal Entry Point
├── components/
│   ├── ImageDropzone.tsx               # Drag-and-drop Image Handler
│   ├── SmartContextUploader.tsx        # Split-pane Multimodal Input
│   ├── ConfidenceMeter.tsx             # Precision tracking
│   ├── ContextInput.tsx                # Legacy entry point
│   ├── JsonPreview.tsx                 # High-fidelity code output
│   ├── RefinementEngine.tsx            # Recursive handler (with Visual Tokens)
│   └── Stepper.tsx                     # Animated logic sequence
├── hooks/
│   └── useInitialAnalysis.ts           # Orchestrates multimodal analysis
├── lib/
│   ├── gemini.ts                       # AI Configuration (Vision-Ready)
│   └── utils.ts                        # UI Helpers
└── store/
    └── useArchitectStore.ts            # Multimodal Logic Store
```

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Bun** or **NPM**
- **Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/apikey).

### 2. Environment Setup
Create a `.env.local` in the root directory:
```env
GEMINI_API_KEY=your_key_here
```

### 3. Installation & Local Development
```bash
# Install dependencies
bun install

# Start development server
bun dev
```

### 4. Build for Production
```bash
bun run build
```

---
