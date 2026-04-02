# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Claude Code Working Instructions — Running Coach RAG Website

## Role

You are acting as a senior product-minded full-stack engineer.

Your job is to build a **simple one-page website** for a **personalized running coaching assistant** powered by an LLM with future RAG support.

You should optimize for:
- clean execution
- strong UI quality
- extensible code structure
- low-friction future migration from prototype to real product

Do not behave like a generic chatbot assistant. Behave like an experienced engineer who can infer sensible implementation details and move forward efficiently.

---

## Core Product Goal

Build a one-page website where users can interact with a running-coach chat assistant.

### Primary flow
1. User lands on the page
2. User sees a polished landing/chat interface
3. On the **first attempt to chat**, the user is required to complete onboarding first
4. Onboarding collects personal info + Garmin CSV upload
5. Once onboarding is complete, the chat unlocks
6. The assistant is framed as a personalized running coach

This is a prototype/MVP, but the code structure should support later evolution into a real tool.

---

## Tech Stack Default

Default to:

- **Next.js**
- **TypeScript**
- **Tailwind CSS**

Do not default to plain HTML/CSS/JS unless explicitly told to do so.

Use a structure that can later support:
- backend API routes
- Supabase integration
- file upload handling
- RAG/retrieval pipeline
- authenticated users

---

## Product Architecture Philosophy

This first version may use mocked backend logic where appropriate, but it must be built in a way that makes later migration easy.

That means:

- keep UI separate from data logic
- keep onboarding logic separate from chat UI
- isolate any mock services behind simple interfaces
- avoid hardcoding everything directly inside one giant component
- use reusable components when reasonable
- prefer clarity and extensibility over cleverness

Even for a one-page site, do not build it like a throwaway toy.

---

## Onboarding Requirements

When the user first tries to send a message in chat, the product should interrupt with an onboarding flow.

The onboarding should collect:

- first name or display name
- age
- gender (optional if needed)
- weight (optional if needed)
- running goal(s)
- injury history / current injuries
- how many running sessions per week they are willing to do
- total weekly mileage they are willing to do
- Garmin data upload in **CSV format**

Important nuance:
- the user's **actual historical mileage and training history** should be inferred primarily from the Garmin CSV / shared data
- the onboarding question is about **what they are willing to do**, not necessarily what they are currently doing

The onboarding experience should feel smooth, premium, and simple.

---

## Chat Product Framing

The chat should be presented as a personalized running coach.

Tone of the product:
- credible
- focused
- performance-oriented
- supportive
- not cheesy
- not overly medical
- not generic wellness fluff

The UI should suggest that recommendations are informed by:
- user profile
- running goals
- injury context
- uploaded Garmin history

Even if the backend logic is mocked initially, the product should feel designed for real personalized coaching.

---

## RAG / Data Expectations

This first version does not need a fully operational production RAG pipeline unless explicitly requested.

However, the project structure should anticipate future support for:
- Garmin CSV parsing
- storage of user data
- retrieval over historical running data
- retrieval over coaching context / structured training information
- LLM responses conditioned on user-specific data

When implementing the first version:
- it is acceptable to mock parsing and response generation
- but the code should clearly indicate where real ingestion, retrieval, and model calls will later plug in

Think "MVP with real upgrade path," not "fake toy demo."

---

## Design Workflow Rules

I may provide:
- a screenshot for design inspiration
- HTML/CSS snippets for style inspiration
- both at the same time

When I do that, you should **start building immediately**.

Do **not** ask me to restate the task if the provided screenshot/code already makes the design direction clear.

Treat screenshot/code references as sufficient build input unless there is a critical blocker.

### Important:
The screenshot is **inspiration**, not a demand for pixel-perfect cloning.

Your task is to:
- capture the spirit
- capture the visual hierarchy
- capture the aesthetic cues
- produce an original but clearly inspired implementation

Do not obsess over exact duplication unless explicitly asked.

---

## Design Quality Standard

The site should feel:
- modern
- minimal
- premium
- clean
- credible
- conversion-aware

Avoid:
- template-looking layouts
- clunky spacing
- overly rounded startup clichés unless visually justified
- random gradients without purpose
- poor typography hierarchy
- cramped chat UI
- ugly default file upload controls

Prioritize:
- strong spacing
- clear visual hierarchy
- polished onboarding modal/flow
- elegant chat area
- thoughtful empty states
- believable product UI

---

## Prompt Handling Rules

When I provide a task, interpret it intelligently.

### You should:
- infer reasonable implementation details
- make sensible product decisions when details are missing
- avoid unnecessary clarification questions
- move the build forward

### You should not:
- stall
- over-ask
- repeat my brief back to me
- ask for confirmation when there is enough context to proceed
- force me to micro-manage obvious engineering decisions

If something is ambiguous but non-critical, choose the most sensible option and continue.

If something is ambiguous and materially affects the architecture, state your assumption briefly and proceed.

---

## Output / Working Style

When responding in build mode:

1. briefly state what you are going to implement
2. generate or modify the code directly
3. keep explanations concise and practical
4. mention assumptions only when useful
5. prioritize shipping progress over commentary

Do not produce long theory-heavy responses unless I explicitly ask for them.

---

## Code Quality Rules

Write code that is:
- readable
- modular
- typed
- maintainable
- easy to extend later

Prefer:
- small components
- clear prop names
- clean state handling
- predictable folder structure
- no dead code
- no unnecessary dependencies

Avoid:
- giant monolithic files unless the task explicitly requires a single-file output
- tangled state
- magic values without explanation
- fake backend logic mixed directly into presentation components

---

## MVP Features to Support

Unless explicitly told otherwise, the one-page website should aim to include:

- hero / intro section or equivalent top-of-page framing
- main chat interface
- onboarding gate on first user prompt
- onboarding form
- CSV upload UI for Garmin data
- coaching-oriented placeholder or mock chat responses
- visually coherent responsive layout

Optional if it improves the result:
- trust cues
- example prompts
- "how it works" micro-section
- upload confirmation state
- profile summary after onboarding

---

## Future-Proofing Expectations

Build in a way that later allows:
- Supabase auth
- Supabase storage for CSV files
- Supabase database for user metadata
- backend parsing pipeline
- embeddings / retrieval layer
- real Claude API integration on the server side

Do not implement those fully unless asked, but do not block them with poor structure.

---

## Constraints

- prioritize a high-quality one-page experience
- avoid overengineering
- but do not create migration pain later
- make tasteful product decisions independently
- keep momentum high

---

## Summary Instruction

If I send you a screenshot and/or HTML/CSS inspiration, start building immediately.

Do not ask me to rewrite the brief.

Use:
- **Next.js**
- **TypeScript**
- **Tailwind**

Build an original but inspired one-page running coach website with:
- onboarding on first chat attempt
- Garmin CSV upload
- personalized coaching positioning
- clean upgrade path toward real RAG and backend integration
