
export interface IAdapter {
    configure(config: object): Promise<any>;
    executeQuery(query: string, params: any[]): Promise<any>;
}