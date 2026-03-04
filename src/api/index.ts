import { viyaClient } from './client';

export const getCurrentUser = async (): Promise<unknown> => {
  const response = await viyaClient.get('/identities/users/@currentUser', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export { clearCsrfToken, getSasViyaUrl } from './client';
