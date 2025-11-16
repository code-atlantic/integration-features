# API Documentation

Developer reference for the Integration Features Block.

## Table of Contents
- [Block Attributes](#block-attributes)
- [TypeScript Types](#typescript-types)
- [Utility Functions](#utility-functions)
- [CSS Custom Properties](#css-custom-properties)
- [Block Registration](#block-registration)
- [Extending the Block](#extending-the-block)

## Block Attributes

The block uses the following attributes defined in `block.json`:

### `tier`
- **Type**: `string`
- **Enum**: `['free', 'pro', 'proplus']`
- **Default**: `'free'`
- **Description**: Determines which tier badge is displayed

### `label`
- **Type**: `string`
- **Source**: `html` from `.pm-integration-feature__label`
- **Default**: `''`
- **Description**: The feature name/label displayed in the header

### `isOpen`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Controls accordion open state in editor (editor-only, not saved to post content)

### `iconStyle`
- **Type**: `string`
- **Enum**: `['chevron', 'plus-minus']`
- **Default**: `'chevron'`
- **Description**: Icon style for accordion indicator
  - `chevron`: Uses ▼/▲ characters
  - `plus-minus`: Uses +/− characters

### `showFreeBadge`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Controls FREE tier badge visibility (hidden by default)

## TypeScript Types

### `TierType`
```typescript
type TierType = 'free' | 'pro' | 'proplus';
```

### `IconStyleType`
```typescript
type IconStyleType = 'chevron' | 'plus-minus';
```

### `IntegrationFeatureAttributes`
```typescript
interface IntegrationFeatureAttributes {
  tier: TierType;
  label: string;
  isOpen: boolean;
  iconStyle: IconStyleType;
  showFreeBadge: boolean;
}
```

### `TierConfig`
```typescript
interface TierConfig {
  label: string;      // Display label (e.g., 'PRO')
  className: string;  // CSS class for styling
  icon: string;       // Dashicon name for toolbar
}
```

### `WPBlock`
```typescript
interface WPBlock {
  name: string;
  clientId: string;
  attributes: Record<string, any>;
  innerBlocks?: WPBlock[];
}
```

### `EditProps`
```typescript
interface EditProps {
  attributes: IntegrationFeatureAttributes;
  setAttributes: (attributes: Partial<IntegrationFeatureAttributes>) => void;
  clientId: string;
}
```

### `SaveProps`
```typescript
interface SaveProps {
  attributes: IntegrationFeatureAttributes;
}
```

## Utility Functions

### `computeHasDescription(innerBlocks)`

**Location**: `src/integration-features/lib/hasDescription.ts`

Determines if inner blocks contain meaningful description content. This is the **single source of truth** for `hasDescription` computation, used by both Edit and Save components.

**Parameters**:
- `innerBlocks` (`WPBlock[] | null | undefined`): Array of block objects from editor

**Returns**: `boolean` - `true` if at least one block has non-whitespace text

**Supported Block Types**:
- `core/paragraph`: Checks `content` attribute
- `core/heading`: Checks `content` attribute
- `core/list`: Checks `values` attribute
- Other block types: Assumes content exists (future-proof)

**Example**:
```typescript
import { computeHasDescription } from './lib/hasDescription';

const innerBlocks = useSelect(
  (select) => {
    const blockEditor = select('core/block-editor');
    return blockEditor?.getBlocks(clientId);
  },
  [clientId]
);

const hasDescription = useMemo(
  () => computeHasDescription(innerBlocks || []),
  [innerBlocks]
);
```

## CSS Custom Properties

The block uses CSS custom properties for theme integration:

### `--action`
- **Used for**: PRO tier badge background
- **Fallback**: `#0073aa` (blue)
- **Example**:
  ```css
  .pm-tier-badge--pro {
    background-color: var(--action, #0073aa);
    color: #ffffff;
  }
  ```

### `--secondary`
- **Used for**: PRO+ tier badge background
- **Fallback**: `#7c3aed` (purple)
- **Example**:
  ```css
  .pm-tier-badge--proplus {
    background-color: var(--secondary, #7c3aed);
    color: #ffffff;
  }
  ```

### Setting Custom Colors
Add these CSS variables to your theme:
```css
:root {
  --action: #0073aa;    /* Your brand primary color */
  --secondary: #7c3aed; /* Your brand secondary color */
}
```

## Block Registration

The block is registered using WordPress Block API v3:

```typescript
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { IntegrationFeatureAttributes } from './types';

registerBlockType<IntegrationFeatureAttributes>(metadata.name, {
  edit: Edit,
  save,
});
```

## Extending the Block

### Adding a New Tier

1. Update `TierType` in `types.ts`:
   ```typescript
   export type TierType = 'free' | 'pro' | 'proplus' | 'enterprise';
   ```

2. Add tier to `block.json` enum:
   ```json
   {
     "tier": {
       "enum": ["free", "pro", "proplus", "enterprise"]
     }
   }
   ```

3. Add tier config in `edit.tsx` and `save.tsx`:
   ```typescript
   const TIER_CONFIG: Record<TierType, TierConfig> = {
     // ... existing tiers
     enterprise: {
       label: __('ENTERPRISE', 'popup-maker'),
       className: 'pm-tier-badge--enterprise',
       icon: 'building',
     },
   };
   ```

4. Add tier styles in `style.scss`:
   ```scss
   .pm-tier-badge--enterprise {
     background-color: var(--tertiary, #1a1a1a);
     color: #ffffff;
   }
   ```

### Adding New Icon Styles

1. Update `IconStyleType` in `types.ts`:
   ```typescript
   export type IconStyleType = 'chevron' | 'plus-minus' | 'arrow';
   ```

2. Update enum in `block.json`:
   ```json
   {
     "iconStyle": {
       "enum": ["chevron", "plus-minus", "arrow"]
     }
   }
   ```

3. Update icon rendering logic in `edit.tsx`:
   ```typescript
   const getIcon = () => {
     switch (iconStyle) {
       case 'plus-minus':
         return isOpen ? '−' : '+';
       case 'arrow':
         return isOpen ? '↑' : '↓';
       case 'chevron':
       default:
         return isOpen ? '▲' : '▼';
     }
   };
   ```

4. Update icon rendering in `save.tsx`:
   ```typescript
   const getIcon = () => {
     switch (iconStyle) {
       case 'plus-minus':
         return '+';
       case 'arrow':
         return '↓';
       case 'chevron':
       default:
         return '▼';
     }
   };
   ```

5. Add toolbar control in `edit.tsx`:
   ```typescript
   {
     title: __('Arrow (↓/↑)', 'popup-maker'),
     isActive: iconStyle === 'arrow',
     onClick: () => setAttributes({ iconStyle: 'arrow' }),
   }
   ```

### Customizing Allowed InnerBlocks

Update `allowedBlocks` in `edit.tsx`:

```typescript
const innerBlocksProps = useInnerBlocksProps(
  {
    className: 'pm-integration-feature__description',
  },
  {
    template: [
      ['core/paragraph', { placeholder: __('Add description...', 'popup-maker') }],
    ],
    templateLock: false,
    allowedBlocks: [
      'core/paragraph',
      'core/list',
      'core/heading',
      'core/image',      // Add image support
      'core/quote',      // Add quote support
      'core/buttons',    // Add buttons support
    ],
  }
);
```

### Block Filters

WordPress provides filters for extending blocks:

```javascript
// Add custom attributes
wp.hooks.addFilter(
  'blocks.registerBlockType',
  'my-plugin/integration-feature-custom-attributes',
  (settings, name) => {
    if (name === 'popup-maker/integration-feature') {
      settings.attributes = {
        ...settings.attributes,
        customAttribute: {
          type: 'string',
          default: '',
        },
      };
    }
    return settings;
  }
);

// Modify block save output
wp.hooks.addFilter(
  'blocks.getSaveElement',
  'my-plugin/integration-feature-save-element',
  (element, blockType, attributes) => {
    if (blockType.name === 'popup-maker/integration-feature') {
      // Modify save element
    }
    return element;
  }
);
```

## Accessibility

The block includes comprehensive accessibility features:

- **ARIA attributes**: `aria-expanded`, `aria-controls`, `role="button"`, `role="region"`
- **Keyboard navigation**: Enter and Space keys to toggle accordion
- **Focus management**: Visible focus outlines with 2px offset
- **Screen reader support**: `aria-hidden="true"` on decorative icons
- **High contrast mode**: Enhanced borders and outlines
- **Reduced motion**: Respects `prefers-reduced-motion` preference

## Performance Considerations

### Derived State Pattern

The block uses a **derived state pattern** instead of `useEffect` for computing `hasDescription`:

```typescript
// ✅ GOOD: Derived state with useMemo
const hasDescription = useMemo(
  () => computeHasDescription(innerBlocks || []),
  [innerBlocks]
);

// ❌ BAD: useEffect with setAttributes (feedback loop risk)
useEffect(() => {
  const hasDesc = computeHasDescription(innerBlocks);
  setAttributes({ hasDescription: hasDesc });
}, [innerBlocks]);
```

**Benefits**:
- No useEffect feedback loops
- Single source of truth
- Better performance
- Eliminates race conditions

### Memoization

Use `useMemo` for expensive computations:

```typescript
const hasDescription = useMemo(
  () => computeHasDescription(innerBlocks || []),
  [innerBlocks]
);
```

## Testing

See the specification document for comprehensive test coverage strategy:
- 150+ tests planned
- 82% coverage target
- Unit, integration, accessibility, and E2E tests

## Further Reading

- [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [BEM Methodology](http://getbem.com/)
