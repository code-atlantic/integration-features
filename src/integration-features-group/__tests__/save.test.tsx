/**
 * Tests for Save component
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Save from '../save';
import type { IntegrationFeaturesGroupAttributes } from '../types';

// Mock WordPress dependencies
jest.mock('@wordpress/block-editor', () => ({
	useBlockProps: {
		save: jest.fn((props) => props),
	},
	useInnerBlocksProps: {
		save: jest.fn((props) => ({
			...props,
			children: [],
		})),
	},
}));

describe('Save Component', () => {
	const defaultAttributes: IntegrationFeaturesGroupAttributes = {
		iconAnimation: 'rotate-45',
		oneOpenPerGroup: true,
		defaultOpen: false,
		hasFeatures: false,
	};

	it('renders without crashing', () => {
		const { container } = render(
			<Save attributes={defaultAttributes} />
		);

		expect(container).toBeInTheDocument();
	});

	it('renders main block div', () => {
		const { container } = render(
			<Save attributes={defaultAttributes} />
		);

		const blockDiv = container.querySelector(
			'.pm-integration-features-group'
		);
		expect(blockDiv).toBeInTheDocument();
	});

	it('includes Interactivity API attributes', () => {
		const { container } = render(
			<Save attributes={defaultAttributes} />
		);

		const blockDiv = container.querySelector(
			'.pm-integration-features-group'
		);

		expect(blockDiv).toHaveAttribute(
			'data-wp-interactive',
			'popup-maker/integration-features-group'
		);
		expect(blockDiv).toHaveAttribute('data-wp-context');
		expect(blockDiv).toHaveAttribute(
			'data-wp-init',
			'callbacks.init'
		);
	});

	it('sets correct context values in data-wp-context', () => {
		const { container } = render(
			<Save attributes={defaultAttributes} />
		);

		const blockDiv = container.querySelector(
			'.pm-integration-features-group'
		);
		const contextStr = blockDiv?.getAttribute('data-wp-context');
		const context = JSON.parse(contextStr || '{}');

		expect(context.iconAnimation).toBe('rotate-45');
		expect(context.oneOpenPerGroup).toBe(true);
		expect(context.defaultOpen).toBe(false);
		expect(context.openFeatureId).toBeNull();
	});

	it('applies has-features class when hasFeatures is true', () => {
		const { container } = render(
			<Save
				attributes={{
					...defaultAttributes,
					hasFeatures: true,
				}}
			/>
		);

		const blockDiv = container.querySelector(
			'.pm-integration-features-group'
		);
		expect(blockDiv).toHaveClass('has-features');
	});

	it('does not apply has-features class when hasFeatures is false', () => {
		const { container } = render(
			<Save attributes={defaultAttributes} />
		);

		const blockDiv = container.querySelector(
			'.pm-integration-features-group'
		);
		expect(blockDiv).not.toHaveClass('has-features');
	});

	it('respects different icon animation values', () => {
		const { container } = render(
			<Save
				attributes={{
					...defaultAttributes,
					iconAnimation: 'rotate-180',
				}}
			/>
		);

		const blockDiv = container.querySelector(
			'.pm-integration-features-group'
		);
		const contextStr = blockDiv?.getAttribute('data-wp-context');
		const context = JSON.parse(contextStr || '{}');

		expect(context.iconAnimation).toBe('rotate-180');
	});

	it('respects different oneOpenPerGroup values', () => {
		const { container } = render(
			<Save
				attributes={{
					...defaultAttributes,
					oneOpenPerGroup: false,
				}}
			/>
		);

		const blockDiv = container.querySelector(
			'.pm-integration-features-group'
		);
		const contextStr = blockDiv?.getAttribute('data-wp-context');
		const context = JSON.parse(contextStr || '{}');

		expect(context.oneOpenPerGroup).toBe(false);
	});

	it('respects different defaultOpen values', () => {
		const { container } = render(
			<Save
				attributes={{
					...defaultAttributes,
					defaultOpen: true,
				}}
			/>
		);

		const blockDiv = container.querySelector(
			'.pm-integration-features-group'
		);
		const contextStr = blockDiv?.getAttribute('data-wp-context');
		const context = JSON.parse(contextStr || '{}');

		expect(context.defaultOpen).toBe(true);
	});

	it('renders InnerBlocks content area', () => {
		const { container } = render(
			<Save attributes={defaultAttributes} />
		);

		const contentDiv = container.querySelector(
			'.pm-integration-features-group__content'
		);
		expect(contentDiv).toBeInTheDocument();
	});
});
