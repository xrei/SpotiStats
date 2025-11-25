import type {StreamingEntry} from '@/features/Magic/data/entry'

const DB_NAME = 'spotistats-db'
const DB_VERSION = 1
const ENTRIES_STORE = 'streaming-entries'
const METADATA_STORE = 'metadata'
const METADATA_KEY = 'upload-info'

export type UploadMetadata = {
  uploadedAt: string
  fileCount: number
  totalEntries: number
}

class IndexedDBService {
  private db: IDBDatabase | null = null

  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
          const entriesStore = db.createObjectStore(ENTRIES_STORE, {
            autoIncrement: true,
          })
          entriesStore.createIndex('ts', 'ts', {unique: false})
        }

        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE)
        }
      }
    })
  }

  async saveEntries(entries: StreamingEntry[]): Promise<void> {
    const db = await this.initDB()
    const BATCH_SIZE = 5000

    const batches = []
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE)
      batches.push(this.writeBatch(db, batch))
    }

    await Promise.all(batches)
  }

  private writeBatch(db: IDBDatabase, batch: StreamingEntry[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ENTRIES_STORE], 'readwrite')
      const store = transaction.objectStore(ENTRIES_STORE)

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()

      for (const entry of batch) {
        store.add(entry)
      }
    })
  }

  async loadAllEntries(): Promise<StreamingEntry[]> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ENTRIES_STORE], 'readonly')
      const store = transaction.objectStore(ENTRIES_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result as StreamingEntry[])
    })
  }

  async clearAllEntries(): Promise<void> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ENTRIES_STORE], 'readwrite')
      const store = transaction.objectStore(ENTRIES_STORE)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getMetadata(): Promise<UploadMetadata | null> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readonly')
      const store = transaction.objectStore(METADATA_STORE)
      const request = store.get(METADATA_KEY)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async setMetadata(metadata: UploadMetadata): Promise<void> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(METADATA_STORE)
      const request = store.put(metadata, METADATA_KEY)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async hasData(): Promise<boolean> {
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ENTRIES_STORE], 'readonly')
      const store = transaction.objectStore(ENTRIES_STORE)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result > 0)
    })
  }

  async clearAllData(): Promise<void> {
    await this.clearAllEntries()
    const db = await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(METADATA_STORE)
      const request = store.delete(METADATA_KEY)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  isSupported(): boolean {
    return typeof indexedDB !== 'undefined'
  }
}

export const indexedDBService = new IndexedDBService()
