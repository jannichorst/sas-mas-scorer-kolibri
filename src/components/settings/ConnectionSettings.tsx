import { useCallback, useEffect, useState } from 'react';

type FormState = {
  name: string;
  viyaUrl: string;
  clientId: string;
  clientSecret: string;
  insecureSsl: boolean;
};

const DEFAULT_FORM: FormState = {
  name: '',
  viyaUrl: '',
  clientId: 'vscode',
  clientSecret: '',
  insecureSsl: false,
};

export function ConnectionSettings() {
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState('');

  const loadConnections = useCallback(async () => {
    if (!window.electronAPI) return;
    const [allConnections, activeConnection] = await Promise.all([
      window.electronAPI.getAllConnections(),
      window.electronAPI.getActiveConnection(),
    ]);
    setConnections(allConnections);
    setActiveId(activeConnection?.id ?? null);
  }, []);

  useEffect(() => {
    void loadConnections();
  }, [loadConnections]);

  const createConnection = async () => {
    if (!window.electronAPI) return;
    setError('');

    if (!form.name || !form.viyaUrl || !form.clientId) {
      setError('Name, Viya URL, and Client ID are required.');
      return;
    }

    await window.electronAPI.addConnection(form);
    setForm(DEFAULT_FORM);
    await loadConnections();
  };

  const setActiveConnection = async (id: string) => {
    if (!window.electronAPI) return;
    await window.electronAPI.setActiveConnection(id);
    await loadConnections();
  };

  const removeConnection = async (id: string) => {
    if (!window.electronAPI) return;
    await window.electronAPI.deleteConnection(id);
    await loadConnections();
  };

  return (
    <div>
      <div className="actions">
        <input placeholder="Connection name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="https://viya.example.com" value={form.viyaUrl} onChange={(e) => setForm({ ...form, viyaUrl: e.target.value })} />
        <input placeholder="Client ID" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} />
        <input placeholder="Client Secret (optional)" value={form.clientSecret} onChange={(e) => setForm({ ...form, clientSecret: e.target.value })} />
        <label>
          <input type="checkbox" checked={form.insecureSsl} onChange={(e) => setForm({ ...form, insecureSsl: e.target.checked })} />
          Allow insecure SSL
        </label>
        <button onClick={() => void createConnection()}>Add connection</button>
      </div>

      {error && <p className="error">{error}</p>}

      <ul>
        {connections.map((connection) => (
          <li key={connection.id}>
            <strong>{connection.name}</strong> — {connection.viyaUrl}
            {connection.id === activeId ? ' (active)' : ''}
            <div className="actions">
              <button onClick={() => void setActiveConnection(connection.id)} disabled={connection.id === activeId}>Set active</button>
              <button onClick={() => void removeConnection(connection.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
