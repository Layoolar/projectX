import { ClientSession, Db, MongoClient, ServerApiVersion } from 'mongodb';
import config from '@main/config';

export interface IMongoDatabase {
    getDb(): Db;
    startSession(): ClientSession;
    close(): Promise<void>;
}

export class MongoDatabase {
    private client: MongoClient;
    private database: Db;

    constructor() {
        console.log(config.DATABASE.DB_URI);
        this.client = new MongoClient(config.DATABASE.DB_URI || '', {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
        //this.client.connect();
        this.database = this.client.db(config.DATABASE.DB_NAME);
    }

    async connect(): Promise<void> {
        await this.client.connect();
        //this.database = this.client.db(config.DATABASE.DB_NAME);
    }

    getDb(): Db {
        return this.database;
    }

    startSession(): ClientSession {
        return this.client.startSession();
    }

    async close(): Promise<void> {
        this.client.close();
    }
}
