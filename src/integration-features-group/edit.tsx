/**
 * Edit component for Integration Features Group block
 */

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	InspectorControls,
	PanelColorSettings,
	RichText,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToolbarDropdownMenu,
	PanelBody,
	ToggleControl,
	ColorPalette,
	SelectControl,
	ButtonGroup,
	Button,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo, useEffect, useState } from '@wordpress/element';
import React from 'react';

import type { EditProps, WPBlock } from './types';
import { computeHasFeatures } from './lib/hasFeatures';
import DashiconPicker from './components/DashiconPicker';
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
	const { groupIcon, groupIconColor, groupIconBackgroundColor, heading, headingTag, subheading, iconAnimation, oneOpenPerGroup, defaultOpen, groupCollapsible, groupCollapsed, headerBackgroundColor, headingColor, subheadingColor } = attributes;

	// Track if we're editing the heading/subheading RichText
	const [isEditingText, setIsEditingText] = useState(false);

	// Debounce color changes to avoid excessive re-renders
	const [pendingColor, setPendingColor] = useState(groupIconColor);
	const [pendingBgColor, setPendingBgColor] = useState(groupIconBackgroundColor);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (pendingColor !== groupIconColor) {
				setAttributes({ groupIconColor: pendingColor });
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [pendingColor, groupIconColor, setAttributes]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (pendingBgColor !== groupIconBackgroundColor) {
				setAttributes({ groupIconBackgroundColor: pendingBgColor });
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [pendingBgColor, groupIconBackgroundColor, setAttributes]);

	/**
	 * Get inner blocks and check if any have selection
	 */
	const { innerBlocks, hasSelectedInnerBlock } = useSelect(
		(select) => {
			const blockEditor = select('core/block-editor') as any;
			return {
				innerBlocks: blockEditor?.getBlocks(clientId) as WPBlock[] | undefined,
				hasSelectedInnerBlock: blockEditor?.hasSelectedInnerBlock(clientId, true) as boolean,
			};
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
	 * Auto-collapse when block is deselected (unless editing text or inner blocks)
	 */
	useEffect(() => {
		if (!isSelected && !isEditingText && !hasSelectedInnerBlock && groupCollapsible && !groupCollapsed) {
			setAttributes({ groupCollapsed: true });
		}
	}, [isSelected, isEditingText, hasSelectedInnerBlock, groupCollapsible, groupCollapsed, setAttributes]);

	/**
	 * In editor, InnerBlocks are visible when:
	 * - Block is selected, OR
	 * - Inner block is selected, OR
	 * - groupCollapsible is false (always visible)
	 */
	const innerBlocksVisible = isSelected || hasSelectedInnerBlock || !groupCollapsible;

	/**
	 * Block wrapper props
	 */
	const blockPropsRaw = useBlockProps({
		className: `pm-integration-features-group ${
			computedHasFeatures ? 'has-features' : ''
		}`,
		'data-icon-animation': iconAnimation,
	});

	// Extract padding from blockProps to apply to children instead
	const {
		padding,
		paddingTop,
		paddingRight,
		paddingBottom,
		paddingLeft,
		...blockPropsStyle
	} = blockPropsRaw.style || {};

	const blockProps = {
		...blockPropsRaw,
		style: blockPropsStyle,
	};

	/**
	 * InnerBlocks configuration for integration-feature blocks only
	 */
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'pm-integration-features-group__features',
			style: {
				padding: padding || '2rem',
				paddingTop: paddingTop || undefined,
				paddingRight: paddingRight || undefined,
				paddingBottom: paddingBottom || undefined,
				paddingLeft: paddingLeft || undefined,
			},
		},
		{
			template: [
				['popup-maker/integration-feature', {}],
			],
			templateLock: false,
			allowedBlocks: [
				'popup-maker/integration-feature',
			],
		}
	);

	return (
		<>
			{/* Inspector Controls - Sidebar Settings */}
			<InspectorControls>
				{/* Heading Settings */}
				<PanelBody
					title={__('Heading Settings', 'popup-maker')}
					initialOpen={true}
				>
					<SelectControl
						label={__('Heading Tag', 'popup-maker')}
						value={headingTag}
						options={[
							{ label: 'H2', value: 'h2' },
							{ label: 'H3', value: 'h3' },
						]}
						onChange={(value) =>
							setAttributes({ headingTag: value as 'h2' | 'h3' })
						}
					/>
				</PanelBody>


				{/* Group Settings */}
				<PanelBody
					title={__('Group Settings', 'popup-maker')}
					initialOpen={true}
				>
					<ToggleControl
						label={__('Group Collapsible', 'popup-maker')}
						help={__(
							'Make the entire group header collapsible to hide/show all features',
							'popup-maker'
						)}
						checked={groupCollapsible}
						onChange={(value) =>
							setAttributes({ groupCollapsible: value })
						}
					/>
					{groupCollapsible && (
						<>
							<label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>
								{__('Toggle Icon Style', 'popup-maker')}
							</label>
							<ButtonGroup style={{ marginBottom: '16px' }}>
								<Button
									variant={iconAnimation === 'rotate-45' ? 'primary' : 'secondary'}
									onClick={() => setAttributes({ iconAnimation: 'rotate-45' })}
								>
									{__('Plus (+)', 'popup-maker')}
								</Button>
								<Button
									variant={iconAnimation === 'rotate-180' ? 'primary' : 'secondary'}
									onClick={() => setAttributes({ iconAnimation: 'rotate-180' })}
								>
									{__('Arrow', 'popup-maker')}
								</Button>
							</ButtonGroup>
						</>
					)}
				</PanelBody>

				{/* Contained Features Settings */}
				<PanelBody
					title={__('Contained Features Settings', 'popup-maker')}
					initialOpen={false}
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

				{/* Header Colors */}
				<PanelColorSettings
					title={__('Header Colors', 'popup-maker')}
					initialOpen={false}
					colorSettings={[
						{
							value: headerBackgroundColor,
							onChange: (color) => setAttributes({ headerBackgroundColor: color || '' }),
							label: __('Header Background', 'popup-maker'),
						},
						{
							value: headingColor,
							onChange: (color) => setAttributes({ headingColor: color || '' }),
							label: __('Heading Text', 'popup-maker'),
						},
						{
							value: subheadingColor,
							onChange: (color) => setAttributes({ subheadingColor: color || '' }),
							label: __('Subheading Text', 'popup-maker'),
						},
					]}
				/>

			</InspectorControls>

			{/* Toolbar Controls - Icon Picker and Animation Style */}
			<BlockControls>
				<ToolbarGroup>
					{/* Icon Picker in Toolbar */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '8px', borderRight: '1px solid #e5e7eb' }}>
						<DashiconPicker
							value={groupIcon}
							onChange={(value) =>
								setAttributes({ groupIcon: value })
							}
							color={pendingColor}
							onColorChange={(color) =>
								setPendingColor(color)
							}
							backgroundColor={pendingBgColor}
							onBackgroundColorChange={(color) =>
								setPendingBgColor(color)
							}
							label={__('Icon', 'popup-maker')}
						/>
					</div>

				</ToolbarGroup>
			</BlockControls>

			{/* Block Content - Edit Mode */}
			<div {...blockProps}>
				{/* Header section with icon, heading and subtext */}
				<div
					className="pm-integration-features-group__header"
					onClick={() => {
						if (groupCollapsible) {
							setAttributes({ groupCollapsed: !groupCollapsed });
						}
					}}
					style={{
						cursor: groupCollapsible ? 'pointer' : 'default',
						backgroundColor: headerBackgroundColor || undefined,
						borderColor: blockProps.style?.borderColor || undefined,
						borderStyle: blockProps.style?.borderStyle || undefined,
						borderWidth: blockProps.style?.borderWidth || undefined,
						borderBottomColor: blockProps.style?.borderColor || undefined,
						borderBottomStyle: blockProps.style?.borderStyle || undefined,
						borderBottomWidth: blockProps.style?.borderWidth || undefined,
						padding: padding || '2rem',
						paddingTop: paddingTop || undefined,
						paddingRight: paddingRight || undefined,
						paddingBottom: paddingBottom || undefined,
						paddingLeft: paddingLeft || undefined,
					}}
					role={groupCollapsible ? 'button' : undefined}
					tabIndex={groupCollapsible ? 0 : undefined}
					onKeyDown={(e) => {
						if (groupCollapsible && (e.key === 'Enter' || e.key === ' ')) {
							e.preventDefault();
							setAttributes({ groupCollapsed: !groupCollapsed });
						}
					}}
				>
					{/* Group Icon - displayed in editor */}
					{groupIcon && (
						<i
							className={`pm-integration-features-group__icon dashicons ${groupIcon}`}
							style={{
								color: pendingColor,
								backgroundColor: pendingBgColor || pendingColor + '33'
							}}
							aria-hidden="true"
						/>
					)}

					{/* Text section */}
					<div className="pm-integration-features-group__text">
						{/* Heading */}
						<RichText
							tagName={headingTag as any}
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							onFocus={() => setIsEditingText(true)}
							onBlur={() => setIsEditingText(false)}
							placeholder={__('Integration name...', 'popup-maker')}
							className="pm-integration-features-group__heading"
							style={{
								color: headingColor || undefined
							}}
							allowedFormats={[
								'core/bold',
								'core/italic',
								'core/link',
								'core/strikethrough',
								'core/code',
							]}
						/>

						{/* Subheading */}
						<RichText
							tagName="p"
							value={subheading}
							onChange={(value) => setAttributes({ subheading: value })}
							onFocus={() => setIsEditingText(true)}
							onBlur={() => setIsEditingText(false)}
							placeholder={__('Brief description...', 'popup-maker')}
							className="pm-integration-features-group__subheading"
							style={{
								color: subheadingColor || undefined
							}}
							allowedFormats={[
								'core/bold',
								'core/italic',
								'core/link',
								'core/strikethrough',
								'core/code',
							]}
						/>
					</div>

					{/* Collapse toggle indicator */}
					{groupCollapsible && (
						<i
							className={`pm-integration-features-group__toggle dashicons ${
								iconAnimation === 'rotate-45' ? 'dashicons-plus' : 'dashicons-arrow-up-alt2'
							} ${innerBlocksVisible ? 'is-expanded' : 'is-collapsed'}`}
							aria-hidden="true"
						/>
					)}
				</div>

				{/* Features InnerBlocks - show when visible */}
				{innerBlocksVisible && <div {...innerBlocksProps} />}
			</div>
		</>
	);
}
