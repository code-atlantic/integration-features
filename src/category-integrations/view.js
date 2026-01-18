/**
 * Interactivity API store for Category Integrations block
 *
 * Handles:
 * - Collapse/expand toggle for collapsed mode
 * - Tease mode "View all" inline expansion
 * - Keyboard accessibility
 */

import { store, getContext, getElement } from '@wordpress/interactivity';

store('popup-maker/category-integrations', {
	state: {
		/**
		 * Check if block is currently expanded
		 */
		get isExpanded() {
			const context = getContext();
			return context.isExpanded;
		},
	},

	actions: {
		/**
		 * Toggle collapsed state (header click)
		 */
		toggleExpand: () => {
			const context = getContext();
			const { ref } = getElement();

			// Only toggle if in collapsed mode
			if (context.displayMode !== 'collapsed') {
				return;
			}

			context.isExpanded = !context.isExpanded;

			// Find the parent block
			const blockEl = ref.closest('.pm-category-integrations');

			// Toggle collapsed class on block
			if (blockEl) {
				blockEl.classList.toggle('is-collapsed', !context.isExpanded);
			}

			// Toggle visibility of links container
			const linksEl = blockEl?.querySelector('.pm-category-integrations__links');
			if (linksEl) {
				linksEl.classList.toggle('is-hidden', !context.isExpanded);
			}

			// Toggle chevron rotation
			const toggleEl = ref.querySelector('.pm-category-integrations__toggle');
			if (toggleEl) {
				toggleEl.classList.toggle('is-collapsed', !context.isExpanded);
				toggleEl.classList.toggle('is-expanded', context.isExpanded);
			}
		},

		/**
		 * Handle keyboard navigation for collapsed mode
		 */
		handleKeydown: (event) => {
			// Only handle Enter or Space
			if (!['Enter', ' '].includes(event.key)) {
				return;
			}

			event.preventDefault();

			const context = getContext();
			const { ref } = getElement();

			// Trigger same logic as click
			if (context.displayMode !== 'collapsed') {
				return;
			}

			context.isExpanded = !context.isExpanded;

			const blockEl = ref.closest('.pm-category-integrations');

			if (blockEl) {
				blockEl.classList.toggle('is-collapsed', !context.isExpanded);
			}

			const linksEl = blockEl?.querySelector('.pm-category-integrations__links');
			if (linksEl) {
				linksEl.classList.toggle('is-hidden', !context.isExpanded);
			}

			const toggleEl = ref.querySelector('.pm-category-integrations__toggle');
			if (toggleEl) {
				toggleEl.classList.toggle('is-collapsed', !context.isExpanded);
				toggleEl.classList.toggle('is-expanded', context.isExpanded);
			}
		},

		/**
		 * Expand tease mode to show all items (inline mode only)
		 */
		expandTease: () => {
			const { ref } = getElement();

			// Find all teased items and show them
			const blockEl = ref.closest('.pm-category-integrations');
			const teasedItems = blockEl?.querySelectorAll(
				'.pm-category-integrations__item.is-teased'
			);

			teasedItems?.forEach((item) => {
				item.classList.remove('is-teased');
			});

			// Hide the "View all" button
			ref.style.display = 'none';
			ref.setAttribute('aria-expanded', 'true');
		},
	},

	callbacks: {
		/**
		 * Initialize block on mount
		 */
		init: () => {
			const context = getContext();
			const { ref } = getElement();

			// Set initial state based on displayMode
			if (context.displayMode === 'collapsed') {
				// Start collapsed
				context.isExpanded = false;

				// Ensure collapsed class is set
				ref.classList.add('is-collapsed');

				// Hide links container
				const linksEl = ref.querySelector('.pm-category-integrations__links');
				if (linksEl) {
					linksEl.classList.add('is-hidden');
				}

				// Set toggle to collapsed state
				const toggleEl = ref.querySelector('.pm-category-integrations__toggle');
				if (toggleEl) {
					toggleEl.classList.add('is-collapsed');
					toggleEl.classList.remove('is-expanded');
				}
			} else if (context.displayMode === 'expanded') {
				// Start expanded
				context.isExpanded = true;
				ref.classList.remove('is-collapsed');
			}
			// Tease mode: items beyond teaseCount already have is-teased class from PHP
		},
	},
});
