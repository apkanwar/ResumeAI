'use client';
import { useEffect, useState, useRef } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserUploads, deleteResume, deleteSelected as deleteSelectedFn } from '@/lib/firebase-resume';
import { Delete, Visibility } from '@mui/icons-material';
import ViewAnalysis from '@/components/analysis/view-analysis';
import ScoreRing from './ring';

export default function ManageUploads({ panelClassName = "bg-artic-blue" }) {
  const [uploads, setUploads] = useState([]);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [busyId, setBusyId] = useState(null); // track an item being deleted
  const [uid, setUid] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const analysisRef = useRef(null);

  // Checking Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u ? u.uid : null));
    return () => unsub();
  }, []);

  // Fetching Uploads for User
  useEffect(() => {
    if (uid === null) {
      setStatus({ state: 'signed-out', message: 'Please Sign In to View Uploads' });
      setUploads([]);
      return;
    }

    (async () => {
      try {
        setStatus({ state: 'loading', message: 'Fetching Uploads' });
        const list = await getUserUploads();
        setUploads(list);
        setStatus({ state: 'idle', message: '' });
      } catch (e) {
        console.error('Error Fetching Uploads', e);
        setStatus({ state: 'error', message: 'Error Fetching Uploads, Please Try Again Later' });
      }
    })();
  }, [uid]);

  // Seletion Logic
  const hasUploads = uploads.length > 0;
  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const allSelected = hasUploads && uploads.every(u => selectedIds.has(u.id));
  const toggleAll = () => {
    if (allSelected) { setSelectedIds(new Set()); }
    else { setSelectedIds(new Set(uploads.map(u => u.id))); }
  };

  const viewAnalysis = (item) => {
    analysisRef.current?.open(item);
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    const ok = window.confirm('Delete this upload? This cannot be undone.');
    if (!ok) return;

    setBusyId(item.id);
    setStatus({ state: 'loading', message: 'Deleting…' });

    try {
      await deleteResume(item.id, item.file.path);
      const list = await getUserUploads();
      setUploads(list);
      setStatus({ state: 'idle', message: '' });
    } catch (e) {
      console.error('Delelte Error', e);
      setStatus({ state: 'error', message: 'Failed to Delete.' });
    } finally {
      setBusyId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    const ok = window.confirm(`Delete ${selectedIds.size} item(s)? This cannot be undone.`);
    if (!ok) return;
    setBulkBusy(true);
    setStatus({ state: 'loading', message: 'Deleting selected…' });
    try {
      const idSet = new Set(selectedIds);
      const items = uploads
        .filter(u => idSet.has(u.id))
        .map(u => ({ id: u.id, path: u.file.path }));
      await deleteSelectedFn(items);
      setSelectedIds(new Set());
      const list = await getUserUploads();
      setUploads(list);
      setStatus({ state: 'idle', message: '' });
    } catch (e) {
      console.error('Bulk Delete Error', e);
      setStatus({ state: 'error', message: 'One or more items failed to delete.' });
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="pb-24">
      <section className={`mx-4 xl:mx-auto max-w-5xl flex flex-col ${panelClassName} rounded-lg p-8 md:px-20 md:py-12 font-main`}>
        <div className="flex flex-col w-full">
          <h2 className="font-semibold text-2xl font-headings my-4">Manage Uploads</h2>

          {uid === null && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-yellow-900 text-lg">
              Please sign in with Google to view your uploads.
            </div>
          )}

          {status.state === 'loading' && (
            <div className="animate-pulse rounded-md border border-blue-200 bg-blue-50 p-3 text-blue-900 text-lg">{status.message || 'Fetching Uploads…'}</div>
          )}

          {status.state === 'error' && (
            <div className="rounded-md border text-lg border-red-200 bg-red-50 p-3 text-red-700">{status.message || 'Something went wrong.'}</div>
          )}

          {status.state !== 'loading' && uid && !hasUploads && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-blue-900 text-lg">No uploads yet. Upload a PDF or DOCX from the home page.</div>
          )}

          {hasUploads && (
            <div className='bg-white pt-4 rounded-lg'>
              <div className="flex items-center justify-between border-b-2 pb-2 px-4">
                <div className="">{uploads.length} Upload{uploads.length === 1 ? '' : 's'}</div>
                <button
                  onClick={handleBulkDelete}
                  disabled={!selectedIds.size || bulkBusy}
                  className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  {bulkBusy ? 'Deleting…' : `Delete Selected (${selectedIds.size})`}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b-2 bg-gray-200">
                      <th className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          aria-label="Select all"
                        />
                      </th>
                      <th className="px-3 py-2">File</th>
                      <th className="px-3 py-2">Overall</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Uploaded</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60">
                    {uploads.map((u) => {
                      const created = u.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      const s = u?.analysis?.ai?.scores || null;
                      let overall = null;
                      if (s && ['objective', 'subjective', 'design', 'employer'].every(k => typeof s[k] === 'number')) {
                        overall = Math.round((s.objective + s.subjective + s.design + s.employer) / 4);
                      }
                      return (
                        <tr key={u.id} className="align-middle">
                          <td className="px-3 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(u.id)}
                              onChange={() => toggleOne(u.id)}
                              aria-label={`Select ${u.file.name}`}
                              disabled={bulkBusy}
                            />
                          </td>
                          <td className="px-3 py-2 font-medium">{u.file.name}</td>
                          <td className="px-3 py-2">
                            {overall === null ? (
                              <span className="text-gray-400 text-sm">—</span>
                            ) : (
                              <ScoreRing value={overall} size='32' stroke='4' className='!items-start' />
                            )}
                          </td>
                          <td className="px-3 py-2 capitalize">{u.status}</td>
                          <td className="px-3 py-2">{created}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className={`rounded-full border border-dm-black p-1 text-xs ${u.status === 'analyzed' ? 'hover:bg-gray-200' : 'opacity-60 cursor-not-allowed'}`}
                                disabled={u.status !== 'analyzed'}
                                onClick={() => viewAnalysis(u)}
                                title="View Analysis"
                              >
                                <Visibility fontSize='small' />
                              </button>
                              <button
                                onClick={() => handleDelete(u)}
                                className="rounded-full border border-red-700 bg-red-50 p-1 text-xs text-red-700 hover:bg-red-100 disabled:opacity-60"
                                disabled={bulkBusy || busyId === u.id}
                                title="Delete Upload"
                              >
                                {busyId === u.id ? (
                                  <svg className="animate-spin h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                  </svg>
                                ) : (
                                  <Delete fontSize="small" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
      <ViewAnalysis ref={analysisRef} />
    </div>
  );
}
