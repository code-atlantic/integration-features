/**
 * Interactivity API store for Integration Features Group block
 *
 * Handles group coordination:
 * - Track which feature is currently open
 * - Enforce "one open per group" logic
 * - Coordinate with child feature blocks
 */

import { store, getContext, getElement } from '@wordpress/interactivity';

store('popup-maker/integration-features-group', {
	state: {
		/**
		 * Get currently open feature ID for this group
		 */
		get openFeatureId() {
			const context = getContext();
			return context.openFeatureId || null;
		},
	},

	actions: {
		/**
		 * Toggle group collapsed state (header click)
		 */
		toggleGroup: () => {
			const context = getContext();
			const { ref } = getElement();

			// Toggle collapsed state
			context.groupCollapsed = !context.groupCollapsed;

			// Find the parent block (ref is the header, need to go up to block wrapper)
			const blockEl = ref.closest('.pm-integration-features-group');

			// Update parent block collapsed class
			if (blockEl) {
				blockEl.classList.toggle('is-collapsed', context.groupCollapsed);
			}

			// Update features visibility
			const featuresEl = blockEl?.querySelector('.pm-integration-features-group__features');
			if (featuresEl) {
				featuresEl.classList.toggle('is-hidden', context.groupCollapsed);
			}

			// Update chevron rotation (toggleEl is within ref, the header)
			const toggleEl = ref.querySelector('.pm-integration-features-group__toggle');
			if (toggleEl) {
				if (context.groupCollapsed) {
					toggleEl.classList.add('is-collapsed');
					toggleEl.classList.remove('is-expanded');
				} else {
					toggleEl.classList.remove('is-collapsed');
					toggleEl.classList.add('is-expanded');
				}
			}

			console.log('[Integration Features Group] toggled - collapsed:', context.groupCollapsed);
		},

		/**
		 * Called by child feature blocks when they toggle
		 * Group listens to coordinate "one open per group" if enabled
		 *
		 * @param {string} featureId - The feature's unique identifier
		 * @param {boolean} isOpen - Whether the feature is now open
		 */
		onFeatureToggle: (featureId, isOpen) => {
			const context = getContext();
			const { ref } = getElement();

			if (context.oneOpenPerGroup && isOpen) {
				// If another feature just opened, close the currently open one
				if (context.openFeatureId && context.openFeatureId !== featureId) {
					// Dispatch custom event that child feature will listen to
					const closeEvent = new CustomEvent('pm-group-close-feature', {
						detail: { featureId: context.openFeatureId },
						bubbles: true
					});
					ref.dispatchEvent(closeEvent);

					console.log('[Integration Features Group] Requesting close of:', context.openFeatureId);
				}

				// Update current open feature
				context.openFeatureId = isOpen ? featureId : null;
			} else if (!isOpen && context.openFeatureId === featureId) {
				// Feature was closed
				context.openFeatureId = null;
			}

			console.log('[Integration Features Group] Feature toggled:', featureId, 'isOpen:', isOpen);
		},
	},

	callbacks: {
		/**
		 * Initialize group on mount
		 */
		init: () => {
			const context = getContext();
			const { ref } = getElement();

			// Set unique group ID
			context.groupId =
				ref.id || `group-${Math.random().toString(36).substr(2, 9)}`;

			// Initialize group collapsed state (from context, defaults to true)
			if (context.groupCollapsed === undefined) {
				context.groupCollapsed = true;
			}

			// Set initial collapsed class on parent block
			ref.classList.toggle('is-collapsed', context.groupCollapsed);

			// Set initial visibility of features based on groupCollapsed
			const featuresEl = ref.querySelector('.pm-integration-features-group__features');
			if (featuresEl) {
				featuresEl.classList.toggle('is-hidden', context.groupCollapsed);
			}

			// Set initial chevron state
			const toggleEl = ref.querySelector('.pm-integration-features-group__toggle');
			if (toggleEl) {
				if (context.groupCollapsed) {
					toggleEl.classList.add('is-collapsed');
					toggleEl.classList.remove('is-expanded');
				} else {
					toggleEl.classList.remove('is-collapsed');
					toggleEl.classList.add('is-expanded');
				}
			}

			// Open first feature if defaultOpen is true
			if (context.defaultOpen && !context.groupCollapsed) {
				const firstFeature = ref.querySelector(
					'[data-wp-interactive="popup-maker/integration-feature"] details'
				);
				if (firstFeature) {
					firstFeature.setAttribute('open', '');
					context.openFeatureId =
						firstFeature.dataset.featureId ||
						firstFeature.id;
				}
			}

			console.log(
				'[Integration Features Group] init - groupId:',
				context.groupId,
				'collapsed:',
				context.groupCollapsed
			);
		},
	},
});
