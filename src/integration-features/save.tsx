import { useBlockProps, useInnerBlocksProps, RichText } from '@wordpress/block-editor';
import React from 'react';
import type { SaveProps, TierConfig, TierType } from './types';

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
	});

	/**
	 * Compute hasDescription from actual InnerBlocks children
	 * This ensures save output matches current content state
	 *
	 * IMPORTANT: Keep this simple - just check if children exist
	 * Don't try to detect "empty" content as that causes validation mismatches
	 * with existing saved blocks
	 */
	const hasDescription =
		innerBlocksProps.children &&
		React.Children.count(innerBlocksProps.children) > 0;

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
	 */
	const blockProps = useBlockProps.save({
		className: `pm-integration-feature ${hasDescription ? 'has-description' : ''}`,
		style: {
			fontSize: fontSize || '1.6rem',
		},
	});

	/**
	 * Conditional rendering: <details> with description, <div> without
	 */
	if (hasDescription) {
		// Render native <details><summary> accordion with Interactivity API
		return (
			<details
				{...blockProps}
				data-wp-interactive="popup-maker/integration-feature"
				data-wp-context={JSON.stringify({ isOpen: false, iconStyle })}
			>
				<summary
					className="pm-integration-feature__header"
					data-wp-on--click="actions.toggle"
				>
					{/* Tier Badge - conditionally hidden for FREE tier */}
					{(tier !== 'free' || showFreeBadge) && (
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
						data-wp-text="callbacks.getIcon"
					>
						{icon}
					</span>
				</summary>

				{/* Description Panel */}
				<div {...innerBlocksProps} />
			</details>
		);
	}

	// Render plain <div> without accordion behavior
	return (
		<div {...blockProps}>
			<div className="pm-integration-feature__header">
				{/* Tier Badge - conditionally hidden for FREE tier */}
				{(tier !== 'free' || showFreeBadge) && (
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
