import { useInnerBlocksProps, RichText } from '@wordpress/block-editor';
import React from 'react';
import type { SaveProps, TierConfig, TierType } from './types';

/**
 * Tier badge configuration (matches current)
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
 * v1 - Original save without Interactivity API and useBlockProps wrapper
 *
 * Handles blocks created before the Interactivity API update.
 * Missing:
 * - wp-block-popup-maker-integration-feature wrapper class
 * - Interactivity API data attributes
 */
const v1 = {
	attributes: {
		tier: {
			type: 'string' as const,
			enum: ['free', 'pro', 'proplus'],
			default: 'free',
		},
		label: {
			type: 'string' as const,
			source: 'html' as const,
			selector: '.pm-integration-feature__label',
			default: '',
		},
		isOpen: {
			type: 'boolean' as const,
			default: false,
		},
		iconStyle: {
			type: 'string' as const,
			enum: ['chevron', 'plus-minus'],
			default: 'chevron',
		},
		showFreeBadge: {
			type: 'boolean' as const,
			default: false,
		},
	},
	save({ attributes }: SaveProps) {
		const { tier, label, iconStyle, showFreeBadge } = attributes;

		const innerBlocksProps = useInnerBlocksProps.save({
			className: 'pm-integration-feature__description',
		});

		const hasDescription =
			innerBlocksProps.children &&
			React.Children.count(innerBlocksProps.children) > 0;

		const currentTier = TIER_CONFIG[tier] || TIER_CONFIG.free;
		const icon = iconStyle === 'plus-minus' ? '+' : '▼';

		if (hasDescription) {
			return (
				<details className="pm-integration-feature has-description">
					<summary className="pm-integration-feature__header">
						{(tier !== 'free' || showFreeBadge) && (
							<span className={`pm-tier-badge ${currentTier.className}`}>
								{currentTier.label}
							</span>
						)}

						<RichText.Content
							tagName="span"
							className="pm-integration-feature__label"
							value={label}
						/>

						<span
							className="pm-integration-feature__icon"
							aria-hidden="true"
						>
							{icon}
						</span>
					</summary>

					<div {...innerBlocksProps} />
				</details>
			);
		}

		return (
			<div className="pm-integration-feature">
				<div className="pm-integration-feature__header">
					{(tier !== 'free' || showFreeBadge) && (
						<span className={`pm-tier-badge ${currentTier.className}`}>
							{currentTier.label}
						</span>
					)}

					<RichText.Content
						tagName="span"
						className="pm-integration-feature__label"
						value={label}
					/>
				</div>
			</div>
		);
	},
};

/**
 * v2 - Save with Interactivity API but without wp-block wrapper class and hasDescription attribute
 *
 * Handles blocks created after Interactivity API update but before hasDescription attribute.
 * Missing:
 * - wp-block-popup-maker-integration-feature wrapper class
 * - hasDescription attribute
 * - fontSize attribute
 */
const v2 = {
	attributes: {
		tier: {
			type: 'string' as const,
			enum: ['free', 'pro', 'proplus'],
			default: 'free',
		},
		label: {
			type: 'string' as const,
			source: 'html' as const,
			selector: '.pm-integration-feature__label',
			default: '',
		},
		isOpen: {
			type: 'boolean' as const,
			default: false,
		},
		iconStyle: {
			type: 'string' as const,
			enum: ['chevron', 'plus-minus'],
			default: 'chevron',
		},
		showFreeBadge: {
			type: 'boolean' as const,
			default: false,
		},
		fontSize: {
			type: 'string' as const,
			default: '1.6rem',
		},
	},
	save({ attributes }: SaveProps) {
		const { tier, label, iconStyle, showFreeBadge, fontSize } = attributes;

		const innerBlocksProps = useInnerBlocksProps.save({
			className: 'pm-integration-feature__description',
		});

		const hasDescription =
			innerBlocksProps.children &&
			React.Children.count(innerBlocksProps.children) > 0;

		const currentTier = TIER_CONFIG[tier] || TIER_CONFIG.free;
		const icon = iconStyle === 'plus-minus' ? '+' : '▼';

		if (hasDescription) {
			return (
				<details
					className="pm-integration-feature has-description"
					style={{ fontSize: fontSize || '1.6rem' }}
					data-wp-interactive="popup-maker/integration-feature"
					data-wp-context={JSON.stringify({ isOpen: false, iconStyle })}
				>
					<summary
						className="pm-integration-feature__header"
						data-wp-on--click="actions.toggle"
					>
						{(tier !== 'free' || showFreeBadge) && (
							<span className={`pm-tier-badge ${currentTier.className}`}>
								{currentTier.label}
							</span>
						)}

						<RichText.Content
							tagName="span"
							className="pm-integration-feature__label"
							value={label}
						/>

						<span
							className="pm-integration-feature__icon"
							aria-hidden="true"
							data-wp-text="callbacks.getIcon"
						>
							{icon}
						</span>
					</summary>

					<div {...innerBlocksProps} />
				</details>
			);
		}

		return (
			<div
				className="pm-integration-feature"
				style={{ fontSize: fontSize || '1.6rem' }}
			>
				<div className="pm-integration-feature__header">
					{(tier !== 'free' || showFreeBadge) && (
						<span className={`pm-tier-badge ${currentTier.className}`}>
							{currentTier.label}
						</span>
					)}

					<RichText.Content
						tagName="span"
						className="pm-integration-feature__label"
						value={label}
					/>
				</div>
			</div>
		);
	},
};

export default [v2, v1];
