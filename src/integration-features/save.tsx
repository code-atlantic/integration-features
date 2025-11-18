import { useBlockProps, useInnerBlocksProps, RichText } from '@wordpress/block-editor';
import React from 'react';
import type { SaveProps, TierConfig, TierType } from './types';

/**
 * Helper function to check if React child content is empty
 * Used to filter out empty paragraphs and list items
 */
const isEmptyContent = (children: React.ReactNode): boolean => {
	if (!children) return true;

	// Handle arrays of children
	if (Array.isArray(children)) {
		return children.every(child => isEmptyContent(child));
	}

	// Handle React elements
	if (React.isValidElement(children)) {
		// Recursively check children of the element
		if (children.props.children) {
			return isEmptyContent(children.props.children);
		}
		return true;
	}

	// Handle strings/text nodes
	if (typeof children === 'string') {
		return children.trim().length === 0;
	}

	// Default to not empty for other types
	return false;
};

/**
 * Tier badge configuration (matches edit.tsx)
 */
const TIER_CONFIG: Record<TierType, TierConfig> = {
	free: {
		label: 'FREE',
		className: 'pm-tier-badge--free',
		icon: 'admin-plugins',
	},
	pro: {
		label: 'PRO',
		className: 'pm-tier-badge--pro',
		icon: 'star-filled',
	},
	proplus: {
		label: 'PRO+',
		className: 'pm-tier-badge--proplus',
		icon: 'awards',
	},
};

/**
 * Save component for Integration Feature block
 *
 * Renders native <details><summary> when description exists,
 * or plain <div> when description is empty.
 *
 * CRITICAL: Computes hasDescription from actual InnerBlocks content
 * to ensure deterministic save output matches content state.
 */
export default function Save({ attributes }: SaveProps) {
	const { tier, label, iconStyle, showFreeBadge, fontSize } = attributes;

	/**
	 * InnerBlocks props for description content
	 */
	const innerBlocksProps = useInnerBlocksProps.save({
		className: 'pm-integration-feature__description',
		style: {
			fontSize: '1.6rem',
		},
	});

	/**
	 * Use hasDescription attribute for deterministic rendering
	 *
	 * BACKWARD COMPATIBLE: Fallback to React.Children.count for existing blocks
	 * that were saved before this attribute existed. This ensures gradual migration
	 * without breaking existing content.
	 */
	const hasDescription = attributes.hasDescription ?? (
		innerBlocksProps.children &&
		React.Children.count(innerBlocksProps.children) > 0
	);

	/**
	 * Current tier config
	 */
	const currentTier = TIER_CONFIG[tier] || TIER_CONFIG.free;

	/**
	 * Get accordion icon based on style
	 * Frontend always renders closed state
	 */
	const icon = iconStyle === 'plus-minus' ? '+' : '▼';

	/**
	 * Block wrapper props
	 *
	 * NOTE: We manually construct className to avoid wp-block-{namespace}-{name} auto-addition
	 * This maintains backward compatibility with blocks saved before this pattern.
	 */
	const blockProps = useBlockProps.save({
		style: {
			fontSize: fontSize || '1.8rem',
		},
	});

	// Override className to match legacy format (no wp-block-popup-maker-integration-feature)
	const className = `pm-integration-feature ${hasDescription ? 'has-description' : ''}`;

	/**
	 * Conditional rendering: <details> with description, <div> without
	 */
	if (hasDescription) {
		// Render native <details><summary> accordion with Interactivity API
		return (
			<details
				{...blockProps}
				className={className}
				data-wp-interactive="popup-maker/integration-feature"
				data-wp-context={JSON.stringify({ isOpen: false, iconStyle })}
				data-wp-init="callbacks.init"
			>
				<summary className="pm-integration-feature__header">
					{/* Tier Badge or Checkmark */}
					{tier === 'free' && !showFreeBadge ? (
						<span className="pm-tier-checkmark dashicons dashicons-yes" aria-label="Free feature"></span>
					) : (
						<span className={`pm-tier-badge ${currentTier.className}`}>
							{currentTier.label}
						</span>
					)}

					{/* Feature Label */}
					<RichText.Content
						tagName="span"
						className="pm-integration-feature__label"
						value={label}
					/>

					{/* Accordion Icon - dynamically updated by Interactivity API */}
					<span
						className="pm-integration-feature__icon"
						aria-hidden="true"
						data-wp-text="state.currentIcon"
					>
						{icon}
					</span>
				</summary>

				{/* Description Panel - Filter empty child blocks */}
				<div
					{...innerBlocksProps}
					children={
						Array.isArray(innerBlocksProps.children)
							? innerBlocksProps.children.filter(
									(child) => !isEmptyContent(child)
							  )
							: innerBlocksProps.children
					}
				/>
			</details>
		);
	}

	// Render plain <div> without accordion behavior
	return (
		<div {...blockProps} className={className}>
			<div className="pm-integration-feature__header">
				{/* Tier Badge or Checkmark */}
				{tier === 'free' && !showFreeBadge ? (
					<span className="pm-tier-checkmark dashicons dashicons-yes" aria-label="Free feature"></span>
				) : (
					<span className={`pm-tier-badge ${currentTier.className}`}>
						{currentTier.label}
					</span>
				)}

				{/* Feature Label */}
				<RichText.Content
					tagName="span"
					className="pm-integration-feature__label"
					value={label}
				/>
			</div>
		</div>
	);
}
