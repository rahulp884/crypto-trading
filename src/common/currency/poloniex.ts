import crypto from 'crypto';
import config from 'config';
import nodeFetch from 'node-fetch';
const nonce = require('nonce')();
const version = require('../../../package.json').version;
const USER_AGENT = `${require('../../../package.json').name} ${version}`;
const DEFAULT_SOCKETTIMEOUT = 60 * 1000;
const DEFAULT_KEEPALIVE = true;

const PRIVATE_API_URL = 'https://poloniex.com/tradingApi'
export class Poloniex /**extends RPC*/ {

    private key;
    private secret;
    private options;

    async getAllBalances(): Promise<any> {
        this.key = config['POLONIEX_KEY'];
        this.secret = config['POLONIEX_SECRET'];
        this.options = {};
        const result = await this.returnBalances();
        return result;
    }


    returnBalances() {
        let parameters = {};
        return this.accessPrivateAPI('returnBalances', parameters);
    }

    public accessPrivateAPI(command, parameters) {
        Object.keys(parameters).forEach((key) => {
            if (typeof parameters[key] === 'function') {
                throw new Error('Invalid parameters');
            }
        });

        let param = parameters;
        param.command = command;
        param.nonce = this.options && this.options.nonce ? this.options.nonce() : nonce(16);
        let options = {
            method: 'POST',
            body: this.getFormData(param),
            headers: this.getPrivateHeaders(param)
        };
        if (options.headers) {
            return this.makeRequest(options);
        } else {
            let err = new Error('Error: API key and secret required');
            throw err;
        }
    }

    private getPrivateHeaders(parameters) {
        if (!this.key || !this.secret) {
            return null;
        }

        let paramString = Object.keys(parameters).map(function (param) {
            return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
        }).join('&');

        let signature = crypto.createHmac('sha512', this.secret).update(paramString).digest('hex');
        return {
            Key: this.key,
            Sign: signature
        };
    }

    private getFormData(formData) {
        const params = new URLSearchParams();
        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                const element = formData[key];
                params.append(key, element);
            }
        }
        return params;
    }

    private async makeRequest(options) {
        try {
            if (!('headers' in options)) {
                options.headers = {};
            }

            options.json = true;
            // add custom headers only if they are not already defined
            if (this.options !== undefined && this.options.headers !== undefined) {
                for (let h in this.options.headers) {
                    if (this.options.headers.hasOwnProperty(h) && options.headers[h] === undefined) {
                        options.headers[h] = this.options.headers[h];
                    }
                }
            }

            options.headers['User-Agent'] = options.headers['User-Agent'] || USER_AGENT;
            options.strictSSL = true;
            options.timeout = this.options && this.options.socketTimeout || DEFAULT_SOCKETTIMEOUT;
            options.forever = this.options && this.options.hasOwnProperty('keepAlive') ? this.options.keepAlive : DEFAULT_KEEPALIVE;
            if (options.forever) {
                options.headers['Connection'] = options.headers['Connection'] || 'keep-alive';
            }

            if (this.options && this.options.hasOwnProperty('proxy')) {
                options.proxy = this.options.proxy;
            }

            if (this.options && this.options.hasOwnProperty('agent')) {
                options.agent = this.options.agent;
            }
            console.log(options);
            const res = await nodeFetch(PRIVATE_API_URL, options)
            return await res.json();
        } catch (error) {
            console.log('Error in fetch request: ', error);
            throw error;
        };
    }

}
