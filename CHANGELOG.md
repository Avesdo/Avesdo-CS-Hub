# Changelog

All notable changes to this project will be documented in this file. The format is based on Keep a Changelog.

## [Unreleased]

### Fixed
- Fixed calendar popup rendering size to prevent date grid overflow/cropping horizontally. Redesigned it to be significantly more compact (reduced popover width from 320px to 270px, inner calendar width to 240px, cell height to 28px) while maintaining full functionality.
- Heightened inline calendar containers to prevent vertical overflow and clipping inside popovers.
- Fixed date picker position logic to dynamically detect scroll parents and open upwards automatically when space below is restricted.
- Resolved z-index layering conflicts by introducing a dynamic ancestor elevation script (`.popover-elevated-ancestor`) and updating SPA page containers to `overflow-visible`. This prevents the global header, sticky table headers, footers, search boxes, or KPI tiles from overlapping or clipping dropdowns and popovers.

### Added
- Created `.geminirules` and `.clinerules` config files containing custom agent rules (multi-agent usage, testing before updates, workspace cleanup, preserving functionality, providing testing guides, and maintaining this changelog).
