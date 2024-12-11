export interface WorkerClient {
    id: string;
    ready: boolean;
    info: ClientInfo | undefined;
}

export interface ClientInfo {
    ua: string,
    browser: {
        major: any,
        name: any,
        version: any
    },
    cpu: {
        architecture: any
    },
    device: {
        model: any,
        type: any,
        vendor: any
    },
    engine: {
        name: any,
        version: any
    },
    os: {
        name: any,
        version: any
    }
}