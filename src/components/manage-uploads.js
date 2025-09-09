'use client';

import { useEffect, useMemo, useState } from 'react';
import { auth, db, storage } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { deleteObject, ref as storageRef } from 'firebase/storage';

export default function ManageUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null); // track an item being deleted

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  const uid = user?.uid || null;

  useEffect(() => {
    if (!authReady) {
      return; // wait until we know auth state
    }
    if (!uid) {
      setLoading(false);
      setUploads([]);
      return;
    }

    setLoading(true);
    setError('');

    const baseQ = query(
      collection(db, 'resumes'),
      where('userId', '==', uid)
    );

    // prefer ordered snapshot; if it fails due to missing index, fall back
    let unsub = onSnapshot(
      query(baseQ, orderBy('createdAt', 'desc')),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUploads(items);
        setLoading(false);
      },
      (err) => {
        console.error('[uploads:onSnapshot]', err);
        if (err?.code === 'failed-precondition') {
          // likely missing composite index (userId ==, orderBy createdAt)
          // fall back to un-ordered query and sort client-side
          const fallbackUnsub = onSnapshot(
            baseQ,
            (fsnap) => {
              const items = fsnap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((a, b) => {
                  const ad = a?.createdAt?.toDate?.() || (a?.createdAt ? new Date(a.createdAt) : 0);
                  const bd = b?.createdAt?.toDate?.() || (b?.createdAt ? new Date(b.createdAt) : 0);
                  return bd - ad;
                });
              setUploads(items);
              setLoading(false);
            },
            (e2) => {
              console.error('[uploads:fallbackSnapshot]', e2);
              setError(humanizeFirestoreError(e2));
              setLoading(false);
            }
          );
          unsub = fallbackUnsub;
        } else {
          setError(humanizeFirestoreError(err));
          setLoading(false);
        }
      }
    );

    return () => unsub && unsub();
  }, [authReady, uid]);

  const hasUploads = useMemo(() => uploads && uploads.length > 0, [uploads]);

  useEffect(() => {
    // prune selections that are no longer present
    if (!uploads?.length && selectedIds.size) {
      setSelectedIds(new Set());
      return;
    }
    const ids = new Set(uploads.map(u => u.id));
    const next = new Set();
    selectedIds.forEach(id => { if (ids.has(id)) next.add(id); });
    if (next.size !== selectedIds.size) setSelectedIds(next);
  }, [uploads]);

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

  const handleView = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (url, name = 'resume.pdf') => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    const ok = window.confirm('Delete this upload? This cannot be undone.');
    if (!ok) return;

    setBusyId(item.id);
    setError('');

    try {
      // 1) Delete file in Storage (if we have a path)
      const path = item?.file?.path;
      if (path) {
        const sref = storageRef(storage, path);
        await deleteObject(sref);
      }

      // 2) Delete Firestore document
      await deleteDoc(doc(db, 'resumes', item.id));
    } catch (e) {
      console.error(e);
      setError('Failed to delete.');
    } finally {
      setBusyId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    const ok = window.confirm(`Delete ${selectedIds.size} item(s)? This cannot be undone.`);
    if (!ok) return;
    setBulkBusy(true);
    setError('');
    try {
      const idSet = new Set(selectedIds);
      const items = uploads.filter(u => idSet.has(u.id));
      await Promise.all(items.map(async (item) => {
        try {
          const path = item?.file?.path;
          if (path) {
            const sref = storageRef(storage, path);
            await deleteObject(sref);
          }
          await deleteDoc(doc(db, 'resumes', item.id));
        } catch (e) {
          console.error('[bulk delete] failed for', item.id, e);
          throw e;
        }
      }));
      setSelectedIds(new Set());
    } catch (e) {
      setError('One or more items failed to delete.');
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="pb-24 text-sm">
      <section className="mx-4 xl:mx-auto max-w-5xl flex flex-col bg-artic-blue rounded-lg p-8 md:px-20 md:py-12 font-main">
        <div className="flex flex-col w-full">
          <h2 className="font-semibold text-2xl font-headings my-4">Manage Uploads</h2>

          {authReady && !uid && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-yellow-900 text-lg">
              Please sign in with Google to view your uploads.
            </div>
          )}

          {loading && (
            <div className="animate-pulse text-lg">Loading uploads…</div>
          )}

          {error && (
            <div className="rounded-md border text-lg border-red-200 bg-red-50 p-3 text-red-700">{error}</div>
          )}

          {authReady && !loading && uid && !hasUploads && (
            <div className="text-lg">No uploads yet. Upload a PDF from the home page.</div>
          )}

          {hasUploads && (
            <div className='bg-white py-4 rounded-lg'>
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
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Uploaded</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60">
                    {uploads.map((u) => {
                      const name = u?.file?.name || 'resume.pdf';
                      const url = u?.file?.downloadURL || '';
                      const created = u?.createdAt?.toDate?.() || (u?.createdAt ? new Date(u.createdAt) : null);
                      const when = created
                        ? created.toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                        : '—';
                      const status = u?.status || 'uploaded';

                      return (
                        <tr key={u.id} className="align-middle">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(u.id)}
                              onChange={() => toggleOne(u.id)}
                              aria-label={`Select ${name}`}
                              disabled={bulkBusy}
                            />
                          </td>
                          <td className="px-3 py-2 font-medium">{name}</td>
                          <td className="px-3 py-2 capitalize">
                            {status}
                          </td>
                          <td className="px-3 py-2">{when}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleView(url)}
                                className="rounded-full border-2 border-dm-black px-3 py-1 hover:bg-gray-100"
                                disabled={bulkBusy || !url}
                                title="View"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDownload(url, name)}
                                className="rounded-full border-2 border-dm-black px-3 py-1 hover:bg-gray-100"
                                disabled={bulkBusy || !url}
                                title="Download"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => handleDelete(u)}
                                className="rounded-full border border-red-700 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100 disabled:opacity-60"
                                disabled={bulkBusy || busyId === u.id}
                                title="Delete"
                              >
                                {busyId === u.id ? 'Deleting…' : 'Delete'}
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
    </div>
  );
}

function humanizeFirestoreError(err) {
  const code = err?.code || '';
  switch (code) {
    case 'permission-denied':
      return 'You do not have permission to read uploads. Check Firestore security rules.';
    case 'failed-precondition':
      return 'A Firestore index is required for this query. Try again or create the suggested index.';
    default:
      return err?.message || 'Failed to fetch uploads.';
  }
}