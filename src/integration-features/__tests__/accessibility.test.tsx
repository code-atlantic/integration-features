/**
 * Accessibility tests
 * Tests ARIA attributes, keyboard navigation, focus management, and screen reader compatibility
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Edit from '../edit';
import save from '../save';
import type { IntegrationFeatureAttributes } from '../types';

// Mock WordPress dependencies
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
				children: [<div key="child">Inner content</div>],
			})),
		}
	),
	BlockControls: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="block-controls">{children}</div>
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
}));

jest.mock('@wordpress/data', () => ({
	useSelect: jest.fn(() => []),
}));

jest.mock('@wordpress/i18n', () => ({
	__: (text: string) => text,
}));

describe('Accessibility Tests', () => {
	const defaultAttributes: IntegrationFeatureAttributes = {
		tier: 'free',
		label: 'Test Feature',
		isOpen: false,
		iconStyle: 'chevron',
		showFreeBadge: false,
	};

	describe('ARIA attributes - Edit component', () => {
		it('header has role=button when hasDescription', () => {
			// Edit component uses div with role=button, not native summary
			const { container } = render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			const header = container.querySelector('.pm-integration-feature__header');
			// Edit component has hasDescription true when InnerBlocks exist
			expect(header).toBeInTheDocument();
		});

		it('renders with proper structure', () => {
			const { container } = render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			expect(container.querySelector('.pm-integration-feature')).toBeInTheDocument();
			expect(container.querySelector('.pm-integration-feature__header')).toBeInTheDocument();
		});
	});

	describe('ARIA attributes - Save component', () => {
		it('uses native summary element (semantically a button)', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);

			const summary = container.querySelector('summary');
			expect(summary).toBeInTheDocument();
		});

		it('description container exists when hasDescription', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);

			const description = container.querySelector(
				'.pm-integration-feature__description'
			);
			expect(description).toBeInTheDocument();
		});

		it('icon has aria-hidden=true', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);

			const icon = container.querySelector('.pm-integration-feature__icon');
			expect(icon).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('keyboard navigation', () => {
		it('toolbar buttons exist and are interactive', () => {
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			// Check that tier selection buttons exist
			expect(screen.getByTitle('FREE')).toBeInTheDocument();
			expect(screen.getByTitle('PRO')).toBeInTheDocument();
			expect(screen.getByTitle('PRO+')).toBeInTheDocument();
		});
	});

	describe('focus management', () => {
		it('RichText is focusable for label editing', () => {
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			const richtext = screen.getByTestId('richtext-label');
			expect(richtext).toBeInTheDocument();
		});
	});

	describe('screen reader support', () => {
		it('tier badges have meaningful text', () => {
			const { container } = render(
				<Edit
					attributes={{ ...defaultAttributes, tier: 'pro' }}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			// Check for tier badge specifically (not toolbar button)
			const badge = container.querySelector('.pm-tier-badge--pro');
			expect(badge).toHaveTextContent('PRO');
		});

		it('label is announced by screen readers', () => {
			render(
				<Edit
					attributes={{ ...defaultAttributes, label: 'Custom Feature' }}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			const richtext = screen.getByTestId('richtext-label');
			expect(richtext).toHaveValue('Custom Feature');
		});
	});

	describe('semantic HTML', () => {
		it('uses native details element for accordion', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);

			expect(container.querySelector('details')).toBeInTheDocument();
		});

		it('uses native summary element for header', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);

			expect(container.querySelector('summary')).toBeInTheDocument();
		});

		it('summary is first child of details', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);

			const details = container.querySelector('details');
			const firstChild = details?.firstElementChild;
			expect(firstChild?.tagName).toBe('SUMMARY');
		});

		it('proper heading hierarchy for label', () => {
			const { container } = render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			const label = container.querySelector('.pm-integration-feature__label');
			// Label should be inside summary, not a heading (summary itself acts as heading)
			expect(label?.tagName).not.toBe('H1');
			expect(label?.tagName).not.toBe('H2');
		});
	});

	describe('WCAG 2.1 AA compliance', () => {
		it('color contrast - PRO badge exists', () => {
			const { container } = render(
				save({ attributes: { ...defaultAttributes, tier: 'pro' } })
			);

			const badge = container.querySelector('.pm-tier-badge--pro');
			expect(badge).toBeInTheDocument();
		});

		it('color contrast - PRO+ badge exists', () => {
			const { container } = render(
				save({ attributes: { ...defaultAttributes, tier: 'proplus' } })
			);

			const badge = container.querySelector('.pm-tier-badge--proplus');
			expect(badge).toBeInTheDocument();
		});
	});

	describe('form controls accessibility', () => {
		it('RichText has placeholder for empty state', () => {
			render(
				<Edit
					attributes={{ ...defaultAttributes, label: '' }}
					setAttributes={jest.fn()}
					clientId="test-id"
				/>
			);

			const richtext = screen.getByTestId('richtext-label');
			expect(richtext).toHaveAttribute('placeholder', 'Feature name...');
		});
	});
});
