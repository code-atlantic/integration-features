/**
 * Type definitions for Section Heading block
 */

/**
 * Heading tag types
 */
export type HeadingTagType = 'h2' | 'h3';

/**
 * Link object from WordPress LinkControl
 */
export interface ViewAllLinkValue {
	url: string;
	opensInNewTab?: boolean;
}

/**
 * Block attributes interface
 */
export interface SectionHeadingAttributes {
	heading: string;
	headingTag: HeadingTagType;
	subtitle: string;
	viewAllLink: ViewAllLinkValue;
	isExternalLink: boolean;
	headingColor: string;
	subtitleColor: string;
	linkColor: string;
}

/**
 * Edit component props
 */
export interface EditProps {
	attributes: SectionHeadingAttributes;
	setAttributes: (attributes: Partial<SectionHeadingAttributes>) => void;
	clientId: string;
	isSelected: boolean;
}

/**
 * Save component props
 */
export interface SaveProps {
	attributes: SectionHeadingAttributes;
}

/**
 * Helper to detect if URL is external
 */
export function isExternalUrl(url: string): boolean {
	if (!url) return false;
	try {
		const linkUrl = new URL(url, window.location.origin);
		return linkUrl.origin !== window.location.origin;
	} catch {
		return false;
	}
}
