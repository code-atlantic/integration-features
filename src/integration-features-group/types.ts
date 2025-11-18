/**
 * Type definitions for Integration Features Group block
 */

/**
 * Icon animation types
 */
export type IconAnimationType = 'rotate-45' | 'rotate-180';

/**
 * Block attributes interface
 */
export interface IntegrationFeaturesGroupAttributes {
  iconAnimation: IconAnimationType;
  oneOpenPerGroup: boolean;
  defaultOpen: boolean;
  hasFeatures: boolean;
}

/**
 * Edit component props
 */
export interface EditProps {
  attributes: IntegrationFeaturesGroupAttributes;
  setAttributes: (attributes: Partial<IntegrationFeaturesGroupAttributes>) => void;
  clientId: string;
  isSelected: boolean;
}

/**
 * Save component props
 */
export interface SaveProps {
  attributes: IntegrationFeaturesGroupAttributes;
}

/**
 * WordPress block object structure
 */
export interface WPBlock {
  name: string;
  clientId: string;
  attributes: Record<string, any>;
  innerBlocks?: WPBlock[];
}
