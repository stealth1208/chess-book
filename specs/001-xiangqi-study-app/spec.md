# 🎯 XIANGQI STUDY APP — FULL SPECIFICATION (PHASE 1)

---

# 1. 📌 PRODUCT OVERVIEW

## 1.1 Goal

Xây dựng web app học khai cuộc cờ tướng với khả năng:

- Lưu biến (variation)
- Tổ chức theo thư viện (folder tree)
- Replay nước đi
- Practice (đoán nước tiếp theo)

## 1.2 Platform

- Web app (PWA-ready)
- Chạy trên:
  - Desktop browser
  - Mobile browser

- Có thể upgrade native sau (Capacitor)

---

# 2. 🧱 TECH STACK

## 2.1 Frontend

- Framework: Next.js (App Router)
- UI: Mantine
- State:
  - Zustand (UI + game state)
  - React Query (server data)

- PWA: next-pwa

---

## 2.2 Backend

- Supabase:
  - Auth
  - Database (PostgreSQL)

---

## 2.3 Optional (future)

- AI:
  - Mini AI (heuristic)
  - Pikafish (server)

---

# 3. 🧠 CORE CONCEPT

## 3.1 Architecture

```text
User
→ UI (React)
→ State (Zustand)
→ Engine (board logic)
→ Data (Supabase / Local)
```

---

## 3.2 Separation Rules

- Engine: pure logic, không phụ thuộc UI
- UI: chỉ render state
- Data: normalized

---

# 4. ♟️ BOARD ENGINE

## 4.1 Board

- Grid: 9 x 10
- Coordinate:
  - x: 0 → 8 (a → i)
  - y: 0 → 9

---

## 4.2 Piece

```ts
type Piece = {
  type: "king" | "advisor" | "elephant" | "horse" | "rook" | "cannon" | "pawn";
  color: "red" | "black";
};
```

---

## 4.3 Move

```ts
type Move = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  piece: Piece;
};
```

---

## 4.4 Required Engine Features (Phase 1)

- applyMove
- validateMove:
  - rook
  - horse
  - cannon
  - pawn

- undo / redo
- jump to move

---

## 4.5 Not required (Phase 1)

- checkmate
- AI search
- optimization

---

# 5. 📜 DATA FORMAT

## 5.1 Variation

```ts
type Variation = {
  id: string;
  name: string;
  initialFen: string;
  moves: string[]; // ["b0c2", "h7e7"]
  folderId: string | null;
};
```

---

## 5.2 Move format

```text
b0c2 = from b0 → to c2
```

---

## 5.3 FEN (Xiangqi)

```text
rnbakabnr/9/1c5c1/.../RNBAKABNR w
```

---

## 5.4 Rule

- Store:
  - FEN + moves[]

- Display:
  - formatMove()

---

# 6. 🌳 LIBRARY (CORE FEATURE)

## 6.1 Folder

```ts
type Folder = {
  id: string;
  name: string;
  parentId: string | null;
};
```

---

## 6.2 Structure

```text
Folder
 ├── Variation
 ├── Variation
 └── Folder
```

---

## 6.3 Features

- Create folder
- Rename folder
- Delete folder

---

## 6.4 Tree UI

- Use Mantine Tree
- No drag & drop (Phase 1)

---

## 6.5 Flow

```text
Click folder
→ load variations
→ click variation
→ load board
```

---

# 7. 📚 VARIATION MANAGEMENT

## 7.1 Create variation

Flow:

```text
User đi cờ
→ hệ thống lưu moves[]
→ save variation
```

---

## 7.2 Load variation

```ts
board = parseFEN(initialFen);

for (move of moves) {
  applyMove(board, move);
}
```

---

## 7.3 Features

- Save
- Rename
- Delete
- Load

---

# 8. ♟️ ANALYSIS TAB

## 8.1 Layout

- Board (center)
- Move list (right)

---

## 8.2 Features

- Drag piece
- Validate move
- Apply move
- Undo / redo
- Jump to move
- Autoplay

---

## 8.3 Move list

```ts
moves: Move[]
currentIndex: number
```

---

## 8.4 Behavior

- Click move → jump
- Highlight current move

---

# 9. 🧠 PRACTICE MODE

## 9.1 Logic

```ts
type PracticeState = {
  moves: string[];
  currentIndex: number;
};
```

---

## 9.2 Flow

```text
Load variation
→ user move
→ compare với moves[currentIndex]
→ đúng → next
→ sai → reset
```

---

## 9.3 Scoring

- Correct / Wrong
- No AI evaluation (Phase 1)

---

# 10. 🧩 MINDMAP (PHASE 1)

## Scope

- View only
- Không edit

---

## Data

- Derived từ variation list

---

## Scale

- <100 node

---

# 11. 🔐 AUTH & STORAGE

## 11.1 Mode

- Guest:
  - lưu local

- User:
  - sync server

- Data migration:
  - Khi guest đăng nhập/đăng ký lần đầu, toàn bộ dữ liệu local (folders + variations) tự động được migrate lên server account — không cần xác nhận từ user.

---

## 11.2 Supabase schema

```sql
folders
- id
- name
- parent_id
- user_id

variations
- id
- name
- folder_id
- initial_fen
- moves (jsonb)
- user_id
```

---

# 12. 🌐 PWA REQUIREMENTS

- Installable
- Offline basic support
- Responsive UI

---

# 13. 🎨 UI RULES

- Mantine only
- Primary color: đỏ pastel
- Layout fixed
- Board responsive

---

# 14. ⚠️ NON-FUNCTIONAL REQUIREMENTS

- Performance:
  - <100 variations load full

- Maintainability:
  - engine tách riêng

- Scalability:
  - support server sync

---

# 15. 🚀 DEVELOPMENT PHASE

## Phase 1 (MVP)

- Board UI
- Move engine basic
- Variation save/load
- Library tree

---

## Phase 2

- Practice mode
- Mindmap

---

## Phase 3

- AI (mini)
- Optional Pikafish

---

# 16. 🔥 FINAL PRINCIPLES

1. Engine độc lập UI
2. Store = structured data (FEN + moves)
3. Tree = folder, không phải variation logic
4. Không over-engineer

---

## Clarifications

### Session 2026-03-31

- Q: When a guest user signs in, what happens to their local data? → A: Auto-migrate all local data to the user's account on sign-in (no prompt required).

---

# ✅ END OF SPEC
