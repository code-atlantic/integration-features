/**
 * Save component for Section Heading block
 */

import { useBlockProps, RichText } from '@wordpress/block-editor';
import React from 'react';

import type { SaveProps } from './types';

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
		aria-hidden="true"
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
		aria-hidden="true"
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
 * Save component for Section Heading block
 */
export default function Save({ attributes }: SaveProps) {
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

	const blockProps = useBlockProps.save({
		className: 'pm-section-heading',
	});

	const hasLink = viewAllLink?.url && viewAllLink.url.trim().length > 0;
	const opensInNewTab = viewAllLink?.opensInNewTab;

	return (
		<div {...blockProps}>
			<div className="pm-section-heading__header">
				{heading && (
					<RichText.Content
						tagName={headingTag as any}
						className="pm-section-heading__title pm-toc-heading"
						value={heading}
						style={{ color: headingColor || undefined }}
					/>
				)}
				{hasLink && (
					<a
						href={viewAllLink.url}
						className="pm-section-heading__link"
						target={opensInNewTab ? '_blank' : undefined}
						rel={opensInNewTab ? 'noopener noreferrer' : undefined}
						style={{ color: linkColor || undefined }}
					>
						View all
						{isExternalLink ? <ExternalLinkIcon /> : <ArrowRightIcon />}
					</a>
				)}
			</div>
			{subtitle && (
				<RichText.Content
					tagName="p"
					className="pm-section-heading__subtitle"
					value={subtitle}
					style={{ color: subtitleColor || undefined }}
				/>
			)}
		</div>
	);
}
