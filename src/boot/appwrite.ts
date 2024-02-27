import { Client, ID, Account, AppwriteException } from 'appwrite';

const client = new Client();
const endpoint = process.env.API_ENDPOINT;
const project = process.env.PROJECT_ID;

client.setEndpoint(endpoint).setProject(project);

const account = new Account(client);

const createUser = async (email: string, pwd: string) => {
  try {
    const res = await account.create(ID.unique(), email, pwd);
    return res;
  } catch (err) {
    return (err as AppwriteException).message;
  }
};

const createSession = async (email: string, pwd: string) => {
  try {
    const res = await account.createEmailSession(email, pwd);
    return res;
  } catch (err) {
    return (err as AppwriteException).message;
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

const getUser = async () => {
  try {
    const res = await account.get();
    return res;
  } catch (err) {
    return null;
  }
};

export { createUser, createSession, endSession, getUser };
