/**
 * Unit tests for computeHasDescription utility
 * Tests the single source of truth for hasDescription computation
 */

import { computeHasDescription } from '../hasDescription';
import type { WPBlock } from '../../types';

describe('computeHasDescription', () => {
	describe('null and undefined handling', () => {
		it('returns false for null innerBlocks', () => {
			expect(computeHasDescription(null)).toBe(false);
		});

		it('returns false for undefined innerBlocks', () => {
			expect(computeHasDescription(undefined)).toBe(false);
		});

		it('returns false for empty array', () => {
			expect(computeHasDescription([])).toBe(false);
		});
	});

	describe('paragraph block detection', () => {
		it('returns false for paragraph with only whitespace', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: '   ' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});

		it('returns false for paragraph with empty content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: '' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});

		it('returns true for paragraph with text content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: 'This is a description' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});

		it('returns true for paragraph with HTML-formatted content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: '<strong>Bold text</strong>' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});

		it('strips HTML tags and checks for content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: '<p>  </p>' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});
	});

	describe('heading block detection', () => {
		it('returns false for heading with empty content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/heading',
					clientId: 'test-1',
					attributes: { content: '' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});

		it('returns true for heading with text content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/heading',
					clientId: 'test-1',
					attributes: { content: 'Section Title' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});
	});

	describe('list block detection', () => {
		it('returns false for list with empty values', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/list',
					clientId: 'test-1',
					attributes: { values: '' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});

		it('returns false for list with whitespace-only values', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/list',
					clientId: 'test-1',
					attributes: { values: '   ' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});

		it('returns true for list with content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/list',
					clientId: 'test-1',
					attributes: { values: '<li>Item 1</li><li>Item 2</li>' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});
	});

	describe('multiple blocks', () => {
		it('returns false when all blocks are empty', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: '' },
				},
				{
					name: 'core/heading',
					clientId: 'test-2',
					attributes: { content: '  ' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});

		it('returns true when at least one block has content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: '' },
				},
				{
					name: 'core/heading',
					clientId: 'test-2',
					attributes: { content: 'Valid heading' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});

		it('stops checking after finding content (early exit)', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: 'First paragraph' },
				},
				{
					name: 'core/paragraph',
					clientId: 'test-2',
					attributes: { content: 'Second paragraph' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});
	});

	describe('unknown block types', () => {
		it('returns true for unknown block types (future-proof)', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/custom-block',
					clientId: 'test-1',
					attributes: {},
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});

		it('assumes unknown blocks have content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/image',
					clientId: 'test-1',
					attributes: { url: 'https://example.com/image.jpg' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('handles blocks without attributes', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: undefined as any,
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});

		it('handles blocks with null attributes', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: null as any,
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});

		it('handles very long content strings', () => {
			const longContent = 'a'.repeat(10000);
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: longContent },
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});

		it('handles special characters and unicode', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: '🎯 Emoji content 中文' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(true);
		});

		it('handles nested HTML without text content', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: '<div><span></span></div>' },
				},
			];
			expect(computeHasDescription(blocks)).toBe(false);
		});
	});

	describe('innerBlocks support', () => {
		it('ignores innerBlocks property (not part of hasDescription logic)', () => {
			const blocks: WPBlock[] = [
				{
					name: 'core/paragraph',
					clientId: 'test-1',
					attributes: { content: '' },
					innerBlocks: [
						{
							name: 'core/paragraph',
							clientId: 'nested-1',
							attributes: { content: 'Nested content' },
						},
					],
				},
			];
			// computeHasDescription only checks top-level blocks, not nested innerBlocks
			expect(computeHasDescription(blocks)).toBe(false);
		});
	});
});
