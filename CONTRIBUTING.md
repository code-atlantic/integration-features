# Contributing to Integration Features Block

Thank you for considering contributing to the Integration Features Block! This document provides guidelines for development and contribution.

## Table of Contents
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Architecture Guidelines](#architecture-guidelines)

## Development Setup

### Prerequisites
- Node.js 18+ and npm 9+
- WordPress 6.0+ development environment
- Basic understanding of React and TypeScript
- Familiarity with WordPress Gutenberg block development

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/code-atlantic/integration-features-block.git
   cd integration-features-block
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development build:
   ```bash
   npm start
   ```

4. Create production build:
   ```bash
   npm run build
   ```

## Development Workflow

### Available Scripts

- `npm start` - Start development mode with watch
- `npm run build` - Create production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint:js` - Lint JavaScript/TypeScript files
- `npm run lint:css` - Lint SCSS files
- `npm run format` - Format code with Prettier

### Recommended Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** with `npm start` running for hot reload

3. **Test changes** in WordPress editor

4. **Run quality checks**:
   ```bash
   npm run type-check
   npm run lint:js
   npm run lint:css
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Commit changes** with descriptive message

7. **Push and create pull request**

## Code Standards

### TypeScript

- **Strict mode enabled**: All code must pass strict TypeScript checks
- **Explicit types**: Prefer explicit type annotations over inference for public APIs
- **No `any`**: Avoid `any` type; use `unknown` or proper types
- **Interface over type**: Use `interface` for object shapes, `type` for unions/intersections

Example:
```typescript
// ✅ GOOD
interface MyProps {
  label: string;
  tier: TierType;
}

export function MyComponent({ label, tier }: MyProps): JSX.Element {
  // ...
}

// ❌ BAD
export function MyComponent(props: any) {
  // ...
}
```

### React Patterns

#### Derived State Pattern
**Always use derived state with `useMemo` instead of `useEffect` + `setAttributes`**:

```typescript
// ✅ GOOD: Derived state
const hasDescription = useMemo(
  () => computeHasDescription(innerBlocks || []),
  [innerBlocks]
);

// ❌ BAD: useEffect feedback loop risk
useEffect(() => {
  setAttributes({ hasDescription: computeHasDescription(innerBlocks) });
}, [innerBlocks]);
```

#### Hooks
- Use `useMemo` for expensive computations
- Use `useSelect` for WordPress data store access
- Avoid `useEffect` for synchronizing state to attributes
- Keep hooks at top level (no conditional hooks)

### CSS/SCSS

- **BEM methodology**: Use Block-Element-Modifier naming
- **Prefix classes**: All classes start with `pm-` (Popup Maker)
- **Mobile-first**: Use `min-width` media queries
- **Accessibility**: Include focus states, high contrast mode, reduced motion

Example:
```scss
// ✅ GOOD
.pm-integration-feature {
  &__header {
    display: flex;
  }

  &--pro {
    background-color: var(--action);
  }
}

// ❌ BAD
.feature {
  .header {
    display: flex;
  }
}
```

### Naming Conventions

- **Files**: kebab-case (`integration-feature.tsx`)
- **Components**: PascalCase (`IntegrationFeature`)
- **Functions**: camelCase (`computeHasDescription`)
- **Constants**: UPPER_SNAKE_CASE (`TIER_CONFIG`)
- **Types/Interfaces**: PascalCase (`TierType`, `EditProps`)

### File Structure

```
src/integration-features/
├── block.json           # Block metadata and attributes
├── types.ts            # TypeScript type definitions
├── edit.tsx            # Editor component
├── save.tsx            # Frontend save component
├── style.scss          # Frontend + editor styles
├── editor.scss         # Editor-only styles
├── index.ts            # Block registration
└── lib/
    └── hasDescription.ts  # Shared utilities
```

## Testing

### Test Coverage Goals
- **Unit tests**: 70% coverage
- **Integration tests**: 15% coverage
- **Accessibility tests**: 10% coverage
- **E2E tests**: 5% coverage
- **Total target**: 82%+ coverage

### Test Categories

1. **Unit Tests**
   - Individual functions and utilities
   - Component rendering
   - State management

2. **Integration Tests**
   - Block registration
   - Attribute persistence
   - InnerBlocks integration
   - Toolbar interactions

3. **Accessibility Tests**
   - ARIA attributes
   - Keyboard navigation
   - Screen reader compatibility
   - Focus management

4. **E2E Tests**
   - Complete user workflows
   - Multi-block interactions
   - Save/load cycles

### Running Tests

```bash
# Run all tests (when implemented)
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- hasDescription.test.ts

# Run in watch mode
npm test -- --watch
```

## Pull Request Process

### Before Submitting

1. ✅ All tests pass
2. ✅ TypeScript type-check passes
3. ✅ Linting passes (JS and CSS)
4. ✅ Code follows project conventions
5. ✅ Commit messages are descriptive
6. ✅ Documentation updated if needed

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Checklist
- [ ] TypeScript passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint:js && npm run lint:css`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tested in WordPress editor
- [ ] Documentation updated
- [ ] Changelog updated
```

### Review Process

1. **Automated checks**: TypeScript, linting, build
2. **Code review**: At least one maintainer approval
3. **Testing**: Verify in WordPress environment
4. **Merge**: Squash and merge to main branch

## Architecture Guidelines

### ARCH-1: Derived State Pattern

**Never store computed values as block attributes.**

Computed values like `hasDescription` should be derived during render using `useMemo`:

```typescript
// ✅ CORRECT
const hasDescription = useMemo(
  () => computeHasDescription(innerBlocks || []),
  [innerBlocks]
);

// ❌ WRONG
const { hasDescription } = attributes;
```

**Rationale**:
- Prevents useEffect feedback loops
- Ensures single source of truth
- Eliminates race conditions
- Better performance

### REQ-1: Single Source of Truth

**All duplicate logic must be extracted to shared utilities.**

The `computeHasDescription` function is used by both Edit and Save components:

```typescript
// lib/hasDescription.ts
export function computeHasDescription(
  innerBlocks: WPBlock[] | null | undefined
): boolean {
  // Single implementation
}

// edit.tsx
import { computeHasDescription } from './lib/hasDescription';

// save.tsx
import { computeHasDescription } from './lib/hasDescription';
```

### Component Structure

**Edit Component** (`edit.tsx`):
- User interaction handling
- Toolbar controls
- Live preview
- Derived state computation
- InnerBlocks configuration

**Save Component** (`save.tsx`):
- Minimal logic
- Deterministic output
- Native HTML elements
- Same hasDescription computation as Edit

### State Management

- **Block attributes**: Only store user-editable data
- **Derived values**: Compute during render with `useMemo`
- **Editor-only state**: Use local state or attributes not in `block.json`
- **WordPress data**: Access via `useSelect` hook

### Accessibility Requirements

All UI elements must:
- Be keyboard accessible
- Have proper ARIA attributes
- Support screen readers
- Work in high contrast mode
- Respect reduced motion preferences

### Performance Optimization

- Use `useMemo` for expensive computations
- Minimize re-renders with proper dependencies
- Avoid inline function definitions in render
- Use CSS for animations (not JavaScript)

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features (backward compatible)
- **Patch** (0.0.1): Bug fixes (backward compatible)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Review existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the GPL-2.0-or-later license.
