export type ApiResponse<T> = {
	code: number;
	msg: string;
	payload: {
		totalCount: number;
		items: T[];
	};
};
