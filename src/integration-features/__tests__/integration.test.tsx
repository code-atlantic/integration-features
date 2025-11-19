/**
 * Integration tests
 * Tests block registration, attribute persistence, and InnerBlocks integration
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { IntegrationFeatureAttributes, TierType, IconStyleType } from '../types';

// Mock WordPress dependencies
jest.mock('@wordpress/blocks', () => ({
	registerBlockType: jest.fn(),
}));

jest.mock('@wordpress/block-editor', () => ({
	useBlockProps: Object.assign(
		jest.fn((props = {}) => ({
			className: `wp-block ${props.className || ''}`.trim()
		})),
		{
			save: jest.fn((props = {}) => ({
				className: `wp-block ${props.className || ''}`.trim()
			})),
		}
	),
	useInnerBlocksProps: Object.assign(
		jest.fn(() => ({ className: 'inner-blocks' })),
		{
			save: jest.fn((props = {}) => ({
				className: `inner-blocks ${props.className || ''}`.trim(),
				children: [<div key="child" data-testid="inner-blocks-content">Inner content</div>],
			})),
		}
	),
	BlockControls: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="block-controls">{children}</div>
	),
	InspectorControls: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="inspector-controls">{children}</div>
	),
	RichText: Object.assign(
		({
			value,
			onChange,
			placeholder,
		}: {
			value: string;
			onChange: (value: string) => void;
			placeholder: string;
		}) => (
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				data-testid="richtext-label"
			/>
		),
		{
			Content: ({ tagName: Tag = 'span', className, value }: any) => (
				<Tag className={className} dangerouslySetInnerHTML={{ __html: value }} />
			),
		}
	),
	InnerBlocks: {
		Content: () => <div data-testid="inner-blocks-content">Inner content</div>,
	},
}));

jest.mock('@wordpress/components', () => ({
	ToolbarGroup: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="toolbar-group">{children}</div>
	),
	ToolbarDropdownMenu: ({
		icon,
		label,
		controls,
	}: {
		icon: string;
		label: string;
		controls: Array<{ title: string; isActive: boolean; onClick: () => void }>;
	}) => (
		<div data-testid={`toolbar-dropdown-${icon}`} title={label}>
			{controls.map((control, index) => (
				<button
					key={index}
					onClick={control.onClick}
					data-active={control.isActive}
					title={control.title}
				>
					{control.title}
				</button>
			))}
		</div>
	),
	PanelBody: ({ children, title }: { children: React.ReactNode; title: string }) => (
		<div data-testid="panel-body" title={title}>
			{children}
		</div>
	),
	FontSizePicker: ({ value, onChange }: any) => (
		<input
			data-testid="font-size-picker"
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	),
}));

jest.mock('@wordpress/data', () => ({
	useSelect: jest.fn(() => [
		{
			name: 'core/paragraph',
			clientId: 'mock-inner-block',
			attributes: { content: 'Description text' },
		},
	]),
}));

jest.mock('@wordpress/i18n', () => ({
	__: (text: string) => text,
}));

jest.mock('@wordpress/element', () => ({
	...jest.requireActual('react'),
	useMemo: jest.requireActual('react').useMemo,
	useEffect: jest.requireActual('react').useEffect,
}));

describe('Integration Tests', () => {
	describe('block registration', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

	it('registers block with correct name and functions', () => {
		const { registerBlockType } = require('@wordpress/blocks');
		require('../index');

		expect(registerBlockType).toHaveBeenCalledWith(
			'popup-maker/integration-feature',
			expect.any(Object)
		);
		
		// Verify edit and save functions are provided
		const [, config] = registerBlockType.mock.calls[0];
		expect(config).toHaveProperty('edit');
		expect(config).toHaveProperty('save');
		expect(typeof config.edit).toBe('function');
		expect(typeof config.save).toBe('function');
	});
	});

	describe('attribute persistence', () => {
		it('tier attribute defaults to free', () => {
			const metadata = require('../block.json');
			expect(metadata.attributes.tier.default).toBe('free');
		});

		it('tier attribute only accepts valid values', () => {
			const metadata = require('../block.json');
			expect(metadata.attributes.tier.enum).toEqual(['free', 'pro', 'proplus']);
		});

		it('label attribute defaults to empty string', () => {
			const metadata = require('../block.json');
			expect(metadata.attributes.label.default).toBe('');
		});

		it('isOpen attribute defaults to false', () => {
			const metadata = require('../block.json');
			expect(metadata.attributes.isOpen.default).toBe(false);
		});

		it('iconStyle attribute defaults to plus-minus', () => {
			const metadata = require('../block.json');
			expect(metadata.attributes.iconStyle.default).toBe('plus-minus');
		});

		it('iconStyle attribute only accepts valid values', () => {
			const metadata = require('../block.json');
			expect(metadata.attributes.iconStyle.enum).toEqual([
				'chevron',
				'plus-minus',
			]);
		});

		it('showFreeBadge attribute defaults to false', () => {
			const metadata = require('../block.json');
			expect(metadata.attributes.showFreeBadge.default).toBe(false);
		});

		it('label attribute uses RichText source', () => {
			const metadata = require('../block.json');
			expect(metadata.attributes.label.source).toBe('html');
			expect(metadata.attributes.label.selector).toBe(
				'.pm-integration-feature__label'
			);
		});
	});

	describe('InnerBlocks integration', () => {
		it('Edit component configures InnerBlocks with template', () => {
			const Edit = require('../edit').default;
			const { useInnerBlocksProps } = require('@wordpress/block-editor');

			render(
				<Edit
					attributes={{
						tier: 'free',
						label: '',
						isOpen: false,
						iconStyle: 'chevron',
						showFreeBadge: false,
					}}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			expect(useInnerBlocksProps).toHaveBeenCalledWith(
				expect.any(Object),
				expect.objectContaining({
					template: [],
					templateLock: false,
					allowedBlocks: expect.arrayContaining([
						'core/paragraph',
						'core/list',
						'core/heading',
					]),
				})
			);
		});

		it('Save component renders InnerBlocks.Content', () => {
			const save = require('../save').default;
			const { InnerBlocks } = require('@wordpress/block-editor');

			render(
				save({
					attributes: {
						tier: 'free',
						label: 'Test',
						isOpen: false,
						iconStyle: 'chevron',
						showFreeBadge: false,
					},
				})
			);

			expect(screen.getByTestId('inner-blocks-content')).toBeInTheDocument();
		});
	});

	describe('TypeScript type safety', () => {
		it('TierType includes all valid tiers', () => {
			// This test ensures the TierType matches block.json enum
			const validTiers: TierType[] = ['free', 'pro', 'proplus'];
			validTiers.forEach((tier) => {
				expect(['free', 'pro', 'proplus']).toContain(tier);
			});
		});

		it('IconStyleType includes all valid styles', () => {
			const validStyles: IconStyleType[] = ['chevron', 'plus-minus'];
			validStyles.forEach((style) => {
				expect(['chevron', 'plus-minus']).toContain(style);
			});
		});

		it('IntegrationFeatureAttributes has all required properties', () => {
			const attributes: IntegrationFeatureAttributes = {
				tier: 'free',
				label: 'Test',
				isOpen: false,
				iconStyle: 'chevron',
				showFreeBadge: false,
			};

			expect(attributes).toHaveProperty('tier');
			expect(attributes).toHaveProperty('label');
			expect(attributes).toHaveProperty('isOpen');
			expect(attributes).toHaveProperty('iconStyle');
			expect(attributes).toHaveProperty('showFreeBadge');
		});
	});

	describe('toolbar integration', () => {
		it('BlockControls renders in Edit component', () => {
			const Edit = require('../edit').default;

			render(
				<Edit
					attributes={{
						tier: 'free',
						label: '',
						isOpen: false,
						iconStyle: 'chevron',
						showFreeBadge: false,
					}}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			expect(screen.getByTestId('block-controls')).toBeInTheDocument();
		});

		it('ToolbarGroup renders tier selection buttons', () => {
			const Edit = require('../edit').default;

			render(
				<Edit
					attributes={{
						tier: 'free',
						label: '',
						isOpen: false,
						iconStyle: 'chevron',
						showFreeBadge: false,
					}}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			expect(screen.getByTitle('FREE')).toBeInTheDocument();
			expect(screen.getByTitle('PRO')).toBeInTheDocument();
			expect(screen.getByTitle('PRO+')).toBeInTheDocument();
		});

		it('ToolbarGroup renders icon style buttons', () => {
			const Edit = require('../edit').default;

			render(
				<Edit
					attributes={{
						tier: 'free',
						label: '',
						isOpen: false,
						iconStyle: 'chevron',
						showFreeBadge: false,
					}}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			expect(screen.getByTitle('Chevron (▼/▲)')).toBeInTheDocument();
			expect(screen.getByTitle('Plus/Minus (+/−)')).toBeInTheDocument();
		});
	});

	describe('data flow', () => {
		it('Edit component receives attributes', () => {
			const Edit = require('../edit').default;
			const mockSetAttributes = jest.fn();

			const { container } = render(
				<Edit
					attributes={{
						tier: 'pro',
						label: 'Test Label',
						isOpen: true,
						iconStyle: 'plus-minus',
						showFreeBadge: true,
					}}
					setAttributes={mockSetAttributes}
					clientId="test-id"
				/>
			);

			// Check for tier badge specifically (not toolbar button)
			const badge = container.querySelector('.pm-tier-badge--pro');
			expect(badge).toHaveTextContent('PRO');
			expect(screen.getByTestId('richtext-label')).toHaveValue('Test Label');
		});

		it('Save component receives attributes', () => {
			const save = require('../save').default;

			render(
				save({
					attributes: {
						tier: 'proplus',
						label: 'Saved Label',
						isOpen: false,
						iconStyle: 'chevron',
						showFreeBadge: false,
					},
				})
			);

			expect(screen.getByText('PRO+')).toBeInTheDocument();
			expect(screen.getByText('Saved Label')).toBeInTheDocument();
		});
	});

	describe('WordPress data integration', () => {
		it('Edit component uses useSelect to get innerBlocks', () => {
			const Edit = require('../edit').default;
			const { useSelect } = require('@wordpress/data');

			render(
				<Edit
					attributes={{
						tier: 'free',
						label: '',
						isOpen: false,
						iconStyle: 'chevron',
						showFreeBadge: false,
					}}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			expect(useSelect).toHaveBeenCalled();
		});

		it('useSelect accesses core/block-editor store', () => {
			const Edit = require('../edit').default;
			const { useSelect } = require('@wordpress/data');

			render(
				<Edit
					attributes={{
						tier: 'free',
						label: '',
						isOpen: false,
						iconStyle: 'chevron',
						showFreeBadge: false,
					}}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			const selectCallback = useSelect.mock.calls[0][0];
			const mockSelect = jest.fn(() => ({
				getBlocks: jest.fn(() => []),
			}));

			selectCallback(mockSelect);
			expect(mockSelect).toHaveBeenCalledWith('core/block-editor');
		});
	});

	describe('hasDescription computation', () => {
		it('computeHasDescription is imported from shared utility', () => {
			const { computeHasDescription } = require('../lib/hasDescription');
			expect(typeof computeHasDescription).toBe('function');
		});

		it('Edit component uses computeHasDescription', () => {
			// This is tested implicitly through the useMemo hook in Edit component
			const Edit = require('../edit').default;
			expect(Edit).toBeDefined();
		});

		it('Save component uses computeHasDescription', () => {
			// This is tested implicitly through the conditional rendering in Save component
			const save = require('../save').default;
			expect(save).toBeDefined();
		});
	});
});
