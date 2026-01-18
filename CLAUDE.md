# CLAUDE.md - Integration Features Plugin

WordPress Gutenberg blocks for displaying integration features with tier badges, accordion descriptions, and group organization.

## Project Structure

- `src/integration-feature/` - Individual feature item block
- `src/integration-features-group/` - Group container with accordion functionality
- `src/section-heading/` - Section headers with optional "View All" links
- `src/category-integrations/` - Dynamic taxonomy display block (server-side rendered)

## Build Commands

```bash
npm run build      # Production build
npm run start      # Development watch mode
npm run lint:js    # Lint JavaScript/TypeScript
```

## Release Workflow

1. Update version in `integration-features.php`
2. Add changelog entry in `CHANGELOG.md`
3. Commit changes
4. Create and push version tag: `git tag X.Y.Z && git push origin main --tags`
5. GitHub Actions automatically creates release with zip asset

## Updating Plugin on wppopupmaker.com

Use the `wppm-update` script:
```bash
~/dotfiles/bin/wppm-update integration-features
```

This handles Git Updater cache, Redis object cache, and WordPress transients.

## SSH Remote Command Pattern

**Working pattern (piped input):**
```bash
echo 'cd wordpress && wp plugin list' | sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no user@host bash
```

**Failing patterns (avoid these):**
```bash
# -tt flag causes "Permission denied" in non-interactive contexts
sshpass -p "$PASS" ssh -tt user@host "command"

# -e flag with SSHPASS env var also fails
SSHPASS="$PASS" sshpass -e ssh user@host "command"
```

Key insight: Non-interactive SSH commands with sshpass work reliably when piping the command into bash, rather than passing as an argument with `-tt` pseudo-terminal allocation.

## Block Development Notes

- All blocks use WordPress Interactivity API for frontend behavior
- `category-integrations` uses server-side rendering via `render.php` for SEO
- Styles should match across blocks - use `integration-features-group` as reference
- BEM naming convention: `.pm-{block-name}__{element}`
