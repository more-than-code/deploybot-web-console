export type ItemsResponse<T> = {
	code: number;
	msg: string;
	payload: {
		totalCount: number;
		items: T[];
	};
};

export type ItemResponse<T> = {
	code: number;
	msg: string;
	payload: T;
};
