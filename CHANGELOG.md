# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-01-18

### Added
- New `popup-maker/category-integrations` block for dynamic taxonomy display
  - Server-side rendering via render.php for SEO and performance
  - Category selector dropdown fetches from `integration_category` taxonomy
  - Auto-pulls heading from category name, subheading from description
  - Lists all integrations with links to their individual pages
  - Three display modes: expanded, collapsed, and tease
  - Configurable tease count with "View all" as link or inline expand
  - Auto-excludes current integration on single integration pages
  - Hardcoded icon mapping per category slug (dashicons)
  - Full color customization (icon, header, heading, subheading)
  - Heading override and tag selection (h2/h3)
  - WordPress Interactivity API for frontend behavior
  - Keyboard accessibility (Enter/Space to toggle collapsed mode)
  - Responsive design with mobile breakpoints
  - Print styles and accessibility media queries (high contrast, reduced motion)

## [0.3.0] - 2024-12-18

### Added
- GitHub Updater support for automatic plugin updates via GitHub releases
- GitHub Actions release workflow for automated builds
- SEO-focused tests for no-JS accessibility compliance

### Changed
- **BREAKING**: Features container no longer includes `is-hidden` class in save output
  - Content now defaults to visible for SEO (Googlebot) and no-JS users
  - JavaScript adds `is-hidden` class on init when `groupCollapsed` is true
  - Progressive enhancement pattern: works without JS, enhances with JS
  - **Note**: Existing saved blocks will update to new behavior when re-saved in editor

### Fixed
- SEO issue where collapsed groups were hidden from search engine crawlers
- Accessibility issue where no-JS users couldn't see collapsed group content

## [0.2.4] - 2024-12-15

### Changed
- `pm-toc-heading` class on section-heading now only applied when View All link is present
- Removed `pm-toc-heading` class from integration-features-group (not applicable without links)

### Fixed
- Updated deprecation handlers to properly migrate all block format variations
- Fixed incorrect SVG markup in v1 deprecation to match actual saved content

## [0.2.3] - 2024-12-15

### Added
- Block deprecation handlers for seamless migration of existing content
  - `popup-maker/section-heading`: Migrates from inline SVG icons to dashicons, adds pm-toc-heading class
  - `popup-maker/integration-features-group`: Adds pm-toc-heading class to existing headings

### Fixed
- Block validation errors when editing pages with older block markup

## [0.2.2] - 2024-12-15

### Changed
- Section heading link icons now use WordPress dashicons instead of inline SVGs
  - `dashicons-arrow-right-alt` for internal links
  - `dashicons-external` for external links
- Updated link font-size to 1.75rem default

## [0.2.1] - 2024-12-15

### Added
- Shared `pm-toc-heading` class on all section headings for Table of Contents extraction
  - Applied to `popup-maker/section-heading` title
  - Applied to `popup-maker/integration-features-group` heading
  - Enables consistent targeting with `.pm-toc-heading` selector

## [0.2.0] - 2024-12-14

### Added
- New `popup-maker/section-heading` block for integration page section headers
  - Heading with optional "View All" link on the right side
  - Smart icon detection: arrow-right for internal links, external icon for external URLs
  - H2/H3 heading tag selection
  - Optional subtitle/description
  - Color controls for heading, subtitle, and link
  - WordPress LinkControl for link picker integration
- wp-env configuration for local development (port 8282)

## [0.1.0] - 2024-11-17

### Added
- Initial release
- `popup-maker/integration-feature` block for individual feature items
- `popup-maker/integration-features-group` block for grouping features
- Tier badge support (Free, Pro, Pro+)
- Accordion functionality with animations
- Dashicon integration for feature icons
- Feature count display option
