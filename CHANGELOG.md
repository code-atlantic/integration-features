# Changelog

All notable changes to the Integration Features Block will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-16

### Added
- Initial release of Integration Feature block
- Tier badge system (FREE, PRO, PRO+)
- Optional accordion functionality with native `<details>/<summary>` elements
- Icon style toggle (chevron ▼/▲ or plus-minus +/−)
- FREE badge visibility control (hidden by default)
- CSS variable theming support (`--action` for PRO, `--secondary` for PRO+)
- Derived state pattern for `hasDescription` computation (no useEffect feedback loops)
- Comprehensive TypeScript implementation with strict type checking
- BEM CSS methodology for styles
- Full accessibility support (ARIA attributes, keyboard navigation, screen reader support)
- RTL (right-to-left) language support
- Print-friendly styles
- High contrast mode support
- Reduced motion support for accessibility

### Technical Details
- **TypeScript 5.3** with strict mode enabled
- **WordPress Block API v3** for modern Gutenberg integration
- **React hooks** for state management (`useMemo`, `useSelect`)
- **InnerBlocks** support for rich description content
- **RichText** for editable feature labels
- **BlockControls** toolbar integration for tier and icon style selection

### Architecture Decisions
- **ARCH-1**: Derived state pattern using `useMemo` instead of `useEffect` for `hasDescription`
- **REQ-1**: Shared utility function `computeHasDescription()` as single source of truth
- **Conditional rendering**: `<details>` with description, `<div>` without description
- **Save output determinism**: `hasDescription` computed from actual `InnerBlocks` children

[1.0.0]: https://github.com/code-atlantic/integration-features-block/releases/tag/v1.0.0
