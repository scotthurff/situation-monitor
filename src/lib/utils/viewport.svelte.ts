/**
 * Viewport utility - Reactive mobile detection
 */

import { browser } from '$app/environment';

const MOBILE_BREAKPOINT = 768;

// Reactive state
let isMobile = $state(false);

// Initialize on browser
if (browser) {
	// Set initial value
	isMobile = window.innerWidth < MOBILE_BREAKPOINT;

	// Listen for resize
	window.addEventListener('resize', () => {
		isMobile = window.innerWidth < MOBILE_BREAKPOINT;
	});
}

// Export viewport interface
export const viewport = {
	get isMobile() {
		return isMobile;
	},
	get isDesktop() {
		return !isMobile;
	},
	get breakpoint() {
		return MOBILE_BREAKPOINT;
	}
};
