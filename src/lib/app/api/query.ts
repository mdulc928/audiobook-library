export type QueryState<T> = {
	data: T | undefined;
	isPending: boolean;
	isError: boolean;
	lastUpdated: number;
	staleTime: number;
};
