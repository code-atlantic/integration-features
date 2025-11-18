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
		 * Called when a child feature block is toggled
		 * Enforces "one open per group" if enabled
		 *
		 * @param {string} featureId - The feature's unique identifier
		 * @param {boolean} isOpen - Whether the feature is now open
		 */
		onFeatureToggle: (featureId, isOpen) => {
			const context = getContext();

			if (context.oneOpenPerGroup && isOpen) {
				// Close any currently open feature
				if (
					context.openFeatureId &&
					context.openFeatureId !== featureId
				) {
					// Trigger close on previous feature
					const prevFeature = document.querySelector(
						`[data-feature-id="${context.openFeatureId}"]`
					);
					if (prevFeature) {
						prevFeature.removeAttribute('open');
					}
				}

				// Update current open feature
				context.openFeatureId = isOpen ? featureId : null;
			} else if (!isOpen && context.openFeatureId === featureId) {
				// Feature was closed
				context.openFeatureId = null;
			}
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

			// Open first feature if defaultOpen is true
			if (context.defaultOpen) {
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
				context.groupId
			);
		},
	},
});
