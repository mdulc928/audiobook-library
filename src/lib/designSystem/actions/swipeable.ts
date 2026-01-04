export interface SwipeableOptions {
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
	onDrag?: (offset: number) => void;
	onDragEnd?: (committed: boolean, direction: 1 | -1 | 0) => void;
	threshold?: number; // Minimum distance in pixels to trigger a swipe
}

export function swipeable(node: HTMLElement, options: SwipeableOptions) {
	let threshold = options.threshold ?? 80;

	let startX = 0;
	let startY = 0;
	let currentX = 0;
	let currentY = 0;
	let isDragging = false;
	let isHorizontalSwipe: boolean | null = null;

	// Save original touch-action and set to pan-y to allow vertical scroll but capture horizontal
	const originalTouchAction = node.style.touchAction;
	node.style.touchAction = 'pan-y pinch-zoom';

	let activePointerId: number | null = null;

	const handleStart = (e: PointerEvent) => {
		// Only respond to primary pointer (left mouse button or first touch)
		if (e.button !== 0 && e.pointerType === 'mouse') return;

		startX = e.clientX;
		startY = e.clientY;
		currentX = startX;
		currentY = startY;
		isDragging = true;
		isHorizontalSwipe = null;
		activePointerId = e.pointerId;

		// Don't capture pointer immediately - let clicks pass through to children
		// We'll capture on first horizontal movement
	};

	const handleMove = (e: PointerEvent) => {
		if (!isDragging || e.pointerId !== activePointerId) return;

		currentX = e.clientX;
		currentY = e.clientY;

		const deltaX = currentX - startX;
		const deltaY = currentY - startY;

		// Determine swipe direction on first significant movement
		if (isHorizontalSwipe === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
			isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

			// Capture pointer only once we know it's a horizontal swipe
			if (isHorizontalSwipe) {
				node.setPointerCapture(e.pointerId);
			}
		}

		// Prevent default scrolling behavior and emit drag offset during horizontal swipe
		if (isHorizontalSwipe) {
			e.preventDefault();
			options.onDrag?.(deltaX);
		}
	};

	const handleEnd = (e: PointerEvent) => {
		if (!isDragging || e.pointerId !== activePointerId) return;

		isDragging = false;

		// Only release pointer capture if we captured it (horizontal swipe)
		if (isHorizontalSwipe) {
			node.releasePointerCapture(e.pointerId);
		}

		const deltaX = currentX - startX;

		// Only trigger if it was determined to be a horizontal swipe
		if (isHorizontalSwipe) {
			if (deltaX > threshold) {
				options.onSwipeRight?.();
				options.onDragEnd?.(true, -1);
			} else if (deltaX < -threshold) {
				options.onSwipeLeft?.();
				options.onDragEnd?.(true, 1);
			} else {
				// Cancelled - didn't meet threshold
				options.onDragEnd?.(false, 0);
			}
		}
		// If not a horizontal swipe, don't call onDragEnd - let the click pass through

		isHorizontalSwipe = null;
		activePointerId = null;
	};

	const handleCancel = (e: PointerEvent) => {
		if (isDragging && e.pointerId === activePointerId) {
			if (isHorizontalSwipe) {
				node.releasePointerCapture(e.pointerId);
				options.onDragEnd?.(false, 0);
			}
			isDragging = false;
			isHorizontalSwipe = null;
			activePointerId = null;
		}
	};

	node.addEventListener('pointerdown', handleStart);
	node.addEventListener('pointermove', handleMove);
	node.addEventListener('pointerup', handleEnd);
	node.addEventListener('pointercancel', handleCancel);

	return {
		update(newOptions: SwipeableOptions) {
			options = newOptions;
			threshold = newOptions.threshold ?? 80;
		},
		destroy() {
			node.style.touchAction = originalTouchAction;
			node.removeEventListener('pointerdown', handleStart);
			node.removeEventListener('pointermove', handleMove);
			node.removeEventListener('pointerup', handleEnd);
			node.removeEventListener('pointercancel', handleCancel);
		}
	};
}
