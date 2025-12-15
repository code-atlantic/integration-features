/**
 * Block registration for Integration Features Group
 */

import { registerBlockType, createBlock } from '@wordpress/blocks';
import type { BlockConfiguration } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import deprecated from './deprecated';
import metadata from './block.json';
import type { IntegrationFeaturesGroupAttributes } from './types';

/**
 * Block transforms - allows converting multiple Integration Features into a Group
 */
const transforms = {
	from: [
		{
			type: 'block' as const,
			isMultiBlock: true,
			blocks: ['popup-maker/integration-feature'],
			transform: (attributesArray: Array<Record<string, any>>) => {
				// Safety check - ensure we have an array
				// Note: isMultiBlock transforms receive attributes arrays, not full blocks
				if (!attributesArray || !Array.isArray(attributesArray)) {
					return createBlock(
						'popup-maker/integration-features-group',
						{
							heading: '',
							subheading: '',
							groupIcon: 'admin-plugins',
							hasFeatures: false,
							featureCount: 0,
						}
					);
				}

				// Create a new group with the selected features as children
				// Note: innerBlocks (descriptions) are not preserved with isMultiBlock transforms
				return createBlock(
					'popup-maker/integration-features-group',
					{
						heading: '',
						subheading: '',
						groupIcon: 'admin-plugins',
						hasFeatures: attributesArray.length > 0,
						featureCount: attributesArray.length,
					},
					attributesArray.map((attrs) =>
						createBlock('popup-maker/integration-feature', attrs)
					)
				);
			},
		},
	],
};

// @ts-expect-error - block.json editorStyle is array, but @wordpress/blocks types expect string
registerBlockType<IntegrationFeaturesGroupAttributes>(
	metadata.name,
	{
		...metadata,
		edit: Edit,
		save: Save,
		deprecated,
		transforms,
	} as BlockConfiguration<IntegrationFeaturesGroupAttributes>
);
