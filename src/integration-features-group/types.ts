/**
 * Type definitions for Integration Features Group block
 */

/**
 * Icon animation types
 */
export type IconAnimationType = 'rotate-45' | 'rotate-180';

/**
 * Heading tag types
 */
export type HeadingTagType = 'h2' | 'h3';

/**
 * Block attributes interface
 */
export interface IntegrationFeaturesGroupAttributes {
  groupIcon: string;
  groupIconColor: string;
  groupIconBackgroundColor: string;
  heading: string;
  headingTag: HeadingTagType;
  subheading: string;
  iconAnimation: IconAnimationType;
  oneOpenPerGroup: boolean;
  defaultOpen: boolean;
  groupCollapsible: boolean;
  groupCollapsed: boolean;
  hasFeatures: boolean;
  headerBackgroundColor: string;
  headingColor: string;
  subheadingColor: string;
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
