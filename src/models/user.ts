export type Authentication = {
	userId: string;
	accessToken: string;
	refreshToken: string;
};

export type AuthenticationResponse = {
	code: number;
	msg: string;
	payload: Authentication;
};

export type User = {
	id: string;
	subject: string;
	email: string;
	contactEmail: string;
	name: string;
	avatarUrl: string;
	createdAt: number;
};
