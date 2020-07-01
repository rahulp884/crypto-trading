import mysql from 'mysql2';
import bluebird from 'bluebird';

import { IAdapter } from './adapter';

export class DatabaseAdapter implements IAdapter {

    private db;

    public async configure(config) {
        try {
            if (!this.db) {
                config.Promise = bluebird;
                // to test if credentials are correct
                await mysql.createConnection(config);
                const pool = mysql.createPool(config);
                // now get a Promise wrapped instance of that pool
                const promisePool = pool.promise();
                this.db = promisePool;
            }
            return this.db;
        } catch (err) {
            console.error('Error in database connection', err);
        }
    }

    public async executeQuery(query: string, params: any[]) {
        const result = await this.db.query(query, params);
        this.db.release();
        return result;
    }

}
