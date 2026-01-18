/**
 * Edit component for Category Integrations block
 */

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	RangeControl,
	TextControl,
	Spinner,
	ButtonGroup,
	Button,
} from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import React from 'react';

import type { EditProps, CategoryTerm } from './types';
import { getCategoryIcon } from './types';
import './editor.scss';

/**
 * Edit component for Category Integrations block
 */
export default function Edit({
	attributes,
	setAttributes,
}: EditProps) {
	const {
		categoryId,
		categorySlug,
		displayMode,
		teaseCount,
		groupIcon,
		groupIconColor,
		groupIconBackgroundColor,
		headingOverride,
		headingTag,
		subheadingOverride,
		headerBackgroundColor,
		headingColor,
		subheadingColor,
		autoExcludeCurrent,
		teaseExpandMode,
	} = attributes;

	// Fetch available integration categories.
	const [categories, setCategories] = useState<CategoryTerm[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		apiFetch<CategoryTerm[]>({
			path: '/wp/v2/integration_category?per_page=100&orderby=name&order=asc',
		})
			.then((data) => {
				setCategories(data);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch categories:', error);
				setIsLoading(false);
			});
	}, []);

	// When category changes, update icon if not overridden.
	useEffect(() => {
		if (categorySlug && !groupIcon) {
			const autoIcon = getCategoryIcon(categorySlug);
			setAttributes({ groupIcon: autoIcon });
		}
	}, [categorySlug, groupIcon, setAttributes]);

	// Build category options for dropdown.
	const categoryOptions = [
		{ label: __('Select a category...', 'popup-maker'), value: '' },
		...categories.map((cat) => ({
			label: `${cat.name} (${cat.count})`,
			value: cat.id.toString(),
		})),
	];

	// Handle category selection.
	const handleCategoryChange = (value: string) => {
		const id = parseInt(value, 10) || 0;
		const selectedCat = categories.find((cat) => cat.id === id);

		setAttributes({
			categoryId: id,
			categorySlug: selectedCat?.slug || '',
			// Reset icon to auto-detect on category change.
			groupIcon: selectedCat ? getCategoryIcon(selectedCat.slug) : '',
		});
	};

	const blockProps = useBlockProps({
		className: 'pm-category-integrations-editor',
	});

	return (
		<>
			<InspectorControls>
				{/* Category Selection */}
				<PanelBody
					title={__('Category Settings', 'popup-maker')}
					initialOpen={true}
				>
					{isLoading ? (
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<Spinner />
							<span>{__('Loading categories...', 'popup-maker')}</span>
						</div>
					) : (
						<SelectControl
							label={__('Integration Category', 'popup-maker')}
							value={categoryId.toString()}
							options={categoryOptions}
							onChange={handleCategoryChange}
							help={__(
								'Select which category of integrations to display',
								'popup-maker'
							)}
						/>
					)}

					<ToggleControl
						label={__('Auto-exclude current integration', 'popup-maker')}
						help={__(
							'On single integration pages, hide the current integration from the list',
							'popup-maker'
						)}
						checked={autoExcludeCurrent}
						onChange={(value) =>
							setAttributes({ autoExcludeCurrent: value })
						}
					/>
				</PanelBody>

				{/* Display Mode */}
				<PanelBody
					title={__('Display Settings', 'popup-maker')}
					initialOpen={true}
				>
					<label
						style={{
							display: 'block',
							marginBottom: '8px',
							fontSize: '11px',
							fontWeight: 500,
							textTransform: 'uppercase',
						}}
					>
						{__('Display Mode', 'popup-maker')}
					</label>
					<ButtonGroup style={{ marginBottom: '16px' }}>
						<Button
							variant={displayMode === 'expanded' ? 'primary' : 'secondary'}
							onClick={() => setAttributes({ displayMode: 'expanded' })}
						>
							{__('Expanded', 'popup-maker')}
						</Button>
						<Button
							variant={displayMode === 'collapsed' ? 'primary' : 'secondary'}
							onClick={() => setAttributes({ displayMode: 'collapsed' })}
						>
							{__('Collapsed', 'popup-maker')}
						</Button>
						<Button
							variant={displayMode === 'tease' ? 'primary' : 'secondary'}
							onClick={() => setAttributes({ displayMode: 'tease' })}
						>
							{__('Tease', 'popup-maker')}
						</Button>
					</ButtonGroup>

					{displayMode === 'tease' && (
						<>
							<RangeControl
								label={__('Number to show initially', 'popup-maker')}
								value={teaseCount}
								onChange={(value) =>
									setAttributes({ teaseCount: value || 3 })
								}
								min={1}
								max={10}
							/>

							<label
								style={{
									display: 'block',
									marginBottom: '8px',
									fontSize: '11px',
									fontWeight: 500,
									textTransform: 'uppercase',
								}}
							>
								{__('"View All" Behavior', 'popup-maker')}
							</label>
							<ButtonGroup style={{ marginBottom: '16px' }}>
								<Button
									variant={teaseExpandMode === 'link' ? 'primary' : 'secondary'}
									onClick={() => setAttributes({ teaseExpandMode: 'link' })}
								>
									{__('Link to Archive', 'popup-maker')}
								</Button>
								<Button
									variant={teaseExpandMode === 'inline' ? 'primary' : 'secondary'}
									onClick={() => setAttributes({ teaseExpandMode: 'inline' })}
								>
									{__('Expand Inline', 'popup-maker')}
								</Button>
							</ButtonGroup>
						</>
					)}
				</PanelBody>

				{/* Heading Settings */}
				<PanelBody
					title={__('Content Overrides', 'popup-maker')}
					initialOpen={false}
				>
					<TextControl
						label={__('Heading Override', 'popup-maker')}
						help={__(
							'Leave empty to use the category name',
							'popup-maker'
						)}
						value={headingOverride}
						onChange={(value) =>
							setAttributes({ headingOverride: value })
						}
					/>

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

					<TextControl
						label={__('Subheading Override', 'popup-maker')}
						help={__(
							'Leave empty to use the category description',
							'popup-maker'
						)}
						value={subheadingOverride}
						onChange={(value) =>
							setAttributes({ subheadingOverride: value })
						}
					/>
				</PanelBody>

				{/* Icon Settings */}
				<PanelBody
					title={__('Icon Settings', 'popup-maker')}
					initialOpen={false}
				>
					<TextControl
						label={__('Icon Class', 'popup-maker')}
						help={__(
							'Dashicon class (e.g., dashicons-feedback). Leave empty to auto-detect.',
							'popup-maker'
						)}
						value={groupIcon}
						onChange={(value) => setAttributes({ groupIcon: value })}
					/>

					<PanelColorSettings
						title={__('Icon Colors', 'popup-maker')}
						initialOpen={true}
						colorSettings={[
							{
								value: groupIconColor,
								onChange: (color) =>
									setAttributes({ groupIconColor: color || '#1dbe61' }),
								label: __('Icon Color', 'popup-maker'),
							},
							{
								value: groupIconBackgroundColor,
								onChange: (color) =>
									setAttributes({ groupIconBackgroundColor: color || '' }),
								label: __('Icon Background', 'popup-maker'),
							},
						]}
					/>
				</PanelBody>

				{/* Header Colors */}
				<PanelColorSettings
					title={__('Header Colors', 'popup-maker')}
					initialOpen={false}
					colorSettings={[
						{
							value: headerBackgroundColor,
							onChange: (color) =>
								setAttributes({ headerBackgroundColor: color || '' }),
							label: __('Header Background', 'popup-maker'),
						},
						{
							value: headingColor,
							onChange: (color) =>
								setAttributes({ headingColor: color || '' }),
							label: __('Heading Text', 'popup-maker'),
						},
						{
							value: subheadingColor,
							onChange: (color) =>
								setAttributes({ subheadingColor: color || '' }),
							label: __('Subheading Text', 'popup-maker'),
						},
					]}
				/>
			</InspectorControls>

			{/* Editor Preview */}
			<div {...blockProps}>
				{categoryId > 0 ? (
					<ServerSideRender
						block="popup-maker/category-integrations"
						attributes={attributes}
						LoadingResponsePlaceholder={() => (
							<div
								style={{
									padding: '2rem',
									textAlign: 'center',
									background: '#fafafa',
									borderRadius: '8px',
								}}
							>
								<Spinner />
								<p style={{ marginTop: '1rem' }}>
									{__('Loading integrations...', 'popup-maker')}
								</p>
							</div>
						)}
						ErrorResponsePlaceholder={() => (
							<div
								style={{
									padding: '2rem',
									border: '1px solid #ccc',
									borderRadius: '8px',
									background: '#fff5f5',
								}}
							>
								<p>
									{__(
										'Error loading integrations. Check category selection.',
										'popup-maker'
									)}
								</p>
							</div>
						)}
						EmptyResponsePlaceholder={() => (
							<div
								style={{
									padding: '2rem',
									border: '1px solid #ccc',
									borderRadius: '8px',
									background: '#fffdf0',
									textAlign: 'center',
								}}
							>
								<p>
									{__(
										'No integrations found in this category.',
										'popup-maker'
									)}
								</p>
							</div>
						)}
					/>
				) : (
					<div
						style={{
							padding: '2rem',
							border: '2px dashed #ccc',
							textAlign: 'center',
							borderRadius: '8px',
							background: '#fafafa',
						}}
					>
						<p style={{ margin: 0, color: '#666' }}>
							{__(
								'Please select a category in the block settings →',
								'popup-maker'
							)}
						</p>
					</div>
				)}
			</div>
		</>
	);
}
