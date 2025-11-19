/**
 * Save component for Integration Features Group block
 */

import { useBlockProps, useInnerBlocksProps, RichText } from '@wordpress/block-editor';
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
		groupIcon,
		groupIconColor,
		groupIconBackgroundColor,
		heading,
		headingTag,
		subheading,
		iconAnimation,
		oneOpenPerGroup,
		defaultOpen,
		groupCollapsible,
		groupCollapsed,
		hasFeatures,
		headerBackgroundColor,
		headingColor,
		subheadingColor,
	} = attributes;

	/**
	 * Block wrapper props with Interactivity API attributes
	 */
	const blockPropsRaw = useBlockProps.save({
		className: `pm-integration-features-group ${
			hasFeatures ? 'has-features' : ''
		} ${groupCollapsed ? 'is-collapsed' : ''}`,
		'data-icon': groupIcon,
		'data-icon-animation': iconAnimation,
		'data-wp-interactive': 'popup-maker/integration-features-group',
		'data-wp-context': JSON.stringify({
			groupId: '',
			groupIcon,
			groupIconColor,
			iconAnimation,
			oneOpenPerGroup,
			defaultOpen,
			groupCollapsible,
			groupCollapsed,
			openFeatureId: null,
		}),
		'data-wp-init': 'callbacks.init',
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
	 * InnerBlocks props for features
	 */
	const innerBlocksProps = useInnerBlocksProps.save({
		className: `pm-integration-features-group__features ${
			groupCollapsed ? 'is-hidden' : ''
		}`,
		style: {
			backgroundColor: blockProps.style?.backgroundColor || undefined,
			color: blockProps.style?.color || undefined,
			padding: padding || '2rem',
			paddingTop: paddingTop || undefined,
			paddingRight: paddingRight || undefined,
			paddingBottom: paddingBottom || undefined,
			paddingLeft: paddingLeft || undefined,
		},
	});

	return (
		<div {...blockProps}>
			{/* Header section with icon and text */}
			<div
				className="pm-integration-features-group__header"
				style={{
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
				data-wp-on--click={groupCollapsible ? 'actions.toggleGroup' : undefined}
				data-wp-on--keydown={groupCollapsible ? 'actions.toggleGroup' : undefined}
			>
				{/* Group Icon - rendered with color */}
				{groupIcon && (
					<i
						className={`pm-integration-features-group__icon dashicons ${groupIcon}`}
						style={{
							color: groupIconColor,
							backgroundColor: groupIconBackgroundColor || groupIconColor + '33'
						}}
						aria-hidden="true"
					/>
				)}

				{/* Text content */}
				<div className="pm-integration-features-group__text">
					{heading && (
						<RichText.Content
							tagName={headingTag as any}
							className="pm-integration-features-group__heading"
							value={heading}
							style={{
								color: headingColor || undefined
							}}
						/>
					)}
					{subheading && (
						<RichText.Content
							tagName="p"
							className="pm-integration-features-group__subheading"
							value={subheading}
							style={{
								color: subheadingColor || undefined
							}}
						/>
					)}
				</div>

				{/* Collapse toggle indicator */}
				{groupCollapsible && (
					<i
						className={`pm-integration-features-group__toggle dashicons ${
							iconAnimation === 'rotate-45' ? 'dashicons-plus' : 'dashicons-arrow-up-alt2'
						} ${groupCollapsed ? 'is-collapsed' : 'is-expanded'}`}
						aria-hidden="true"
					/>
				)}
			</div>

			{/* Features list - always rendered, frontend JS controls visibility based on groupCollapsed */}
			<div {...innerBlocksProps} />
		</div>
	);
}
