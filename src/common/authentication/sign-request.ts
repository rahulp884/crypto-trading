import * as crypto from 'crypto';
import { stringify } from 'querystring';

export type SingRequestOptions = {
    key: string;
    secret: string;
    query: string;
    // form: { [prop: string]: any }
};

export type SignedRequest = {
    Key: string;
    Sign: string
};

export function signRequest(options: SingRequestOptions): SignedRequest {
    if (!options.key || !options.secret) {
        return null;
    }

    // let paramString = Object.keys(options.form).map(function (param) {
    //     return encodeURIComponent(param) + '=' + encodeURIComponent(options.form[param]);
    // }).join('&');

    let signature = crypto.createHmac('sha512', options.secret).update(options.query).digest('hex');

    return {
        Key: options.key,
        Sign: signature
    };
}
