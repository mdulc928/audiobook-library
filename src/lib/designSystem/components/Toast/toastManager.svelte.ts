export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
	title?: string;
	duration?: number;
	dismissible?: boolean;
}

export type ToastOptions = Partial<Omit<ToastItem, 'id' | 'type'>>;

class ToastManager {
	toasts = $state<ToastItem[]>([]);

	constructor() {}

	add(type: ToastType, messageOrOptions: string | ToastOptions, options?: ToastOptions) {
		const id = crypto.randomUUID();
		let finalOptions: ToastOptions = {};
		let message = '';

		if (typeof messageOrOptions === 'string') {
			message = messageOrOptions;
			finalOptions = options || {};
		} else {
			finalOptions = messageOrOptions;
			message = finalOptions.message || '';
		}

		const duration = finalOptions.duration ?? 4000;

		const toast: ToastItem = {
			id,
			type,
			message,
			duration,
			dismissible: true,
			...finalOptions
		};

		this.toasts.push(toast);

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}

		return id;
	}

	remove(id: string) {
		const index = this.toasts.findIndex((t) => t.id === id);
		if (index > -1) {
			this.toasts.splice(index, 1);
		}
	}

	success(messageOrOptions: string | ToastOptions, options?: ToastOptions) {
		return this.add('success', messageOrOptions, options);
	}

	error(messageOrOptions: string | ToastOptions, options?: ToastOptions) {
		return this.add('error', messageOrOptions, options);
	}

	info(messageOrOptions: string | ToastOptions, options?: ToastOptions) {
		return this.add('info', messageOrOptions, options);
	}

	warn(messageOrOptions: string | ToastOptions, options?: ToastOptions) {
		return this.add('warning', messageOrOptions, options);
	}
}

export const toast = new ToastManager();
