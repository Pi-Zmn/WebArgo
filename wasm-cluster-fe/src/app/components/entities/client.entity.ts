import {IResult} from 'ua-parser-js';

export interface Client {
    id: string;
    ready: boolean;
    info: IResult;
}
