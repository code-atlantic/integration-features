/**
 * Edit component for Integration Features Group block
 */

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToolbarDropdownMenu,
	PanelBody,
	ToggleControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo, useEffect } from '@wordpress/element';
import React from 'react';

import type { EditProps, WPBlock } from './types';
import { computeHasFeatures } from './lib/hasFeatures';
import './editor.scss';

/**
 * Edit component for Integration Features Group block
 *
 * Uses derived state pattern for hasFeatures to avoid useEffect feedback loops
 */
export default function Edit({
	attributes,
	setAttributes,
	clientId,
	isSelected,
}: EditProps) {
	const { iconAnimation, oneOpenPerGroup, defaultOpen } = attributes;

	/**
	 * Get inner blocks using WordPress data selector
	 */
	const innerBlocks = useSelect(
		(select) => {
			const blockEditor = select('core/block-editor') as any;
			return blockEditor?.getBlocks(clientId) as WPBlock[] | undefined;
		},
		[clientId]
	);

	/**
	 * DERIVED STATE: Compute hasFeatures from inner blocks
	 * Store as attribute for deterministic save output
	 */
	const computedHasFeatures = useMemo(
		() => computeHasFeatures(innerBlocks || []),
		[innerBlocks]
	);

	/**
	 * Update hasFeatures attribute when content changes
	 * This ensures save.tsx can render correct output
	 */
	useEffect(() => {
		if (computedHasFeatures !== attributes.hasFeatures) {
			setAttributes({ hasFeatures: computedHasFeatures });
		}
	}, [computedHasFeatures, attributes.hasFeatures, setAttributes]);

	/**
	 * Block wrapper props
	 */
	const blockProps = useBlockProps({
		className: `pm-integration-features-group ${
			computedHasFeatures ? 'has-features' : ''
		}`,
	});

	/**
	 * InnerBlocks configuration with template for structure
	 */
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'pm-integration-features-group__content',
		},
		{
			template: [
				[
					'core/image',
					{
						className: 'pm-integration-features-group__icon',
						sizeSlug: 'full',
					},
				],
				[
					'core/heading',
					{
						level: 2,
						placeholder: __('Integration name...', 'popup-maker'),
						className: 'pm-integration-features-group__heading',
					},
				],
				[
					'core/paragraph',
					{
						placeholder: __(
							'Brief description...',
							'popup-maker'
						),
						className: 'pm-integration-features-group__subheading',
					},
				],
				['popup-maker/integration-feature', {}],
			],
			templateLock: false,
			allowedBlocks: [
				'core/image',
				'core/heading',
				'core/paragraph',
				'popup-maker/integration-feature',
			],
		}
	);

	return (
		<>
			{/* Inspector Controls - Sidebar Settings */}
			<InspectorControls>
				<PanelBody
					title={__('Accordion Settings', 'popup-maker')}
					initialOpen={true}
				>
					<ToggleControl
						label={__('One Open Per Group', 'popup-maker')}
						help={__(
							'Only allow one feature accordion open at a time',
							'popup-maker'
						)}
						checked={oneOpenPerGroup}
						onChange={(value) =>
							setAttributes({ oneOpenPerGroup: value })
						}
					/>
					<ToggleControl
						label={__(
							'First Feature Open by Default',
							'popup-maker'
						)}
						help={__(
							'Open the first feature accordion when page loads',
							'popup-maker'
						)}
						checked={defaultOpen}
						onChange={(value) =>
							setAttributes({ defaultOpen: value })
						}
					/>
				</PanelBody>
			</InspectorControls>

			{/* Toolbar Controls - Icon Animation Style */}
			<BlockControls>
				<ToolbarGroup>
					<ToolbarDropdownMenu
						icon="admin-settings"
						label={__('Icon Animation', 'popup-maker')}
						controls={[
							{
								title: __(
									'Rotate 45° (Plus-to-X)',
									'popup-maker'
								),
								isActive:
									iconAnimation === 'rotate-45',
								onClick: () =>
									setAttributes({
										iconAnimation: 'rotate-45',
									}),
							},
							{
								title: __(
									'Rotate 180° (Chevron Flip)',
									'popup-maker'
								),
								isActive:
									iconAnimation === 'rotate-180',
								onClick: () =>
									setAttributes({
										iconAnimation: 'rotate-180',
									}),
							},
						]}
					/>
				</ToolbarGroup>
			</BlockControls>

			{/* Block Content */}
			<div {...blockProps}>
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}
