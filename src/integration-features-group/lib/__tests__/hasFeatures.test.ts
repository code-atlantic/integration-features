/**
 * Tests for hasFeatures utility function
 */

import { computeHasFeatures } from '../hasFeatures';
import type { WPBlock } from '../../types';

describe('computeHasFeatures', () => {
	it('returns false for null input', () => {
		expect(computeHasFeatures(null)).toBe(false);
	});

	it('returns false for undefined input', () => {
		expect(computeHasFeatures(undefined)).toBe(false);
	});

	it('returns false for empty array', () => {
		expect(computeHasFeatures([])).toBe(false);
	});

	it('returns true when integration-feature blocks present', () => {
		const blocks: WPBlock[] = [
			{
				name: 'core/image',
				clientId: 'img-1',
				attributes: {},
			},
			{
				name: 'popup-maker/integration-feature',
				clientId: 'feature-1',
				attributes: {},
			},
		];

		expect(computeHasFeatures(blocks)).toBe(true);
	});

	it('returns false when no integration-feature blocks', () => {
		const blocks: WPBlock[] = [
			{
				name: 'core/image',
				clientId: 'img-1',
				attributes: {},
			},
			{
				name: 'core/heading',
				clientId: 'h-1',
				attributes: {},
			},
			{
				name: 'core/paragraph',
				clientId: 'p-1',
				attributes: {},
			},
		];

		expect(computeHasFeatures(blocks)).toBe(false);
	});

	it('returns true when multiple integration-feature blocks present', () => {
		const blocks: WPBlock[] = [
			{
				name: 'popup-maker/integration-feature',
				clientId: 'feature-1',
				attributes: {},
			},
			{
				name: 'popup-maker/integration-feature',
				clientId: 'feature-2',
				attributes: {},
			},
		];

		expect(computeHasFeatures(blocks)).toBe(true);
	});

	it('returns true even with mixed block types', () => {
		const blocks: WPBlock[] = [
			{
				name: 'core/image',
				clientId: 'img-1',
				attributes: {},
			},
			{
				name: 'core/heading',
				clientId: 'h-1',
				attributes: {},
			},
			{
				name: 'popup-maker/integration-feature',
				clientId: 'feature-1',
				attributes: {},
			},
			{
				name: 'core/paragraph',
				clientId: 'p-1',
				attributes: {},
			},
		];

		expect(computeHasFeatures(blocks)).toBe(true);
	});
});
