export function longPress(node: HTMLElement, callback: () => void) {
	let timer: ReturnType<typeof setTimeout>;
	let isLongPress = false;

	const handleStart = (e: PointerEvent) => {
		if (e.button !== 0 && e.pointerType === 'mouse') return;
		isLongPress = false;
		timer = setTimeout(() => {
			isLongPress = true;
			callback();
			if (navigator.vibrate) navigator.vibrate(50);
		}, 500);
	};

	const handleEnd = () => {
		clearTimeout(timer);
	};

	const handleContextMenu = (e: Event) => {
		if (isLongPress) {
			e.preventDefault();
			// Reset
			isLongPress = false;
		}
	};

	node.addEventListener('pointerdown', handleStart);
	node.addEventListener('pointerup', handleEnd);
	node.addEventListener('pointercancel', handleEnd);
	node.addEventListener('pointerleave', handleEnd);
	node.addEventListener('contextmenu', handleContextMenu);

	return {
		destroy() {
			node.removeEventListener('pointerdown', handleStart);
			node.removeEventListener('pointerup', handleEnd);
			node.removeEventListener('pointercancel', handleEnd);
			node.removeEventListener('pointerleave', handleEnd);
			node.removeEventListener('contextmenu', handleContextMenu);
		}
	};
}
