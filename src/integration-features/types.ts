/**
 * Type definitions for Integration Feature block
 */

/**
 * Tier badge types
 */
export type TierType = 'free' | 'pro' | 'proplus';

/**
 * Icon style types for accordion indicator
 */
export type IconStyleType = 'chevron' | 'plus-minus';

/**
 * Block attributes interface
 */
export interface IntegrationFeatureAttributes {
	tier: TierType;
	label: string;
	isOpen: boolean;
	iconStyle: IconStyleType;
	showFreeBadge: boolean;
	fontSize: string;
}

/**
 * Tier configuration
 */
export interface TierConfig {
	label: string;
	className: string;
	icon: string;
}

/**
 * Edit component props
 */
export interface EditProps {
	attributes: IntegrationFeatureAttributes;
	setAttributes: (attributes: Partial<IntegrationFeatureAttributes>) => void;
	clientId: string;
	isSelected: boolean;
}

/**
 * Save component props
 */
export interface SaveProps {
	attributes: IntegrationFeatureAttributes;
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
