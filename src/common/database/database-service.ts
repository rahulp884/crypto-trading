import config from 'config';
import path from 'path';

import { EDATABASE } from '../enum';
import { IAdapter } from './adapter/adapter';


export class DatabaseService {

    private configured;
    private static _instance;
    private adapter: IAdapter;

    private constructor() {
        this.configured = false;
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public async configure(): Promise<any> {
        if (!this.configured) {
            const dbAdapter = config.DATABASE_ADAPTER;
            if (!dbAdapter) {
                throw new Error(EDATABASE.CONFIG_ADAPTER);
            }
            const file = path.join(path.resolve(__dirname), `./adapter/${dbAdapter}-database`);
            console.log('connecting database: ', file);
            const adapterConstructor = await import(file);
            this.adapter = new adapterConstructor.DatabaseAdapter();
            await this.adapter.configure(config.DATABASE[dbAdapter]);
        }
    }

    public async executeQuery(query: string, params: any[]) {
        this.adapter.executeQuery(query, params);
    }

}
