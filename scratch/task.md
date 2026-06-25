- [x] **Database Updates**
  - [x] Update `runCompiler` in `DataUploader.tsx` to save previous state of mapped projects/clients before overwriting.
  - [x] Write the `import_logs` document on successful compilation containing mappings and previous state.

- [x] **Data Compiler (Drag & Drop)**
  - [x] Wrap the `DataUploader` file input with a Drag and Drop area.
  - [x] Add state for `isDragging`.
  - [x] Update styling so the box border dashes and highlights when dragging files over.

- [ ] **Data Compiler (Audit Log)**
  - [ ] Fetch recent `import_logs` on component mount in `DataUploader`.
  - [ ] Render a "Recent Uploads" table.
  - [ ] Build a "View Details" Modal that shows all mappings for a specific upload log.
  - [ ] Add checkboxes for multi-select inside the modal.
  - [ ] Add "Undo Selected" and "Undo All" buttons inside the modal.
  - [ ] Implement `undoMappings` logic (revert metrics, create `pending_approval` alias).

- [ ] **Data Intake Pipeline (Bulk Actions)**
  - [ ] Add multi-select checkboxes to the alias cards.
  - [ ] Add a "Dismiss Selected" button that rejects the selected aliases.
