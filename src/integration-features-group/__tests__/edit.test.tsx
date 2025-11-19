/**
 * Tests for Edit component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Edit from '../edit';
import type { IntegrationFeaturesGroupAttributes } from '../types';

// Mock WordPress dependencies
jest.mock('@wordpress/i18n', () => ({
	__: (text) => text,
}));

jest.mock('@wordpress/block-editor', () => ({
	useBlockProps: jest.fn((props) => ({
		...props,
		className: `wp-block-test ${props?.className || ''}`,
	})),
	useInnerBlocksProps: jest.fn((props) => ({
		...props,
		children: [],
	})),
	BlockControls: ({ children }) => <div>{children}</div>,
	InspectorControls: ({ children }) => <div>{children}</div>,
	RichText: ({ value, onChange, placeholder, className }: any) => (
		<input
			className={className}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
		/>
	),
}));

jest.mock('@wordpress/components', () => ({
	Button: ({ children, onClick, className, ...props }: any) => (
		<button className={className} onClick={onClick} {...props}>
			{children}
		</button>
	),
	ToolbarGroup: ({ children }) => <div>{children}</div>,
	ToolbarDropdownMenu: ({ label, controls }) => (
		<div>
			<button aria-label={label}>
				{label}
			</button>
			{controls?.map((control, idx) => (
				<button key={idx} onClick={control.onClick}>
					{control.title}
				</button>
			))}
		</div>
	),
	PanelBody: ({ title, children }) => (
		<div>
			<h3>{title}</h3>
			{children}
		</div>
	),
	ColorPalette: ({ value, onChange }) => (
		<input
			type="color"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			data-testid="color-palette"
		/>
	),
	SelectControl: ({ label, value, options, onChange }) => (
		<label>
			{label}
			<select value={value} onChange={(e) => onChange(e.target.value)}>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</label>
	),
	ToggleControl: ({ label, checked, onChange }) => (
		<label>
			{label}
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
			/>
		</label>
	),
}));

jest.mock('@wordpress/data', () => ({
	useSelect: jest.fn(() => undefined),
}));

jest.mock('@wordpress/element', () => ({
	...jest.requireActual('@wordpress/element'),
	useMemo: jest.fn((fn) => fn()),
	useEffect: jest.fn(),
}));

jest.mock('../components/DashiconPicker', () => {
	return function DashiconPickerMock({ value, onChange, label }: any) {
		return (
			<div data-testid="dashicon-picker">
				<button onClick={() => onChange('test-icon')}>
					{label}
				</button>
				<span>{value}</span>
			</div>
		);
	};
});

// Mock hasFeatures - will be overridden in individual tests as needed
let mockComputeHasFeatures = jest.fn((blocks) => {
	return blocks && blocks.length > 0;
});

jest.mock('../lib/hasFeatures', () => ({
	computeHasFeatures: (...args) => mockComputeHasFeatures(...args),
}));

describe('Edit Component', () => {
	const defaultAttributes: IntegrationFeaturesGroupAttributes = {
		groupIcon: 'admin-plugins',
		groupIconColor: '#1e1e1e',
		groupIconBackgroundColor: '',
		heading: '',
		headingTag: 'h2',
		subheading: '',
		iconAnimation: 'rotate-45',
		oneOpenPerGroup: true,
		defaultOpen: false,
		groupCollapsible: false,
		groupCollapsed: true,
		hasFeatures: false,
	};

	const mockSetAttributes = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders without crashing', () => {
		const { container } = render(
			<Edit
				attributes={defaultAttributes}
				setAttributes={mockSetAttributes}
				clientId="test-id"
				isSelected={true}
			/>
		);

		expect(container).toBeInTheDocument();
	});

	it('renders with default attributes', () => {
		render(
			<Edit
				attributes={defaultAttributes}
				setAttributes={mockSetAttributes}
				clientId="test-id"
				isSelected={true}
			/>
		);

		// Check if inspector controls are present
		expect(screen.getByText('Accordion Settings')).toBeInTheDocument();
	});

	it('renders icon animation select control in sidebar', () => {
		render(
			<Edit
				attributes={defaultAttributes}
				setAttributes={mockSetAttributes}
				clientId="test-id"
				isSelected={true}
			/>
		);

		expect(screen.getByLabelText('Toggle Icon Style')).toBeInTheDocument();
		expect(screen.getByText('Plus (+)')).toBeInTheDocument();
		expect(screen.getByText('Arrow')).toBeInTheDocument();
	});

	it('renders toggle controls for accordion settings', () => {
		render(
			<Edit
				attributes={defaultAttributes}
				setAttributes={mockSetAttributes}
				clientId="test-id"
				isSelected={true}
			/>
		);

		expect(screen.getByText('One Open Per Group')).toBeInTheDocument();
		expect(screen.getByText('First Feature Open by Default')).toBeInTheDocument();
	});

	it('applies correct CSS classes based on hasFeatures', () => {
		// Test with hasFeatures = false
		mockComputeHasFeatures.mockReturnValue(false);
		const { container: container1 } = render(
			<Edit
				attributes={{
					...defaultAttributes,
					hasFeatures: false,
				}}
				setAttributes={mockSetAttributes}
				clientId="test-id"
				isSelected={true}
			/>
		);

		// Find the main block element
		let blockElement = container1.querySelector('.pm-integration-features-group');
		expect(blockElement).not.toHaveClass('has-features');

		// Test with hasFeatures = true
		mockComputeHasFeatures.mockReturnValue(true);
		const { container: container2 } = render(
			<Edit
				attributes={{
					...defaultAttributes,
					hasFeatures: true,
				}}
				setAttributes={mockSetAttributes}
				clientId="test-id"
				isSelected={true}
			/>
		);

		blockElement = container2.querySelector('.pm-integration-features-group');
		expect(blockElement).toHaveClass('has-features');
	});
});
