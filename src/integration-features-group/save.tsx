/**
 * Save component for Integration Features Group block
 */

import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import React from 'react';
import type { SaveProps } from './types';

/**
 * Save component for Integration Features Group block
 *
 * Renders the frontend HTML with Interactivity API attributes
 * for group coordination and accordion behavior.
 */
export default function Save({ attributes }: SaveProps) {
	const {
		iconAnimation,
		oneOpenPerGroup,
		defaultOpen,
		hasFeatures,
	} = attributes;

	/**
	 * InnerBlocks props for group content
	 */
	const innerBlocksProps = useInnerBlocksProps.save({
		className: 'pm-integration-features-group__content',
	});

	/**
	 * Block wrapper props with Interactivity API attributes
	 */
	const blockProps = useBlockProps.save({
		className: `pm-integration-features-group ${
			hasFeatures ? 'has-features' : ''
		}`,
		'data-icon-animation': iconAnimation,
		'data-wp-interactive': 'popup-maker/integration-features-group',
		'data-wp-context': JSON.stringify({
			groupId: '',
			iconAnimation,
			oneOpenPerGroup,
			defaultOpen,
			openFeatureId: null,
		}),
		'data-wp-init': 'callbacks.init',
	});

	return <div {...blockProps}><div {...innerBlocksProps} /></div>;
}
