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
	const { tier, label } = attributes;

	/**
	 * InnerBlocks props for description content
	 */
	const innerBlocksProps = useInnerBlocksProps.save({
		className: 'pm-integration-feature__description',
	});

	/**
	 * Compute hasDescription from actual InnerBlocks children
	 * This ensures save output matches current content state
	 */
	const hasDescription =
		innerBlocksProps.children &&
		React.Children.count(innerBlocksProps.children) > 0;

	/**
	 * Current tier config
	 */
	const currentTier = TIER_CONFIG[tier] || TIER_CONFIG.free;

	/**
	 * Block wrapper props
	 */
	const blockProps = useBlockProps.save({
		className: `pm-integration-feature ${hasDescription ? 'has-description' : ''}`,
	});

	/**
	 * Conditional rendering: <details> with description, <div> without
	 */
	if (hasDescription) {
		// Render native <details><summary> accordion
		return (
			<details {...blockProps}>
				<summary className="pm-integration-feature__header">
					{/* Tier Badge */}
					<span className={`pm-tier-badge ${currentTier.className}`}>
						{currentTier.label}
					</span>

					{/* Feature Label */}
					<RichText.Content
						tagName="span"
						className="pm-integration-feature__label"
						value={label}
					/>

					{/* Accordion Icon */}
					<span className="pm-integration-feature__icon" aria-hidden="true">
						▼
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
				{/* Tier Badge */}
				<span className={`pm-tier-badge ${currentTier.className}`}>
					{currentTier.label}
				</span>

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
