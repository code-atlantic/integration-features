/**
 * Block registration for Category Integrations
 */

import { registerBlockType } from '@wordpress/blocks';
import type { BlockConfiguration } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';
import type { CategoryIntegrationsAttributes } from './types';

/**
 * Register the Category Integrations block
 *
 * This block uses server-side rendering (render.php) for the frontend,
 * so no save component is needed. The edit component provides the editor
 * experience with a live preview via ServerSideRender.
 */
registerBlockType<CategoryIntegrationsAttributes>(
	metadata.name,
	{
		...metadata,
		edit: Edit,
		// No save component - using render.php for server-side rendering
		save: () => null,
	} as unknown as BlockConfiguration<CategoryIntegrationsAttributes>
);
