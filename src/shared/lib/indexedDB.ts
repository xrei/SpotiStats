import type {StreamingEntry} from '@/features/Magic/data/entry'

const DB_NAME = 'spotistats-db'
const DB_VERSION = 1
const ENTRIES_STORE = 'streaming-entries'
const METADATA_STORE = 'metadata'
const METADATA_KEY = 'upload-info'

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export type UploadMetadata = {
  uploadedAt: string
  totalEntries: number
}

export type StorageStats = {
  entryCount: number
  estimatedSizeBytes: number
  metadata: UploadMetadata | null
}

export type StorageEstimate = {
  usage: number
  quota: number
  available: number
}

export class QuotaExceededError extends Error {
  readonly required: number
  readonly available: number

  constructor(message: string, required: number, available: number) {
    super(message)
    this.name = 'QuotaExceededError'
    this.required = required
    this.available = available
  }
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
    // Pre-flight check: estimate if we have enough space
    const requiredSize = this.estimateDataSize(entries)
    const estimate = await this.getStorageEstimate()

    if (estimate && requiredSize > estimate.available * 0.9) {
      throw new QuotaExceededError(
        `Not enough storage space. Need ~${formatBytes(requiredSize)} but only ~${formatBytes(estimate.available)} free.`,
        requiredSize,
        estimate.available,
      )
    }

    const db = await this.initDB()
    const BATCH_SIZE = 5000

    // Write batches sequentially to better handle quota errors
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE)
      await this.writeBatch(db, batch)
    }
  }

  private writeBatch(db: IDBDatabase, batch: StreamingEntry[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ENTRIES_STORE], 'readwrite')
      const store = transaction.objectStore(ENTRIES_STORE)

      transaction.onabort = () => {
        const error = transaction.error
        // Check for QuotaExceededError (can come as abort or error)
        if (error?.name === 'QuotaExceededError') {
          reject(
            new QuotaExceededError(
              'Storage full. Please free up browser storage or clear site data.',
              0,
              0,
            ),
          )
        } else {
          reject(error)
        }
      }

      transaction.onerror = () => {
        const error = transaction.error
        if (error?.name === 'QuotaExceededError') {
          reject(
            new QuotaExceededError(
              'Storage full. Please free up browser storage or clear site data.',
              0,
              0,
            ),
          )
        } else {
          reject(error)
        }
      }

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

  async getStorageEstimate(): Promise<StorageEstimate | null> {
    if (!navigator.storage?.estimate) {
      return null
    }

    try {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage ?? 0
      const quota = estimate.quota ?? 0
      return {
        usage,
        quota,
        available: Math.max(0, quota - usage),
      }
    } catch {
      return null
    }
  }

  estimateDataSize(entries: unknown[]): number {
    // Rough estimate: JSON.stringify length * 2 (UTF-16) + IndexedDB overhead
    // More accurate than fixed 500 bytes per entry
    const sample = entries.slice(0, 100)
    const sampleSize = new Blob([JSON.stringify(sample)]).size
    const avgEntrySize = sample.length > 0 ? sampleSize / sample.length : 500
    return Math.ceil(entries.length * avgEntrySize * 1.2) // 20% overhead for IDB
  }

  async getStats(): Promise<StorageStats> {
    const db = await this.initDB()

    const [entryCount, metadata] = await Promise.all([
      this.getEntryCount(db),
      this.getMetadata(),
    ])

    // Rough estimate: ~500 bytes per entry (JSON overhead + field data)
    const estimatedSizeBytes = entryCount * 500

    return {
      entryCount,
      estimatedSizeBytes,
      metadata,
    }
  }

  private getEntryCount(db: IDBDatabase): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ENTRIES_STORE], 'readonly')
      const store = transaction.objectStore(ENTRIES_STORE)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}

export const indexedDBService = new IndexedDBService()
