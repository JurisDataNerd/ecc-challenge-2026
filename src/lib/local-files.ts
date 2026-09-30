import type { SubmissionFile } from '../types';
import type { ParticipantDemoState } from './progress';

async function fileStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('fq-simulation-files', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('File storage blocked'));
  });
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction('files', mode);
      const request = action(transaction.objectStore('files'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('File storage aborted'));
    });
  } finally { db.close(); }
}
export async function storeFile(scope: string, file: File): Promise<SubmissionFile> {
  const id = crypto.randomUUID();
  const storageKey = `${scope}:${id}`;
  await fileStore('readwrite', store => store.put(file, storageKey));
  return { id, storageKey, name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file) };
}
export async function removeFile(file: SubmissionFile) {
  if (file.storageKey) await fileStore('readwrite', store => store.delete(file.storageKey!));
  if (file.url) URL.revokeObjectURL(file.url);
}
export async function restoreFiles(progress: ParticipantDemoState) {
  const restored = structuredClone(progress);
  let missing = false;
  for (const submission of Object.values(restored.submissions)) {
    for (const file of submission.files) {
      if (!file.storageKey) { missing = true; continue; }
      try {
        const blob = await fileStore('readonly', store => store.get(file.storageKey!) as IDBRequest<Blob | undefined>);
        if (blob instanceof Blob) file.url = URL.createObjectURL(blob);
        else missing = true;
      } catch { missing = true; }
    }
  }
  return { progress: restored, error: missing ? 'Sebagian lampiran tidak tersedia di browser ini. Ringkasan tetap tersimpan; unggah ulang bukti yang hilang.' : null };
}
