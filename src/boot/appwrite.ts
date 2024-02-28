import { Client, Account, AppwriteException } from 'appwrite';

const client = new Client();
const endpoint = process.env.API_ENDPOINT;
const project = process.env.PROJECT_ID;

client.setEndpoint(endpoint).setProject(project);

const account = new Account(client);

const startSession = () => {
	account.createOAuth2Session(
		process.env.OAUTH_PROVIDER,
		window.location.origin,
		window.location.origin
	);
};

const createSession = async (userId: string, secret: string) => {
	try {
		const res = await account.createEmailSession(userId, secret);
		return res;
	} catch (err) {
		return (err as AppwriteException).message;
	}
};

const getSession = async () => {
	try {
		const res = await account.getSession('current');
		return res;
	} catch (err) {
		return null;
	}
};

const endSession = async () => {
	try {
		const res = await account.deleteSessions();
		return res;
	} catch (err) {
		return (err as AppwriteException).message;
	}
};

export { startSession, createSession, getSession, endSession };
