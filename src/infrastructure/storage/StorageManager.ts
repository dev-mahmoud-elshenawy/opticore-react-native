import { IStorage } from './interfaces/IStorage';
import { SecureStorage } from './SecureStorage';
import { LocalStorage } from './LocalStorage';

export class StorageManager {
    private static instance: StorageManager;
    public readonly secure: IStorage;
    public readonly local: IStorage;

    private constructor() {
        this.secure = new SecureStorage();
        this.local = new LocalStorage();
    }

    public static getInstance(): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    public async clearAll(): Promise<void> {
        await Promise.all([this.secure.clear(), this.local.clear()]);
    }
}
