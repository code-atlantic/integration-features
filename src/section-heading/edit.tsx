/**
 * Edit component for Section Heading block
 */

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	InspectorControls,
	PanelColorSettings,
	RichText,
	// @ts-ignore - LinkControl is experimental
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	Popover,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { link as linkIcon } from '@wordpress/icons';
import { useState, useEffect } from '@wordpress/element';
import React from 'react';

import type { EditProps } from './types';
import { isExternalUrl } from './types';

/**
 * Arrow Right Icon for internal links
 */
const ArrowRightIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		width="1em"
		height="1em"
	>
		<path
			fillRule="evenodd"
			d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
			clipRule="evenodd"
		/>
	</svg>
);

/**
 * External Link Icon for external links
 */
const ExternalLinkIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		width="1em"
		height="1em"
	>
		<path
			fillRule="evenodd"
			d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
			clipRule="evenodd"
		/>
		<path
			fillRule="evenodd"
			d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
			clipRule="evenodd"
		/>
	</svg>
);

/**
 * Edit component for Section Heading block
 */
export default function Edit({ attributes, setAttributes }: EditProps) {
	const {
		heading,
		headingTag,
		subtitle,
		viewAllLink,
		isExternalLink,
		headingColor,
		subtitleColor,
		linkColor,
	} = attributes;

	const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false);

	const hasLink = viewAllLink?.url && viewAllLink.url.trim().length > 0;

	/**
	 * Compute isExternal and sync to attribute when URL changes
	 * This ensures deterministic save output
	 */
	const computedIsExternal = hasLink ? isExternalUrl(viewAllLink.url) : false;
	useEffect(() => {
		if (computedIsExternal !== isExternalLink) {
			setAttributes({ isExternalLink: computedIsExternal });
		}
	}, [computedIsExternal, isExternalLink, setAttributes]);

	const blockProps = useBlockProps({
		className: 'pm-section-heading',
	});

	return (
		<>
			{/* Toolbar with Link Picker */}
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={linkIcon}
						label={__('View All Link', 'popup-maker')}
						onClick={() => setIsLinkPickerOpen(!isLinkPickerOpen)}
						isPressed={hasLink}
					/>
					{isLinkPickerOpen && (
						<Popover
							position="bottom center"
							onClose={() => setIsLinkPickerOpen(false)}
						>
							<div style={{ minWidth: '300px', padding: '16px' }}>
								<LinkControl
									value={viewAllLink}
									onChange={(newLink: typeof viewAllLink | null) =>
										setAttributes({
											viewAllLink: newLink || {
												url: '',
												opensInNewTab: false,
											},
										})
									}
									settings={[
										{
											id: 'opensInNewTab',
											title: __('Open in new tab', 'popup-maker'),
										},
									]}
								/>
							</div>
						</Popover>
					)}
				</ToolbarGroup>
			</BlockControls>

			{/* Sidebar Controls */}
			<InspectorControls>
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

				<PanelBody
					title={__('View All Link', 'popup-maker')}
					initialOpen={false}
				>
					<LinkControl
						value={viewAllLink}
						onChange={(newLink: typeof viewAllLink | null) =>
							setAttributes({
								viewAllLink: newLink || { url: '', opensInNewTab: false },
							})
						}
						settings={[
							{
								id: 'opensInNewTab',
								title: __('Open in new tab', 'popup-maker'),
							},
						]}
					/>
				</PanelBody>

				<PanelColorSettings
					title={__('Colors', 'popup-maker')}
					initialOpen={false}
					colorSettings={[
						{
							value: headingColor,
							onChange: (color: string | undefined) =>
								setAttributes({ headingColor: color || '' }),
							label: __('Heading', 'popup-maker'),
						},
						{
							value: subtitleColor,
							onChange: (color: string | undefined) =>
								setAttributes({ subtitleColor: color || '' }),
							label: __('Subtitle', 'popup-maker'),
						},
						{
							value: linkColor,
							onChange: (color: string | undefined) =>
								setAttributes({ linkColor: color || '' }),
							label: __('Link', 'popup-maker'),
						},
					]}
				/>
			</InspectorControls>

			{/* Block Content */}
			<div {...blockProps}>
				<div className="pm-section-heading__header">
					<RichText
						tagName={headingTag as any}
						value={heading}
						onChange={(value) => setAttributes({ heading: value })}
						placeholder={__('Section heading...', 'popup-maker')}
						className="pm-section-heading__title"
						style={{ color: headingColor || undefined }}
						allowedFormats={['core/bold', 'core/italic']}
					/>
					{hasLink && (
						<span
							className="pm-section-heading__link"
							style={{ color: linkColor || undefined }}
						>
							{__('View all', 'popup-maker')}
							{isExternalLink ? <ExternalLinkIcon /> : <ArrowRightIcon />}
						</span>
					)}
				</div>
				<RichText
					tagName="p"
					value={subtitle}
					onChange={(value) => setAttributes({ subtitle: value })}
					placeholder={__('Optional subtitle...', 'popup-maker')}
					className="pm-section-heading__subtitle"
					style={{ color: subtitleColor || undefined }}
					allowedFormats={['core/bold', 'core/italic', 'core/link']}
				/>
			</div>
		</>
	);
}
