import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
	BlockControls,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToolbarDropdownMenu,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import React from 'react';

import type { EditProps, TierConfig, TierType, WPBlock } from './types';
import { computeHasDescription } from './lib/hasDescription';
import './editor.scss';

/**
 * Tier badge configuration
 */
const TIER_CONFIG: Record<TierType, TierConfig> = {
	free: {
		label: __('FREE', 'popup-maker'),
		className: 'pm-tier-badge--free',
		icon: 'admin-plugins',
	},
	pro: {
		label: __('PRO', 'popup-maker'),
		className: 'pm-tier-badge--pro',
		icon: 'star-filled',
	},
	proplus: {
		label: __('PRO+', 'popup-maker'),
		className: 'pm-tier-badge--proplus',
		icon: 'awards',
	},
};

/**
 * Edit component for Integration Feature block
 *
 * Uses derived state pattern for hasDescription to avoid useEffect feedback loops
 */
export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	const { tier, label, isOpen } = attributes;

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
	 * DERIVED STATE: Compute hasDescription from inner blocks
	 * No useEffect, no setAttributes, no feedback loops
	 */
	const hasDescription = useMemo(
		() => computeHasDescription(innerBlocks || []),
		[innerBlocks]
	);

	/**
	 * Tier selection handler
	 */
	const onChangeTier = (newTier: TierType) => {
		setAttributes({ tier: newTier });
	};

	/**
	 * Label change handler
	 */
	const onChangeLabel = (newLabel: string) => {
		setAttributes({ label: newLabel });
	};

	/**
	 * Toggle accordion open state (editor only)
	 */
	const toggleOpen = () => {
		setAttributes({ isOpen: !isOpen });
	};

	/**
	 * Block wrapper props
	 */
	const blockProps = useBlockProps({
		className: `pm-integration-feature ${hasDescription ? 'has-description' : ''} ${isOpen ? 'is-open' : ''}`,
	});

	/**
	 * InnerBlocks configuration
	 */
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'pm-integration-feature__description',
		},
		{
			template: [
				['core/paragraph', { placeholder: __('Add optional description...', 'popup-maker') }],
			],
			templateLock: false,
			allowedBlocks: ['core/paragraph', 'core/list', 'core/heading'],
		}
	);

	/**
	 * Current tier configuration
	 */
	const currentTier = TIER_CONFIG[tier];

	return (
		<>
			{/* Format Toolbar - Tier Badge Selector */}
			<BlockControls>
				<ToolbarGroup>
					<ToolbarDropdownMenu
						icon={currentTier.icon as any}
						label={__('Select Tier', 'popup-maker')}
						controls={Object.entries(TIER_CONFIG).map(([tierKey, tierData]) => ({
							title: tierData.label,
							isActive: tier === tierKey,
							onClick: () => onChangeTier(tierKey as TierType),
						}))}
					/>
				</ToolbarGroup>
			</BlockControls>

			{/* Block Content */}
			<div {...blockProps}>
				{/* Accordion Header / Summary */}
				<div
					className="pm-integration-feature__header"
					onClick={hasDescription ? toggleOpen : undefined}
					role={hasDescription ? 'button' : undefined}
					tabIndex={hasDescription ? 0 : undefined}
					aria-expanded={hasDescription ? isOpen : undefined}
					aria-controls={hasDescription ? `pm-feature-${clientId}` : undefined}
					onKeyDown={
						hasDescription
							? (e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										toggleOpen();
									}
							  }
							: undefined
					}
				>
					{/* Tier Badge */}
					<span className={`pm-tier-badge ${currentTier.className}`}>
						{currentTier.label}
					</span>

					{/* Editable Label */}
					<RichText
						tagName="span"
						className="pm-integration-feature__label"
						value={label}
						onChange={onChangeLabel}
						placeholder={__('Feature name...', 'popup-maker')}
						allowedFormats={['core/bold', 'core/italic', 'core/code']}
					/>

					{/* Accordion Icon (only if has description) */}
					{hasDescription && (
						<span className="pm-integration-feature__icon" aria-hidden="true">
							{isOpen ? '▲' : '▼'}
						</span>
					)}
				</div>

				{/* Description Panel (InnerBlocks) */}
				{hasDescription && (
					<div
						id={`pm-feature-${clientId}`}
						className={`pm-integration-feature__panel ${isOpen ? 'is-visible' : 'is-hidden'}`}
						role="region"
						aria-labelledby={`pm-feature-header-${clientId}`}
					>
						<div {...innerBlocksProps} />
					</div>
				)}

				{/* Placeholder when no description */}
				{!hasDescription && (
					<div className="pm-integration-feature__placeholder">
						<p>{__('Add content below to create an accordion description.', 'popup-maker')}</p>
						<div {...innerBlocksProps} />
					</div>
				)}
			</div>
		</>
	);
}
