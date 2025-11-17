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
	state: {
		get currentIcon() {
			const context = getContext();
			const { iconStyle, isOpen } = context;

			console.log('[Interactivity API] currentIcon getter - isOpen:', isOpen, 'iconStyle:', iconStyle);

			if (iconStyle === 'plus-minus') {
				return isOpen ? '−' : '+';
			}
			return isOpen ? '▲' : '▼';
		},
	},
	callbacks: {
		/**
		 * Initialize - runs when the block is mounted
		 * Set up native toggle event listener to sync context state
		 */
		init: () => {
			const context = getContext();
			const { ref } = getElement();

			const details = ref?.closest?.('details');

			if (details) {
				console.log('[Interactivity API] init - Setting up toggle listener');

				// Sync initial state
				context.isOpen = details.open;

				// Listen for native toggle events and update context
				details.addEventListener('toggle', () => {
					context.isOpen = details.open;
					console.log('[Interactivity API] toggle event - updated isOpen to:', details.open);
				});
			}
		},
	},
});

/**
 * NOTE: Empty accordion detection removed
 *
 * Empty blocks are now detected at save time via the hasDescription attribute,
 * so they render as plain <div> instead of <details> - no runtime cleanup needed.
 *
 * Migration: Existing blocks will update to the new system when edited.
 */
