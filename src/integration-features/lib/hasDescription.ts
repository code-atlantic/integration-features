import type { WPBlock } from '../types';

/**
 * Determine if inner blocks contain meaningful description content
 *
 * This is the SINGLE SOURCE OF TRUTH for hasDescription computation.
 * Used by both Edit and Save components to ensure consistency.
 *
 * @param innerBlocks - Array of block objects from editor
 * @returns True if at least one block has non-whitespace text
 */
export function computeHasDescription(innerBlocks: WPBlock[] | null | undefined): boolean {
	if (!innerBlocks || innerBlocks.length === 0) {
		return false;
	}

	return innerBlocks.some((block: WPBlock): boolean => {
		let attributeContent = '';

		switch (block.name) {
			case 'core/paragraph':
			case 'core/heading':
				attributeContent = (block.attributes?.content as string) || '';
				break;

			case 'core/list':
				attributeContent = (block.attributes?.values as string) || '';
				break;

			default:
				// Future block types: if block exists, assume content
				return true;
		}

		// Strip HTML tags and check for non-whitespace text
		const textOnly = attributeContent.replace(/<[^>]*>/g, '');
		return textOnly.trim().length > 0;
	});
}
