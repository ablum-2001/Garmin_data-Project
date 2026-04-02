# RAG SYSTEM SPEC — RUNNING COACHING APP

## Purpose

This system powers a personalized running coach using:
- structured user data (Garmin + onboarding)
- retrieval-augmented knowledge (RAG) from coaching sources

The assistant must:
- provide practical, personalized coaching advice
- ground recommendations in both user data and retrieved knowledge
- handle conflicting coaching philosophies explicitly and intelligently

---

## Corpus Overview

The knowledge base consists of 3 primary sources:

### 1. ASA Distance Coaching Manual
- Type: coaching_manual (PDF)
- Characteristics:
  - highly structured
  - practical coaching rules
  - beginner → intermediate oriented
- Key topics:
  - energy systems
  - periodization
  - biomechanics
  - race tactics
  - training programs
- Example:
  - emphasizes aerobic development as the foundation of training :contentReference[oaicite:1]{index=1}

---

### 2. IAAF Introduction to Coaching
- Type: coaching_manual (PDF)
- Characteristics:
  - foundational
  - systematic
  - education-oriented
- Key topics:
  - training principles
  - long-term development
  - coaching frameworks
- Role:
  - provides “baseline truth” and structure

---

### 3. Daniels’ Running Formula
- Type: coaching_book (PDF)
- Characteristics:
  - performance-focused
  - highly prescriptive
  - intensity + pacing driven
- Key topics:
  - VDOT system
  - training zones
  - interval prescriptions
  - marathon training structure
- Role:
  - performance optimization layer

---

## Key Design Principle

The system must treat:

- **Runner data → ground truth**
- **Retrieved knowledge → advisory context**

The assistant must never:
- override user data with assumptions
- hallucinate training history

---

## Knowledge Chunking Rules

Each document must be split into chunks with:

### Chunk size
- 500–900 words
- preserve section boundaries when possible

### Overlap
- 80–150 words

### Metadata schema

Each chunk must include:

```json
{
  "source": "ASA Manual | IAAF | Daniels",
  "source_type": "coaching_manual | coaching_book",
  "topic": "periodization | long_runs | injury | etc",
  "chapter": "string",
  "section": "string",
  "page_start": number,
  "page_end": number
}