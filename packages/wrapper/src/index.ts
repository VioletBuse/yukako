export class AdminApiClient {
    private _sessionId: string;
    private _server: string;

    constructor(opts: { sessionId: string; server: string }) {
        this._sessionId = opts.sessionId;
        this._server = opts.server;
    }
}
