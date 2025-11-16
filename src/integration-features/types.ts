/**
 * Type definitions for Integration Feature block
 */

/**
 * Tier badge types
 */
export type TierType = 'free' | 'pro' | 'proplus';

/**
 * Block attributes interface
 */
export interface IntegrationFeatureAttributes {
	tier: TierType;
	label: string;
	isOpen: boolean;
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
