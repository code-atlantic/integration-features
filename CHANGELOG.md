# Changelog

All notable changes to this project will be documented in this file.

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
