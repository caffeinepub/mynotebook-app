# MyNotebook App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User authentication via Internet Identity
- Notes management: create, edit, delete, search, pin notes
- Each note has: title, description/content, created timestamp, updated timestamp, pinned status, image references
- Image upload: select from gallery or capture via camera, stored in blob storage, image URL embedded in note
- Upload progress indicator
- Dark/Light mode toggle
- Floating Action Button (FAB) for adding new notes
- Offline/network error detection with user-friendly error message
- Search notes by title or content

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
1. Note data type: `{ id: Text; title: Text; content: Text; createdAt: Int; updatedAt: Int; pinned: Bool; imageUrls: [Text] }`
2. CRUD operations: createNote, updateNote, deleteNote, getNotes, getNote
3. Pin/unpin note: togglePin
4. Search notes: searchNotes(query: Text)
5. Authorization: each user can only access their own notes
6. Blob storage integration for image uploads

### Frontend (React + TypeScript)
1. Login screen with Internet Identity button
2. Notes list view: pinned notes at top, search bar, FAB button
3. Note card: title, preview, date, pin indicator, image thumbnail
4. Create/Edit note modal/page: title input, content textarea, image upload section
5. Image upload: file picker + camera capture, progress bar, preview
6. Dark/Light mode toggle (persisted in localStorage)
7. Network error banner when offline
8. Responsive Material-style design
