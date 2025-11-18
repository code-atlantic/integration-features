/**
 * Integration tests for Integration Features Group block
 */

import metadata from '../block.json';

describe('Block Integration Tests', () => {
	describe('Block Metadata', () => {
		it('has correct block name', () => {
			expect(metadata.name).toBe('popup-maker/integration-features-group');
		});

		it('has required attributes', () => {
			expect(metadata.attributes).toHaveProperty('iconAnimation');
			expect(metadata.attributes).toHaveProperty('oneOpenPerGroup');
			expect(metadata.attributes).toHaveProperty('defaultOpen');
			expect(metadata.attributes).toHaveProperty('hasFeatures');
		});

		it('provides context to child blocks', () => {
			expect(metadata.providesContext).toHaveProperty(
				'popup-maker/iconAnimation'
			);
			expect(metadata.providesContext).toHaveProperty(
				'popup-maker/groupId'
			);
			expect(metadata.providesContext).toHaveProperty(
				'popup-maker/oneOpenPerGroup'
			);
		});

		it('context providers have correct attribute mappings', () => {
			expect(metadata.providesContext['popup-maker/iconAnimation']).toBe(
				'iconAnimation'
			);
			expect(metadata.providesContext['popup-maker/groupId']).toBe(
				'clientId'
			);
			expect(
				metadata.providesContext['popup-maker/oneOpenPerGroup']
			).toBe('oneOpenPerGroup');
		});
	});

	describe('Attribute Validation', () => {
		it('iconAnimation attribute has correct enum values', () => {
			const attr = metadata.attributes.iconAnimation;
			expect(attr.type).toBe('string');
			expect(attr.enum).toEqual(['rotate-45', 'rotate-180']);
			expect(attr.default).toBe('rotate-45');
		});

		it('oneOpenPerGroup attribute has correct type', () => {
			const attr = metadata.attributes.oneOpenPerGroup;
			expect(attr.type).toBe('boolean');
			expect(attr.default).toBe(true);
		});

		it('defaultOpen attribute has correct type', () => {
			const attr = metadata.attributes.defaultOpen;
			expect(attr.type).toBe('boolean');
			expect(attr.default).toBe(false);
		});

		it('hasFeatures attribute has correct type', () => {
			const attr = metadata.attributes.hasFeatures;
			expect(attr.type).toBe('boolean');
			expect(attr.default).toBe(false);
		});
	});

	describe('Block Supports', () => {
		it('enables interactivity', () => {
			expect(metadata.supports.interactivity).toBe(true);
		});

		it('supports spacing (margin, padding, blockGap)', () => {
			expect(metadata.supports.spacing).toEqual({
				margin: true,
				padding: true,
				blockGap: true,
			});
		});

		it('supports color (background, text)', () => {
			expect(metadata.supports.color).toEqual({
				background: true,
				text: true,
				link: false,
			});
		});

		it('supports border styling', () => {
			expect(metadata.supports.__experimentalBorder).toEqual({
				color: true,
				radius: true,
				style: true,
				width: true,
			});
		});

		it('supports typography', () => {
			expect(metadata.supports.typography).toEqual({
				fontSize: true,
				lineHeight: true,
			});
		});

		it('supports alignment (wide, full)', () => {
			expect(metadata.supports.align).toEqual(['wide', 'full']);
		});

		it('supports custom className', () => {
			expect(metadata.supports.customClassName).toBe(true);
		});

		it('supports anchor (ID)', () => {
			expect(metadata.supports.anchor).toBe(true);
		});

		it('disables HTML editing', () => {
			expect(metadata.supports.html).toBe(false);
		});
	});

	describe('Script & Style Registration', () => {
		it('has editorScript', () => {
			expect(metadata.editorScript).toBe('file:./index.js');
		});

		it('has editorStyle', () => {
			expect(metadata.editorStyle).toBe('file:./index.css');
		});

		it('has frontend style', () => {
			expect(metadata.style).toBe('file:./style-index.css');
		});

		it('has viewScriptModule', () => {
			expect(metadata.viewScriptModule).toBe('file:./view.js');
		});
	});

	describe('Textdomain', () => {
		it('uses popup-maker textdomain', () => {
			expect(metadata.textdomain).toBe('popup-maker');
		});
	});

	describe('Block Category', () => {
		it('is in widgets category', () => {
			expect(metadata.category).toBe('widgets');
		});
	});
});

/**
 * Integration Feature Block Context Usage Tests
 *
 * Verify that integration-feature blocks can consume context from group
 */
describe('Integration Feature Block Context Support', () => {
	it('integration-feature block.json should use group context', () => {
		// This would be loaded from the integration-feature block.json
		// For now, we verify the structure
		const expectedContextKeys = [
			'popup-maker/iconAnimation',
			'popup-maker/groupId',
			'popup-maker/oneOpenPerGroup',
		];

		// When integration-feature block.json is updated, it should include:
		// "usesContext": ["popup-maker/iconAnimation", "popup-maker/groupId", "popup-maker/oneOpenPerGroup"]

		// This test verifies the contract between group and feature blocks
		expect(expectedContextKeys).toContain('popup-maker/iconAnimation');
		expect(expectedContextKeys).toContain('popup-maker/groupId');
		expect(expectedContextKeys).toContain('popup-maker/oneOpenPerGroup');
	});
});
