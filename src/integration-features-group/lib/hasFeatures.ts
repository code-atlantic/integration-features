/**
 * Utility to determine if inner blocks contain integration-feature blocks
 */

import type { WPBlock } from '../types';

/**
 * Determine if inner blocks contain integration-feature blocks
 *
 * Single source of truth for hasFeatures computation.
 * Used by both Edit and Save components to ensure consistency.
 *
 * @param innerBlocks - WordPress block objects to check
 * @returns true if any integration-feature blocks found, false otherwise
 */
export function computeHasFeatures(
	innerBlocks: WPBlock[] | null | undefined
): boolean {
	if (!innerBlocks || innerBlocks.length === 0) {
		return false;
	}

	return innerBlocks.some((block: WPBlock): boolean => {
		return block.name === 'popup-maker/integration-feature';
	});
}
