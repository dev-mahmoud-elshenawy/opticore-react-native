export class LoggingInterceptor {
    constructor() { }

    public onRequest(config: any): any {
        // Placeholder for Logger integration
        // console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    }

    public onResponse(response: any): any {
        // console.log(`[Response] ${response.status} ${response.config.url}`);
        return response;
    }

    public onError(error: any): Promise<any> {
        // console.error(`[Error] ${error.message}`);
        return Promise.reject(error);
    }
}
