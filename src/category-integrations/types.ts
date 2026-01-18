/**
 * Type definitions for Category Integrations block
 */

/**
 * Display mode types
 */
export type DisplayModeType = 'expanded' | 'collapsed' | 'tease';

/**
 * Tease expand mode types
 */
export type TeaseExpandModeType = 'inline' | 'link';

/**
 * Heading tag types
 */
export type HeadingTagType = 'h2' | 'h3';

/**
 * Block attributes interface
 */
export interface CategoryIntegrationsAttributes {
	categoryId: number;
	categorySlug: string;
	displayMode: DisplayModeType;
	teaseCount: number;
	groupIcon: string;
	groupIconColor: string;
	groupIconBackgroundColor: string;
	headingOverride: string;
	headingTag: HeadingTagType;
	subheadingOverride: string;
	headerBackgroundColor: string;
	headingColor: string;
	subheadingColor: string;
	autoExcludeCurrent: boolean;
	teaseExpandMode: TeaseExpandModeType;
}

/**
 * Edit component props
 */
export interface EditProps {
	attributes: CategoryIntegrationsAttributes;
	setAttributes: (attributes: Partial<CategoryIntegrationsAttributes>) => void;
	clientId: string;
	isSelected: boolean;
}

/**
 * Category term from REST API
 */
export interface CategoryTerm {
	id: number;
	name: string;
	slug: string;
	description: string;
	count: number;
	link: string;
}

/**
 * Integration item from REST API
 */
export interface IntegrationItem {
	id: number;
	title: {
		rendered: string;
	};
	slug: string;
	link: string;
}

/**
 * Category icon mapping
 */
export const CATEGORY_ICONS: Record<string, string> = {
	'form-integrations': 'dashicons-feedback',
	'ecommerce-integrations': 'dashicons-cart',
	'crm-integrations': 'dashicons-id-alt',
	'analytics-integrations': 'dashicons-chart-bar',
	'automation-integrations': 'dashicons-update',
	'email-marketing-integrations': 'dashicons-email-alt',
	'lms-integrations': 'dashicons-welcome-learn-more',
	'page-builder-integrations': 'dashicons-layout',
	'social-integrations': 'dashicons-share',
};

/**
 * Get icon for a category slug
 */
export function getCategoryIcon(slug: string): string {
	return CATEGORY_ICONS[slug] || 'dashicons-admin-links';
}
