/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

/**
 * Integration Feature Interactive Store
 *
 * Handles accordion toggle behavior and icon updates on the frontend
 */
store('popup-maker/integration-feature', {
	actions: {
		/**
		 * Toggle accordion open/closed state
		 * Syncs with the native details element's open state
		 */
		toggle: () => {
			const context = getContext();
			const { ref } = getElement();

			// Get the details element
			const details = ref.closest('details');

			// Sync context with the native details element's open state
			// Note: The native details element toggles AFTER this handler runs,
			// so we need to read the CURRENT state and invert it
			if (details) {
				context.isOpen = !details.open;
			} else {
				// Fallback if not in a details element
				context.isOpen = !context.isOpen;
			}
		},
	},
	callbacks: {
		/**
		 * Get the appropriate icon based on style and open state
		 * Reads from the native details element to ensure sync
		 */
		getIcon: () => {
			const context = getContext();
			const { ref } = getElement();
			const { iconStyle } = context;

			// Get the actual open state from the details element
			const details = ref.closest('details');
			const isOpen = details ? details.open : context.isOpen;

			if (iconStyle === 'plus-minus') {
				return isOpen ? '−' : '+';
			}
			return isOpen ? '▲' : '▼';
		},
	},
});
