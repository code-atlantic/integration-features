import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToolbarDropdownMenu,
	PanelBody,
	FontSizePicker,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo, useEffect } from '@wordpress/element';
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
export default function Edit({ attributes, setAttributes, clientId, isSelected }: EditProps) {
	const { tier, label, isOpen, iconStyle, showFreeBadge, fontSize } = attributes;

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
	 * Check if any inner blocks are selected (separate selector to avoid shape conflicts)
	 */
	const hasSelectedInnerBlock = useSelect(
		(select) => {
			const blockEditor = select('core/block-editor') as any;
			return blockEditor?.hasSelectedInnerBlock(clientId, true) || false;
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
	 * Check if user is actively editing (typing, using block inserter, etc.)
	 */
	const isActivelyEditing = useSelect(
		(select) => {
			const blockEditor = select('core/block-editor') as any;
			// Check if block inserter is open (user typed "/" or clicked add block)
			const isInserterOpened = blockEditor?.isBlockInserterOpen?.() || false;
			return isInserterOpened;
		},
		[]
	);

	/**
	 * Auto-collapse when block is deselected
	 * BUT NOT when:
	 * - Inner blocks are selected
	 * - User is actively editing (block inserter open, typing "/" etc.)
	 */
	useEffect(() => {
		if (!isSelected && !hasSelectedInnerBlock && !isActivelyEditing && isOpen && hasDescription) {
			setAttributes({ isOpen: false });
		}
	}, [isSelected, hasSelectedInnerBlock, isActivelyEditing, isOpen, hasDescription, setAttributes]);

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
	 * Prevents toggling when clicking inside inner blocks
	 */
	const toggleOpen = (e: React.MouseEvent) => {
		// Only toggle if clicking directly on header elements, not inner content
		const target = e.target as HTMLElement;

		// Don't toggle if clicking inside the description panel
		if (target.closest('.pm-integration-feature__panel')) {
			return;
		}

		// Don't toggle if clicking on an inner block
		if (target.closest('.block-editor-block-list__block')) {
			return;
		}

		setAttributes({ isOpen: !isOpen });
	};

	/**
	 * Get accordion icon based on style and open state
	 */
	const getIcon = () => {
		if (iconStyle === 'plus-minus') {
			return isOpen ? '−' : '+';
		}
		return isOpen ? '▲' : '▼';
	};

	/**
	 * Block wrapper props
	 */
	const blockProps = useBlockProps({
		className: `pm-integration-feature ${hasDescription ? 'has-description' : ''} ${isOpen ? 'is-open' : ''}`,
		style: {
			fontSize: fontSize || '1.6rem',
		},
	});

	/**
	 * Predefined font sizes
	 */
	const fontSizes = [
		{
			name: __('Small', 'popup-maker'),
			size: '1.4rem',
			slug: 'small',
		},
		{
			name: __('Normal', 'popup-maker'),
			size: '1.6rem',
			slug: 'normal',
		},
		{
			name: __('Medium', 'popup-maker'),
			size: '1.8rem',
			slug: 'medium',
		},
		{
			name: __('Large', 'popup-maker'),
			size: '2rem',
			slug: 'large',
		},
	];

	/**
	 * InnerBlocks configuration
	 */
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'pm-integration-feature__description',
		},
		{
			template: [],
			templateLock: false,
			allowedBlocks: ['core/paragraph', 'core/list', 'core/heading'],
			placeholder: __('Add optional description...', 'popup-maker'),
		}
	);

	/**
	 * Current tier configuration
	 */
	const currentTier = TIER_CONFIG[tier];

	return (
		<>
			{/* Inspector Controls - Sidebar Settings */}
			<InspectorControls>
				<PanelBody title={__('Typography', 'popup-maker')} initialOpen={true}>
					<FontSizePicker
						fontSizes={fontSizes}
						value={fontSize}
						onChange={(newSize) => setAttributes({ fontSize: newSize || '1.6rem' })}
						withReset={true}
						resetFallbackFontSize="1.6rem"
					/>
				</PanelBody>
			</InspectorControls>

			{/* Format Toolbar - Tier Badge and Icon Style Selectors */}
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
				{tier === 'free' && (
					<ToolbarGroup>
						<ToolbarDropdownMenu
							icon="visibility"
							label={__('FREE Badge Visibility', 'popup-maker')}
							controls={[
								{
									title: __('Show FREE Badge', 'popup-maker'),
									isActive: showFreeBadge,
									onClick: () => setAttributes({ showFreeBadge: true }),
								},
								{
									title: __('Hide FREE Badge', 'popup-maker'),
									isActive: !showFreeBadge,
									onClick: () => setAttributes({ showFreeBadge: false }),
								},
							]}
						/>
					</ToolbarGroup>
				)}
				{hasDescription && (
					<ToolbarGroup>
						<ToolbarDropdownMenu
							icon="admin-settings"
							label={__('Icon Style', 'popup-maker')}
							controls={[
								{
									title: __('Chevron (▼/▲)', 'popup-maker'),
									isActive: iconStyle === 'chevron',
									onClick: () => setAttributes({ iconStyle: 'chevron' }),
								},
								{
									title: __('Plus/Minus (+/−)', 'popup-maker'),
									isActive: iconStyle === 'plus-minus',
									onClick: () => setAttributes({ iconStyle: 'plus-minus' }),
								},
							]}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>

			{/* Block Content */}
			<div {...blockProps}>
				{/* Accordion Header / Summary */}
				<div className="pm-integration-feature__header">
					{/* Tier Badge - conditionally hidden for FREE tier */}
					{(tier !== 'free' || showFreeBadge) && (
						<span className={`pm-tier-badge ${currentTier.className}`}>
							{currentTier.label}
						</span>
					)}

					{/* Editable Label */}
					<RichText
						tagName="span"
						className="pm-integration-feature__label"
						value={label}
						onChange={onChangeLabel}
						placeholder={__('Feature name...', 'popup-maker')}
						allowedFormats={['core/bold', 'core/italic', 'core/code']}
					/>

					{/* Accordion Icon (only if has description) - clickable toggle */}
					{hasDescription && (
						<span
							className="pm-integration-feature__icon"
							aria-hidden="true"
							onClick={toggleOpen}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									toggleOpen(e as any);
								}
							}}
							role="button"
							tabIndex={0}
							aria-expanded={isOpen}
							aria-label={isOpen ? __('Collapse description', 'popup-maker') : __('Expand description', 'popup-maker')}
							style={{ cursor: 'pointer' }}
						>
							{getIcon()}
						</span>
					)}
				</div>

				{/* Description Panel (InnerBlocks) - Always show when selected, open, or has selected inner block */}
				{(hasDescription || isSelected || hasSelectedInnerBlock) && (
					<div
						id={`pm-feature-${clientId}`}
						className={`pm-integration-feature__panel ${isOpen || isSelected || hasSelectedInnerBlock ? 'is-visible' : 'is-hidden'}`}
						role="region"
						aria-labelledby={`pm-feature-header-${clientId}`}
					>
						{!hasDescription && isSelected && (
							<div className="pm-integration-feature__placeholder">
								<p>{__('Add content below to create an accordion description.', 'popup-maker')}</p>
							</div>
						)}
						<div {...innerBlocksProps} />
					</div>
				)}
			</div>
		</>
	);
}
