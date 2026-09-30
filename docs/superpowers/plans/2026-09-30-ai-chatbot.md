# Interactive AI Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an intelligent floating AI Chatbot widget at the bottom-right of KlikPDF to assist visitors with PDF tools, guide conversions, and navigate directly to tools.

**Architecture:** Client-side NLP knowledge engine (`chatbotEngine.js`) paired with a modern React floating widget component (`ChatbotWidget.jsx`) featuring suggestions chips, tool deep-links, and local storage persistence.

**Tech Stack:** React 18, Vite, Lucide React icons, Tailwind CSS.

## Global Constraints
- Support dark and light mode.
- Support Indonesian (`id`) and English (`en`).
- Smooth animation, floating sticky at bottom-right, responsive on mobile & desktop.

---

### Task 1: Create `chatbotEngine.js` Service

**Files:**
- Create: `frontend/src/services/chatbotEngine.js`

**Interfaces:**
- Produces: `getBotResponse(query, lang)` returning `{ text, toolId, toolName }`, `getSuggestionChips(lang)` returning array of string questions.

- [ ] **Step 1: Write `chatbotEngine.js` with comprehensive tool knowledge & intent matching**
- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/chatbotEngine.js
git commit -m "feat: implement chatbot knowledge engine"
```

---

### Task 2: Create `ChatbotWidget.jsx` Component

**Files:**
- Create: `frontend/src/components/ChatbotWidget.jsx`

**Interfaces:**
- Consumes: `useLanguage()`, `useTheme()`, `chatbotEngine.js`
- Produces: Floating action button with badge and expandable glassmorphic chat dialogue.

- [ ] **Step 1: Write `ChatbotWidget.jsx`**
- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ChatbotWidget.jsx
git commit -m "feat: create ChatbotWidget component"
```

---

### Task 3: Integrate `ChatbotWidget` in `App.jsx` & Verify Build

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Mount `ChatbotWidget` with `onSelectTool` prop in `App.jsx`**
- [ ] **Step 2: Verify build with `npm run build`**
- [ ] **Step 3: Commit and push to main**

```bash
git commit -m "feat: mount ChatbotWidget in App and deploy"
```
