/**
 * Block registration for Integration Features Group
 */

import { registerBlockType } from '@wordpress/blocks';
import type { BlockConfiguration } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import type { IntegrationFeaturesGroupAttributes } from './types';

registerBlockType<IntegrationFeaturesGroupAttributes>(
	metadata.name,
	{
		...metadata,
		edit: Edit,
		save: Save,
	} as BlockConfiguration<IntegrationFeaturesGroupAttributes>
);
