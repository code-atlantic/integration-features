/**
 * Edit component tests
 * Tests editor functionality, user interactions, and toolbar controls
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Edit from '../edit';
import type { IntegrationFeatureAttributes } from '../types';

// Mock WordPress dependencies
jest.mock('@wordpress/block-editor', () => ({
	useBlockProps: jest.fn((props = {}) => ({
		className: `wp-block ${props.className || ''}`.trim()
	})),
	useInnerBlocksProps: jest.fn(() => ({ className: 'inner-blocks' })),
	BlockControls: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="block-controls">{children}</div>
	),
	RichText: ({
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
	useSelect: jest.fn(() => [
		// Default to one inner block with content so hasDescription is true
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

describe('Edit Component', () => {
	const defaultAttributes: IntegrationFeatureAttributes = {
		tier: 'free',
		label: '',
		isOpen: false,
		iconStyle: 'chevron',
		showFreeBadge: false,
	};

	const mockSetAttributes = jest.fn();
	const mockClientId = 'test-client-id';

	beforeEach(() => {
		mockSetAttributes.mockClear();
	});

	describe('rendering', () => {
		it('renders without crashing', () => {
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			expect(screen.getByTestId('block-controls')).toBeInTheDocument();
		});

		it('renders with free tier by default', () => {
			const { container } = render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			// Free badge should not be visible by default (showFreeBadge: false)
			const freeBadge = container.querySelector('.pm-tier-badge--free');
			expect(freeBadge).not.toBeInTheDocument();
		});

		it('renders FREE badge when showFreeBadge is true', () => {
			const { container } = render(
				<Edit
					attributes={{ ...defaultAttributes, showFreeBadge: true }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			const freeBadge = container.querySelector('.pm-tier-badge--free');
			expect(freeBadge).toBeInTheDocument();
			expect(freeBadge).toHaveTextContent('FREE');
		});

		it('renders PRO badge for pro tier', () => {
			const { container } = render(
				<Edit
					attributes={{ ...defaultAttributes, tier: 'pro' }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			const proBadge = container.querySelector('.pm-tier-badge--pro');
			expect(proBadge).toBeInTheDocument();
			expect(proBadge).toHaveTextContent('PRO');
		});

		it('renders PRO+ badge for proplus tier', () => {
			const { container } = render(
				<Edit
					attributes={{ ...defaultAttributes, tier: 'proplus' }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			const proplusBadge = container.querySelector('.pm-tier-badge--proplus');
			expect(proplusBadge).toBeInTheDocument();
			expect(proplusBadge).toHaveTextContent('PRO+');
		});
	});

	describe('label editing', () => {
		it('renders RichText with placeholder when label is empty', () => {
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			const richtext = screen.getByTestId('richtext-label');
			expect(richtext).toHaveAttribute('placeholder', 'Feature name...');
		});

		it('calls setAttributes when label changes', async () => {
			const user = userEvent.setup();
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const richtext = screen.getByTestId('richtext-label');
			await user.clear(richtext);
			await user.type(richtext, 'New Feature');

			// userEvent.type() calls onChange for each character
		expect(mockSetAttributes).toHaveBeenCalledWith(expect.objectContaining({ label: expect.any(String) }));
		});

		it('displays existing label value', () => {
			render(
				<Edit
					attributes={{ ...defaultAttributes, label: 'Existing Label' }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			const richtext = screen.getByTestId('richtext-label');
			expect(richtext).toHaveValue('Existing Label');
		});
	});

	describe('accordion toggle', () => {
		it('displays closed state by default', () => {
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			// Chevron down icon for closed state
			expect(screen.getByText('▼')).toBeInTheDocument();
		});

		it('displays open state when isOpen is true', () => {
			render(
				<Edit
					attributes={{ ...defaultAttributes, isOpen: true }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			// Chevron up icon for open state
			expect(screen.getByText('▲')).toBeInTheDocument();
		});

		it('toggles accordion when summary is clicked', async () => {
			const user = userEvent.setup();
			const { container } = render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);


		const header = container.querySelector('.pm-integration-feature__header');
			await user.click(header!);

			expect(mockSetAttributes).toHaveBeenCalledWith({ isOpen: true });
		});
	});

	describe('icon style switching', () => {
		it('displays chevron icon by default', () => {
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			expect(screen.getByText('▼')).toBeInTheDocument();
		});

		it('displays plus-minus icon when iconStyle is plus-minus', () => {
			render(
				<Edit
					attributes={{ ...defaultAttributes, iconStyle: 'plus-minus' }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			expect(screen.getByText('+')).toBeInTheDocument();
		});

		it('shows minus icon when open with plus-minus style', () => {
			render(
				<Edit
					attributes={{
						...defaultAttributes,
						iconStyle: 'plus-minus',
						isOpen: true,
					}}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			expect(screen.getByText('−')).toBeInTheDocument();
		});

		it('toolbar button switches to plus-minus icon', async () => {
			const user = userEvent.setup();
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const plusMinusButton = screen.getByTitle('Plus/Minus (+/−)');
			await user.click(plusMinusButton);

			expect(mockSetAttributes).toHaveBeenCalledWith({
				iconStyle: 'plus-minus',
			});
		});

		it('toolbar button switches to chevron icon', async () => {
			const user = userEvent.setup();
			render(
				<Edit
					attributes={{ ...defaultAttributes, iconStyle: 'plus-minus' }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const chevronButton = screen.getByTitle('Chevron (▼/▲)');
			await user.click(chevronButton);

			expect(mockSetAttributes).toHaveBeenCalledWith({ iconStyle: 'chevron' });
		});
	});

	describe('tier selection', () => {
		it('toolbar shows active state for current tier', () => {
			render(
				<Edit
					attributes={{ ...defaultAttributes, tier: 'pro' }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const proButton = screen.getByTitle('PRO');
			expect(proButton).toHaveAttribute('data-active', 'true');
		});

		it('switches to pro tier when toolbar button clicked', async () => {
			const user = userEvent.setup();
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const proButton = screen.getByTitle('PRO');
			await user.click(proButton);

			expect(mockSetAttributes).toHaveBeenCalledWith({ tier: 'pro' });
		});

		it('switches to proplus tier when toolbar button clicked', async () => {
			const user = userEvent.setup();
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const proplusButton = screen.getByTitle('PRO+');
			await user.click(proplusButton);

			expect(mockSetAttributes).toHaveBeenCalledWith({ tier: 'proplus' });
		});

		it('switches to free tier when toolbar button clicked', async () => {
			const user = userEvent.setup();
			render(
				<Edit
					attributes={{ ...defaultAttributes, tier: 'pro' }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const freeButton = screen.getByTitle('FREE');
			await user.click(freeButton);

			expect(mockSetAttributes).toHaveBeenCalledWith({ tier: 'free' });
		});
	});

	describe('FREE badge toggle', () => {
		it('toolbar shows "Hide FREE Badge" as active when showFreeBadge is false', () => {
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const hideButton = screen.getByTitle('Hide FREE Badge');
			expect(hideButton).toHaveAttribute('data-active', 'true');
		});

		it('toolbar shows "Show FREE Badge" as active when showFreeBadge is true', () => {
			render(
				<Edit
					attributes={{ ...defaultAttributes, showFreeBadge: true }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const showButton = screen.getByTitle('Show FREE Badge');
			expect(showButton).toHaveAttribute('data-active', 'true');
		});

		it('calls setAttributes when Show FREE Badge clicked', async () => {
			const user = userEvent.setup();
			render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);

			const showButton = screen.getByTitle('Show FREE Badge');
			await user.click(showButton);

			expect(mockSetAttributes).toHaveBeenCalledWith({ showFreeBadge: true });
		});
	});

	describe('CSS classes', () => {
		it('applies correct tier class for free tier', () => {
			const { container } = render(
				<Edit
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			// Free badge only shown when showFreeBadge is true\n\t\texpect\(container.querySelector\('.pm-tier-badge--free'\)\).not.toBeInTheDocument\(\);
		});

		it('applies correct tier class for pro tier', () => {
			const { container } = render(
				<Edit
					attributes={{ ...defaultAttributes, tier: 'pro' }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			expect(container.querySelector('.pm-tier-badge--pro')).toBeInTheDocument();
		});

		it('applies correct tier class for proplus tier', () => {
			const { container } = render(
				<Edit
					attributes={{ ...defaultAttributes, tier: 'proplus' }}
					setAttributes={mockSetAttributes}
					clientId={mockClientId}
				/>
			);
			expect(
				container.querySelector('.pm-tier-badge--proplus')
			).toBeInTheDocument();
		});
	});
});
