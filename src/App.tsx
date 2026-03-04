import { useState } from 'react';
import { useSasAuth } from './auth';
import { ConnectionSettings } from './components/settings/ConnectionSettings';
import { getCurrentUser } from './api';
import { getSasViyaUrl } from './config';

const isElectron = __BUILD_MODE__ === 'electron';

function App() {
  const { isAuthenticated, isLoading, error, login, logout } = useSasAuth();
  const [userInfo, setUserInfo] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const fetchCurrentUser = async () => {
    setBusy(true);
    setApiError('');
    try {
      const user = await getCurrentUser();
      setUserInfo(JSON.stringify(user, null, 2));
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  if (isElectron && !window.electronAPI) {
    return <main className="page"><p>Electron preload bridge is not available.</p></main>;
  }

  return (
    <main className="page">
      <h1>SAS Viya React Template</h1>
      <p>Minimal starter preserving auth, Viya connection handling, and build targets.</p>

      <section className="card">
        <h2>Environment</h2>
        <ul>
          <li>Build mode: <strong>{__BUILD_MODE__}</strong></li>
          <li>SAS Viya URL: <strong>{getSasViyaUrl()}</strong></li>
        </ul>
      </section>

      {isElectron && (
        <section className="card">
          <h2>Connections (Electron)</h2>
          <ConnectionSettings />
        </section>
      )}

      <section className="card">
        <h2>Authentication</h2>
        <p>Status: <strong>{isLoading ? 'Checking…' : isAuthenticated ? 'Authenticated' : 'Signed out'}</strong></p>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button onClick={() => void login()} disabled={isLoading || isAuthenticated}>Login</button>
          <button onClick={() => void logout()} disabled={isLoading || !isAuthenticated}>Logout</button>
          <button onClick={() => void fetchCurrentUser()} disabled={busy || !isAuthenticated}>Call /identities/users/@currentUser</button>
        </div>
        {apiError && <p className="error">{apiError}</p>}
        {userInfo && <pre>{userInfo}</pre>}
      </section>
    </main>
  );
}

export default App;
