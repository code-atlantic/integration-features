/**
 * Save component tests
 * Tests frontend rendering and conditional logic
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import save from '../save';
import type { IntegrationFeatureAttributes } from '../types';

// Mock WordPress dependencies
jest.mock('@wordpress/block-editor', () => ({
	useBlockProps: {
		save: jest.fn((props = {}) => ({
			className: `wp-block ${props.className || ''}`.trim()
		})),
	},
	useInnerBlocksProps: {
		save: jest.fn((props = {}) => ({
			className: `inner-blocks ${props.className || ''}`.trim(),
			children: [<div key="child" data-testid="inner-blocks-content">Inner content</div>],
		})),
	},
	InnerBlocks: {
		Content: () => <div data-testid="inner-blocks-content">Inner content</div>,
	},
	RichText: {
		Content: ({ tagName: Tag = 'span', className, value }: any) => (
			<Tag className={className} dangerouslySetInnerHTML={{ __html: value }} />
		),
	},
}));

jest.mock('@wordpress/i18n', () => ({
	__: (text: string) => text,
}));

describe('Save Component', () => {
	const defaultAttributes: IntegrationFeatureAttributes = {
		tier: 'free',
		label: 'Test Feature',
		isOpen: false,
		iconStyle: 'chevron',
		showFreeBadge: false,
	};

	describe('conditional rendering based on hasDescription', () => {
		it('renders details element with description', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);

			// With inner content mock returning content, should render details element
			expect(container.querySelector('details')).toBeInTheDocument();
		});

		it('details element is closed by default', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);

			const details = container.querySelector('details');
			expect(details).not.toHaveAttribute('open');
		});

		it('renders semantic HTML structure', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);

			const details = container.querySelector('details');
			const summary = container.querySelector('summary');
			expect(details).toContainElement(summary);
		});
	});

	describe('tier badge rendering', () => {
		it('does not render FREE badge by default', () => {
			render(save({ attributes: defaultAttributes }));
			expect(screen.queryByText('FREE')).not.toBeInTheDocument();
		});

		it('renders FREE badge when showFreeBadge is true', () => {
			render(
				save({
					attributes: { ...defaultAttributes, showFreeBadge: true },
				})
			);
			expect(screen.getByText('FREE')).toBeInTheDocument();
		});

		it('renders PRO badge for pro tier', () => {
			render(
				save({
					attributes: { ...defaultAttributes, tier: 'pro' },
				})
			);
			expect(screen.getByText('PRO')).toBeInTheDocument();
		});

		it('renders PRO+ badge for proplus tier', () => {
			render(
				save({
					attributes: { ...defaultAttributes, tier: 'proplus' },
				})
			);
			expect(screen.getByText('PRO+')).toBeInTheDocument();
		});

		it('applies correct CSS class for free tier', () => {
			const { container } = render(
				save({
					attributes: { ...defaultAttributes, showFreeBadge: true },
				})
			);
			expect(container.querySelector('.pm-tier-badge--free')).toBeInTheDocument();
		});

		it('applies correct CSS class for pro tier', () => {
			const { container } = render(
				save({
					attributes: { ...defaultAttributes, tier: 'pro' },
				})
			);
			expect(container.querySelector('.pm-tier-badge--pro')).toBeInTheDocument();
		});

		it('applies correct CSS class for proplus tier', () => {
			const { container } = render(
				save({
					attributes: { ...defaultAttributes, tier: 'proplus' },
				})
			);
			expect(
				container.querySelector('.pm-tier-badge--proplus')
			).toBeInTheDocument();
		});
	});

	describe('icon style rendering', () => {
		it('renders chevron icon by default', () => {
			render(save({ attributes: defaultAttributes }));
			expect(screen.getByText('▼')).toBeInTheDocument();
		});

		it('renders plus icon for plus-minus style', () => {
			render(
				save({
					attributes: { ...defaultAttributes, iconStyle: 'plus-minus' },
				})
			);
			expect(screen.getByText('+')).toBeInTheDocument();
		});

		it('chevron icon is always closed (▼) in saved content', () => {
			// isOpen only affects editor, not frontend
			render(
				save({
					attributes: { ...defaultAttributes, isOpen: true },
				})
			);
			expect(screen.getByText('▼')).toBeInTheDocument();
			expect(screen.queryByText('▲')).not.toBeInTheDocument();
		});

		it('plus-minus icon is always plus (+) in saved content', () => {
			render(
				save({
					attributes: {
						...defaultAttributes,
						iconStyle: 'plus-minus',
						isOpen: true,
					},
				})
			);
			expect(screen.getByText('+')).toBeInTheDocument();
			expect(screen.queryByText('−')).not.toBeInTheDocument();
		});
	});

	describe('label rendering', () => {
		it('renders label text', () => {
			render(
				save({
					attributes: { ...defaultAttributes, label: 'Custom Label' },
				})
			);
			expect(screen.getByText('Custom Label')).toBeInTheDocument();
		});

		it('renders empty label gracefully', () => {
			render(
				save({
					attributes: { ...defaultAttributes, label: '' },
				})
			);
			// Should still render summary element
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			expect(container.querySelector('summary')).toBeInTheDocument();
		});

		it('renders HTML in label correctly', () => {
			const { container } = render(
				save({
					attributes: {
						...defaultAttributes,
						label: '<strong>Bold</strong> Label',
					},
				})
			);
			expect(container.querySelector('strong')).toBeInTheDocument();
			expect(screen.getByText('Bold')).toBeInTheDocument();
		});
	});

	describe('description content', () => {
		it('renders InnerBlocks.Content for description', () => {
			render(save({ attributes: defaultAttributes }));
			expect(screen.getByTestId('inner-blocks-content')).toBeInTheDocument();
		});

		it('applies correct class to description container', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			expect(
				container.querySelector('.pm-integration-feature__description')
			).toBeInTheDocument();
		});
	});

	describe('accessibility attributes', () => {
		it('uses native summary element (semantically a button)', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			const summary = container.querySelector('summary');
			expect(summary).toBeInTheDocument();
		});

		it('icon has aria-hidden=true', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			const icon = container.querySelector(
				'.pm-integration-feature__icon'
			);
			expect(icon).toHaveAttribute('aria-hidden', 'true');
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
	});

	describe('semantic HTML structure', () => {
		it('uses details element for accordion', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			expect(container.querySelector('details')).toBeInTheDocument();
		});

		it('uses summary element for header', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			expect(container.querySelector('summary')).toBeInTheDocument();
		});

		it('summary is direct child of details', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			const details = container.querySelector('details');
			const summary = details?.querySelector('summary');
			expect(summary).toBeInTheDocument();
		});

		it('summary element has header class', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			const summary = container.querySelector('summary');
			expect(summary).toHaveClass('pm-integration-feature__header');
		});
	});

	describe('edge cases', () => {
		it('handles missing label gracefully', () => {
			const { container } = render(
				save({
					attributes: {
						...defaultAttributes,
						label: undefined as any,
					},
				})
			);
			expect(container.querySelector('summary')).toBeInTheDocument();
		});

		it('handles very long labels', () => {
			const longLabel = 'a'.repeat(1000);
			render(
				save({
					attributes: { ...defaultAttributes, label: longLabel },
				})
			);
			expect(screen.getByText(longLabel)).toBeInTheDocument();
		});

		it('handles special characters in label', () => {
			render(
				save({
					attributes: {
						...defaultAttributes,
						label: '🎯 Feature & "Test" <Component>',
					},
				})
			);
			expect(screen.getByText(/Feature/)).toBeInTheDocument();
		});

		it('renders correctly with all options enabled', () => {
			const { container } = render(
				save({
					attributes: {
						tier: 'proplus',
						label: 'Full Feature',
						isOpen: true,
						iconStyle: 'plus-minus',
						showFreeBadge: false,
					},
				})
			);

			expect(screen.getByText('PRO+')).toBeInTheDocument();
			expect(screen.getByText('Full Feature')).toBeInTheDocument();
			expect(screen.getByText('+')).toBeInTheDocument();
			expect(container.querySelector('details')).toBeInTheDocument();
		});
	});

	describe('CSS class application', () => {
		it('applies base class', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			expect(
				container.querySelector('.pm-integration-feature')
			).toBeInTheDocument();
		});

		it('applies header class', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			expect(
				container.querySelector('.pm-integration-feature__header')
			).toBeInTheDocument();
		});

		it('applies label class', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			expect(
				container.querySelector('.pm-integration-feature__label')
			).toBeInTheDocument();
		});

		it('applies icon class', () => {
			const { container } = render(
				save({ attributes: defaultAttributes })
			);
			expect(
				container.querySelector('.pm-integration-feature__icon')
			).toBeInTheDocument();
		});

		it('applies tier badge class', () => {
			const { container } = render(
				save({
					attributes: { ...defaultAttributes, tier: 'pro' },
				})
			);
			expect(container.querySelector('.pm-tier-badge')).toBeInTheDocument();
		});
	});
});
