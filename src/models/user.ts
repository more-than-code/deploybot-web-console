export type Authentication = {
	userId: string;
	accessToken: string;
	refreshToken: string;
};

export type AuthenticationResponse = {
  code: number
  msg: string
  payload: Authentication
}