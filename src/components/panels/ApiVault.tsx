import { useState, useCallback } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { setSecureObject, getSecureObject } from '@/lib/storage';
import { v4 as uuid } from 'uuid';

interface Credential {
  id: string;
  service: string;
  key: string;
  baseUrl?: string;
  tags: string[];
  createdAt: Date;
  lastUsed?: Date;
}

export default function ApiVault() {
  const { passPhrase } = useDashboardStore();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newService, setNewService] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newBaseUrl, setNewBaseUrl] = useState('');
  const [maskedIds, setMaskedIds] = useState<Set<string>>(new Set());

  const toggleMask = (id: string) => {
    setMaskedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCredential = useCallback(async () => {
    if (!newService.trim() || !newKey.trim() || !passPhrase) return;

    const cred: Credential = {
      id: uuid(),
      service: newService.trim(),
      key: newKey.trim(),
      baseUrl: newBaseUrl.trim() || undefined,
      tags: [],
      createdAt: new Date(),
    };

    const updated = [...credentials, cred];
    setCredentials(updated);
    await setSecureObject('credentials', updated, passPhrase);

    setNewService('');
    setNewKey('');
    setNewBaseUrl('');
    setShowAdd(false);
  }, [newService, newKey, newBaseUrl, passPhrase, credentials]);

  const copyKey = useCallback(async (key: string) => {
    await navigator.clipboard.writeText(key);
  }, []);

  const maskKey = (key: string, id: string): string => {
    if (maskedIds.has(id) || key.length < 8) return '*'.repeat(key.length);
    return key.slice(0, 4) + '*'.repeat(Math.min(key.length - 8, 20)) + key.slice(-4);
  };

  return (
    <div className='flex flex-col h-full p-3 gap-2'>
      <div className='flex items-center justify-between flex-shrink-0'>
        <h2 className='font-orbitron text-xs font-bold text-plasma-cyan tracking-widest uppercase'>
          API Vault
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className='px-2 py-0.5 text-[9px] font-jetbrains text-plasma-cyan border border-plasma-cyan/30 rounded hover:bg-plasma-cyan/10'
        >
          + Add
        </button>
      </div>

      {!passPhrase ? (
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-[9px] text-plasma-amber text-center font-jetbrains'>
            Set passphrase in Command Desk to unlock vault
          </p>
        </div>
      ) : (
        <div className='flex-1 overflow-y-auto space-y-1.5 min-h-0'>
          {credentials.length === 0 && (
            <p className='text-[9px] text-text-muted text-center mt-4 font-jetbrains'>
              No credentials stored
            </p>
          )}
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className='bg-black/30 rounded p-2 border border-white/5 hover:border-plasma-cyan/20 transition-colors'
            >
              <div className='flex items-center justify-between mb-1'>
                <span className='text-[10px] font-jetbrains text-text-primary font-semibold'>
                  {cred.service}
                </span>
                <div className='flex gap-1'>
                  <button
                    onClick={() => toggleMask(cred.id)}
                    className='text-[7px] text-text-muted hover:text-plasma-cyan'
                  >
                    {maskedIds.has(cred.id) ? 'Show' : 'Hide'}
                  </button>
                  <button
                    onClick={() => copyKey(cred.key)}
                    className='text-[7px] text-text-muted hover:text-plasma-green'
                  >
                    Copy
                  </button>
                </div>
              </div>
              <p className='text-[8px] font-space text-text-muted break-all'>
                {maskKey(cred.key, cred.id)}
              </p>
              {cred.baseUrl && (
                <p className='text-[7px] font-jetbrains text-text-muted/60 mt-0.5 truncate'>
                  {cred.baseUrl}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
          <div className='glass-panel p-4 w-64 flex flex-col gap-2'>
            <h3 className='font-orbitron text-xs text-plasma-cyan font-bold'>Add Credential</h3>
            <input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder='Service name'
              className='bg-black/40 border border-plasma-cyan/20 rounded px-2 py-1.5 text-[10px] text-text-primary font-jetbrains focus:outline-none focus:border-plasma-cyan/50'
              autoFocus
            />
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder='API key'
              type='password'
              className='bg-black/40 border border-plasma-cyan/20 rounded px-2 py-1.5 text-[10px] text-text-primary font-jetbrains focus:outline-none focus:border-plasma-cyan/50'
            />
            <input
              value={newBaseUrl}
              onChange={(e) => setNewBaseUrl(e.target.value)}
              placeholder='Base URL (optional)'
              className='bg-black/40 border border-plasma-cyan/20 rounded px-2 py-1.5 text-[10px] text-text-primary font-jetbrains focus:outline-none focus:border-plasma-cyan/50'
            />
            <div className='flex gap-2'>
              <button
                onClick={() => setShowAdd(false)}
                className='flex-1 py-1.5 text-[9px] font-jetbrains text-text-muted border border-text-muted/30 rounded hover:bg-white/5'
              >
                Cancel
              </button>
              <button
                onClick={addCredential}
                disabled={!passPhrase}
                className='flex-1 py-1.5 text-[9px] font-jetbrains text-plasma-cyan border border-plasma-cyan/30 rounded hover:bg-plasma-cyan/10 disabled:opacity-30'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}