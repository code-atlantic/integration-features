/**
 * Tests for Edit component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Edit from '../edit';
import type { IntegrationFeaturesGroupAttributes } from '../types';

// Mock WordPress dependencies
jest.mock('@wordpress/i18n', () => ({
	__: (text) => text,
}));

jest.mock('@wordpress/block-editor', () => ({
	useBlockProps: jest.fn(() => ({
		className: 'wp-block-test',
	})),
	useInnerBlocksProps: jest.fn((props) => ({
		...props,
		children: [],
	})),
	BlockControls: ({ children }) => <div>{children}</div>,
	InspectorControls: ({ children }) => <div>{children}</div>,
}));

jest.mock('@wordpress/components', () => ({
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

describe('Edit Component', () => {
	const defaultAttributes: IntegrationFeaturesGroupAttributes = {
		iconAnimation: 'rotate-45',
		oneOpenPerGroup: true,
		defaultOpen: false,
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

	it('renders icon animation toolbar options', () => {
		render(
			<Edit
				attributes={defaultAttributes}
				setAttributes={mockSetAttributes}
				clientId="test-id"
				isSelected={true}
			/>
		);

		expect(screen.getByText('Rotate 45° (Plus-to-X)')).toBeInTheDocument();
		expect(screen.getByText('Rotate 180° (Chevron Flip)')).toBeInTheDocument();
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

		// Re-render with hasFeatures true
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
