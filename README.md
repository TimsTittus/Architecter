# 🏗️ Architect.Ai — Recursive Logic Engine

**Architect.Ai** is a high-performance, AI-driven development environment that transforms raw, unstructured requirements into production-ready JSON blueprints. It employs a recursive clarifying loop to extract deep logical constraints and structural dependencies from minimal human input.

---

## Core Features

- **Recursive Clarification Loop**: When logic gaps are detected, the AI generates context-aware questions (text/select/boolean) to iteratively refine the output.
- **Dual-Model Fallback Engine**: Primary logic handled by `gemini-2.5-flash` with seamless failover to `gemini-2.0-flash`.
- **Live Blueprint Sync**: Real-time syntax-highlighted JSON preview that updates as you resolve architectural ambiguities.
- **Architectural Metrics**: Integrated Confidence Meter tracking context completeness and an animated Stepper for logic flow visualization.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime**: [Node.js](https://nodejs.org/) (for stable AI SDK compatibility)
- **AI Engine**: [Google Gemini SDK](https://ai.google.dev/) (`@google/genai`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Customized Monochromatic Suite)

---

## 📂 Project Structure

```bash
src/
├── app/
│   ├── api/generate/route.ts  # Recursive AI Logic Engine
│   ├── globals.css            # Grayscale Design System & Glassmorphism
│   ├── layout.tsx             # Root Provider & Monochrome Toaster
│   └── page.tsx               # Centered Dashboard Layout
├── components/
│   ├── ConfidenceMeter.tsx    # Precision tracking (Grayscale)
│   ├── ContextInput.tsx       # Entry point for raw requirements
│   ├── JsonPreview.tsx        # High-fidelity code output
│   ├── RefinementEngine.tsx   # Recursive question handler
│   └── Stepper.tsx            # Animated logic sequence
├── lib/
│   ├── gemini.ts              # Centralized AI Configuration
│   └── utils.ts               # Tailwinds merge & class utilities
└── store/
    └── useArchitectStore.ts   # Persistant session & logic state
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
