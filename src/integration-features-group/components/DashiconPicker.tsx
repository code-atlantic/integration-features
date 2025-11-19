/**
 * DashiconPicker Component
 *
 * A visual icon picker that displays WordPress Dashicons in a grid
 * with a dropdown button interface and search functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import './dashicon-picker.scss';

export interface DashiconPickerProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	color?: string;
	onColorChange?: (color: string) => void;
	backgroundColor?: string;
	onBackgroundColorChange?: (color: string) => void;
}

const DASHICONS = [
	'dashicons-hammer',
	'dashicons-menu',
	'dashicons-menu-alt',
	'dashicons-menu-alt2',
	'dashicons-menu-alt3',
	'dashicons-admin-site',
	'dashicons-admin-site-alt',
	'dashicons-admin-site-alt2',
	'dashicons-admin-site-alt3',
	'dashicons-dashboard',
	'dashicons-admin-post',
	'dashicons-admin-media',
	'dashicons-admin-links',
	'dashicons-admin-page',
	'dashicons-admin-comments',
	'dashicons-admin-appearance',
	'dashicons-admin-plugins',
	'dashicons-plugins-checked',
	'dashicons-admin-users',
	'dashicons-admin-tools',
	'dashicons-admin-settings',
	'dashicons-admin-network',
	'dashicons-admin-home',
	'dashicons-admin-generic',
	'dashicons-admin-collapse',
	'dashicons-filter',
	'dashicons-admin-customizer',
	'dashicons-admin-multisite',
	'dashicons-welcome-write-blog',
	'dashicons-welcome-add-page',
	'dashicons-welcome-view-site',
	'dashicons-welcome-widgets-menus',
	'dashicons-welcome-comments',
	'dashicons-welcome-learn-more',
	'dashicons-format-aside',
	'dashicons-format-image',
	'dashicons-format-gallery',
	'dashicons-format-video',
	'dashicons-format-status',
	'dashicons-format-quote',
	'dashicons-format-chat',
	'dashicons-format-audio',
	'dashicons-camera',
	'dashicons-camera-alt',
	'dashicons-images-alt',
	'dashicons-images-alt2',
	'dashicons-video-alt',
	'dashicons-video-alt2',
	'dashicons-video-alt3',
	'dashicons-media-archive',
	'dashicons-media-audio',
	'dashicons-media-code',
	'dashicons-media-default',
	'dashicons-media-document',
	'dashicons-media-interactive',
	'dashicons-media-spreadsheet',
	'dashicons-media-text',
	'dashicons-media-video',
	'dashicons-playlist-audio',
	'dashicons-playlist-video',
	'dashicons-controls-play',
	'dashicons-controls-pause',
	'dashicons-controls-forward',
	'dashicons-controls-skipforward',
	'dashicons-controls-back',
	'dashicons-controls-skipback',
	'dashicons-controls-repeat',
	'dashicons-controls-volumeon',
	'dashicons-controls-volumeoff',
	'dashicons-image-crop',
	'dashicons-image-rotate',
	'dashicons-image-rotate-left',
	'dashicons-image-rotate-right',
	'dashicons-image-flip-vertical',
	'dashicons-image-flip-horizontal',
	'dashicons-image-filter',
	'dashicons-undo',
	'dashicons-redo',
	'dashicons-database-add',
	'dashicons-database',
	'dashicons-database-export',
	'dashicons-database-import',
	'dashicons-database-remove',
	'dashicons-database-view',
	'dashicons-align-full-width',
	'dashicons-align-pull-left',
	'dashicons-align-pull-right',
	'dashicons-align-wide',
	'dashicons-block-default',
	'dashicons-button',
	'dashicons-cloud-saved',
	'dashicons-cloud-upload',
	'dashicons-columns',
	'dashicons-cover-image',
	'dashicons-ellipsis',
	'dashicons-embed-audio',
	'dashicons-embed-generic',
	'dashicons-embed-photo',
	'dashicons-embed-post',
	'dashicons-embed-video',
	'dashicons-exit',
	'dashicons-heading',
	'dashicons-html',
	'dashicons-info-outline',
	'dashicons-insert',
	'dashicons-insert-after',
	'dashicons-insert-before',
	'dashicons-remove',
	'dashicons-saved',
	'dashicons-shortcode',
	'dashicons-table-col-after',
	'dashicons-table-col-before',
	'dashicons-table-col-delete',
	'dashicons-table-row-after',
	'dashicons-table-row-before',
	'dashicons-table-row-delete',
	'dashicons-editor-bold',
	'dashicons-editor-italic',
	'dashicons-editor-ul',
	'dashicons-editor-ol',
	'dashicons-editor-ol-rtl',
	'dashicons-editor-quote',
	'dashicons-editor-alignleft',
	'dashicons-editor-aligncenter',
	'dashicons-editor-alignright',
	'dashicons-editor-insertmore',
	'dashicons-editor-spellcheck',
	'dashicons-editor-expand',
	'dashicons-editor-contract',
	'dashicons-editor-kitchensink',
	'dashicons-editor-underline',
	'dashicons-editor-justify',
	'dashicons-editor-textcolor',
	'dashicons-editor-paste-word',
	'dashicons-editor-paste-text',
	'dashicons-editor-removeformatting',
	'dashicons-editor-video',
	'dashicons-editor-customchar',
	'dashicons-editor-outdent',
	'dashicons-editor-indent',
	'dashicons-editor-help',
	'dashicons-editor-strikethrough',
	'dashicons-editor-unlink',
	'dashicons-editor-rtl',
	'dashicons-editor-ltr',
	'dashicons-editor-break',
	'dashicons-editor-code',
	'dashicons-editor-paragraph',
	'dashicons-editor-table',
	'dashicons-align-left',
	'dashicons-align-right',
	'dashicons-align-center',
	'dashicons-align-none',
	'dashicons-lock',
	'dashicons-unlock',
	'dashicons-calendar',
	'dashicons-calendar-alt',
	'dashicons-visibility',
	'dashicons-hidden',
	'dashicons-post-status',
	'dashicons-edit',
	'dashicons-trash',
	'dashicons-sticky',
	'dashicons-external',
	'dashicons-arrow-up',
	'dashicons-arrow-down',
	'dashicons-arrow-right',
	'dashicons-arrow-left',
	'dashicons-arrow-up-alt',
	'dashicons-arrow-down-alt',
	'dashicons-arrow-right-alt',
	'dashicons-arrow-left-alt',
	'dashicons-arrow-up-alt2',
	'dashicons-arrow-down-alt2',
	'dashicons-arrow-right-alt2',
	'dashicons-arrow-left-alt2',
	'dashicons-sort',
	'dashicons-leftright',
	'dashicons-randomize',
	'dashicons-list-view',
	'dashicons-excerpt-view',
	'dashicons-grid-view',
	'dashicons-move',
	'dashicons-share',
	'dashicons-share-alt',
	'dashicons-share-alt2',
	'dashicons-rss',
	'dashicons-email',
	'dashicons-email-alt',
	'dashicons-email-alt2',
	'dashicons-networking',
	'dashicons-amazon',
	'dashicons-facebook',
	'dashicons-facebook-alt',
	'dashicons-google',
	'dashicons-instagram',
	'dashicons-linkedin',
	'dashicons-pinterest',
	'dashicons-podio',
	'dashicons-reddit',
	'dashicons-spotify',
	'dashicons-twitch',
	'dashicons-twitter',
	'dashicons-twitter-alt',
	'dashicons-whatsapp',
	'dashicons-xing',
	'dashicons-youtube',
	'dashicons-art',
	'dashicons-migrate',
	'dashicons-performance',
	'dashicons-universal-access',
	'dashicons-universal-access-alt',
	'dashicons-tickets',
	'dashicons-nametag',
	'dashicons-clipboard',
	'dashicons-heart',
	'dashicons-megaphone',
	'dashicons-schedule',
	'dashicons-tide',
	'dashicons-rest-api',
	'dashicons-code-standards',
	'dashicons-buddicons-activity',
	'dashicons-buddicons-bbpress-logo',
	'dashicons-buddicons-buddypress-logo',
	'dashicons-buddicons-community',
	'dashicons-buddicons-forums',
	'dashicons-buddicons-friends',
	'dashicons-buddicons-groups',
	'dashicons-buddicons-pm',
	'dashicons-buddicons-replies',
	'dashicons-buddicons-topics',
	'dashicons-buddicons-tracking',
	'dashicons-wordpress',
	'dashicons-wordpress-alt',
	'dashicons-pressthis',
	'dashicons-update',
	'dashicons-update-alt',
	'dashicons-screenoptions',
	'dashicons-info',
	'dashicons-cart',
	'dashicons-feedback',
	'dashicons-cloud',
	'dashicons-translation',
	'dashicons-tag',
	'dashicons-category',
	'dashicons-archive',
	'dashicons-tagcloud',
	'dashicons-text',
	'dashicons-bell',
	'dashicons-yes',
	'dashicons-yes-alt',
	'dashicons-no',
	'dashicons-no-alt',
	'dashicons-plus',
	'dashicons-plus-alt',
	'dashicons-plus-alt2',
	'dashicons-minus',
	'dashicons-dismiss',
	'dashicons-marker',
	'dashicons-star-filled',
	'dashicons-star-half',
	'dashicons-star-empty',
	'dashicons-flag',
	'dashicons-warning',
	'dashicons-location',
	'dashicons-location-alt',
	'dashicons-vault',
	'dashicons-shield',
	'dashicons-shield-alt',
	'dashicons-sos',
	'dashicons-search',
	'dashicons-slides',
	'dashicons-text-page',
	'dashicons-analytics',
	'dashicons-chart-pie',
	'dashicons-chart-bar',
	'dashicons-chart-line',
	'dashicons-chart-area',
	'dashicons-groups',
	'dashicons-businessman',
	'dashicons-businesswoman',
	'dashicons-businessperson',
	'dashicons-id',
	'dashicons-id-alt',
	'dashicons-products',
	'dashicons-awards',
	'dashicons-forms',
	'dashicons-testimonial',
	'dashicons-portfolio',
	'dashicons-book',
	'dashicons-book-alt',
	'dashicons-download',
	'dashicons-upload',
	'dashicons-backup',
	'dashicons-clock',
	'dashicons-lightbulb',
	'dashicons-microphone',
	'dashicons-desktop',
	'dashicons-laptop',
	'dashicons-tablet',
	'dashicons-smartphone',
	'dashicons-phone',
	'dashicons-index-card',
	'dashicons-carrot',
	'dashicons-building',
	'dashicons-store',
	'dashicons-album',
	'dashicons-palmtree',
	'dashicons-tickets-alt',
	'dashicons-money',
	'dashicons-money-alt',
	'dashicons-smiley',
	'dashicons-thumbs-up',
	'dashicons-thumbs-down',
	'dashicons-layout',
	'dashicons-paperclip',
	'dashicons-color-picker',
	'dashicons-edit-large',
	'dashicons-edit-page',
	'dashicons-airplane',
	'dashicons-bank',
	'dashicons-beer',
	'dashicons-calculator',
	'dashicons-car',
	'dashicons-coffee',
	'dashicons-drumstick',
	'dashicons-food',
	'dashicons-fullscreen-alt',
	'dashicons-fullscreen-exit-alt',
	'dashicons-games',
	'dashicons-hourglass',
	'dashicons-open-folder',
	'dashicons-pdf',
	'dashicons-pets',
	'dashicons-printer',
	'dashicons-privacy',
	'dashicons-superhero',
	'dashicons-superhero-alt',
];

export default function DashiconPicker({
	value,
	onChange,
	label = __('Select Icon', 'popup-maker'),
	color = '#1e1e1e',
	onColorChange,
	backgroundColor = '',
	onBackgroundColorChange,
}: DashiconPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [pendingColor, setPendingColor] = useState(color);
	const [pendingBgColor, setPendingBgColor] = useState(backgroundColor);
	const pickerRef = useRef<HTMLDivElement>(null);

	// Debounce color changes to avoid lag
	useEffect(() => {
		const timer = setTimeout(() => {
			if (pendingColor !== color && onColorChange) {
				onColorChange(pendingColor);
			}
		}, 200);
		return () => clearTimeout(timer);
	}, [pendingColor, color, onColorChange]);

	// Debounce background color changes
	useEffect(() => {
		const timer = setTimeout(() => {
			if (pendingBgColor !== backgroundColor && onBackgroundColorChange) {
				onBackgroundColorChange(pendingBgColor);
			}
		}, 200);
		return () => clearTimeout(timer);
	}, [pendingBgColor, backgroundColor, onBackgroundColorChange]);

	// Close popover when clicking outside
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	const handleIconClick = (icon: string) => {
		onChange(icon);
		setIsOpen(false);
		setSearchTerm('');
	};

	const filteredIcons = searchTerm
		? DASHICONS.filter((icon) =>
				icon.toLowerCase().includes(searchTerm.toLowerCase())
		  )
		: DASHICONS;

	return (
		<div className="pm-dashicon-picker" ref={pickerRef}>
			{/* Dropdown Button */}
			<Button
				className="pm-dashicon-picker__button"
				onClick={() => setIsOpen(!isOpen)}
			>
				{value && (
					<i
						className={`dashicons ${value}`}
						style={{ color }}
						aria-hidden="true"
					/>
				)}
				<span>{label}</span>
			</Button>

			{/* Icon Grid with Search and Color Picker */}
			{isOpen && (
				<div className="pm-dashicon-picker__dropdown">
					{/* Search and Color Picker Bar */}
					<div className="pm-dashicon-picker__toolbar">
						{/* Search Input */}
						<input
							type="text"
							placeholder={__('Search icons...', 'popup-maker')}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pm-dashicon-picker__search-input"
							aria-label={__('Search icons', 'popup-maker')}
							autoFocus
						/>

						{/* Color Picker */}
						{onColorChange && (
							<div className="pm-dashicon-picker__color-picker">
								<label htmlFor="pm-dashicon-picker__color">
									{__('Color', 'popup-maker')}
								</label>
								<input
									id="pm-dashicon-picker__color"
									type="color"
									value={pendingColor}
									onChange={(e) => setPendingColor(e.target.value)}
									className="pm-dashicon-picker__color-input"
									aria-label={__('Icon Color', 'popup-maker')}
									title={pendingColor}
								/>
							</div>
						)}

						{/* Background Color Picker */}
						{onBackgroundColorChange && (
							<div className="pm-dashicon-picker__color-picker">
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									<label htmlFor="pm-dashicon-picker__bg-color">
										{__('Background', 'popup-maker')}
									</label>
									<input
										id="pm-dashicon-picker__bg-color"
										type="color"
										value={pendingBgColor || color + '33'}
										onChange={(e) => setPendingBgColor(e.target.value)}
										className="pm-dashicon-picker__color-input"
										aria-label={__('Icon Background Color', 'popup-maker')}
										title={pendingBgColor || __('Default (icon color with opacity)', 'popup-maker')}
									/>
									{pendingBgColor && (
										<Button
											isSmall
											isDestructive
											onClick={() => setPendingBgColor('')}
											title={__('Clear background color', 'popup-maker')}
											aria-label={__('Clear background color', 'popup-maker')}
										>
											×
										</Button>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Icons Grid */}
					<div className="pm-dashicon-picker__grid">
						{filteredIcons.length > 0 ? (
							filteredIcons.map((icon) => (
								<Button
									key={icon}
									className={`pm-dashicon-picker__icon ${
										value === icon
											? 'pm-dashicon-picker__icon--active'
											: ''
									}`}
									onClick={() => handleIconClick(icon)}
									title={icon}
								>
									<i
										className={`dashicons ${icon}`}
										style={{ color }}
										aria-hidden="true"
									/>
								</Button>
							))
						) : (
							<div className="pm-dashicon-picker__no-results">
								{__('No icons found', 'popup-maker')}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
