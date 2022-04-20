import { AppStore } from "@/stores/AppStore";
import { SnackStore } from "@/stores/SnackStore";
import EventEmitter from "events";
import { Client, SocketCompressionType, SocketProperties } from "./Client";
import Logger from "./Logger";
import DefaultDecoder from "./Socket/DefaultDecoder";
import ISocketDecoder, { FriendType, OPCodes, RecieveCodes, SocketResponse } from "./Socket/SocketDecode";
import ZLibDecoder from "./Socket/ZLibDecoder";
import { IMessage } from "./structures/Messages";
import { IUser, OnlineStatus } from "./structures/Users";


export declare interface ChattySocket {
    on(event: 'connected', listener: () => void): this
    on(event: 'error', listener: () => Error): this
    on(event: 'authenticated', listener: () => SocketAuthenticated): this
    // Heartbeat for WebSocket
    on(event: 'internal://heartbeat', listener: () => void): this
    // Internal identify self
    on(event: 'internal://identify', listener: () => void): this
    // Internal presence control
    on(event: 'presence', listener: () => void): this
    // * Finish voice
    on(event: 'voice', listener: () => void): this
    // * Create resume payload
    on(event: 'internal://resume', listener: () => void): this
    // ! Invalid client
    on(event: 'internal://invalid', listener: () => void): this
    // First message we recieve
    on(event: 'internal://hello', listener: () => void): this
    on(event: 'invalid', listener: () => void): this
    on(event: 'internal://ack', listener: () => void): this
    /* Recieve */
    on(event: 'internal://recieve', listener: () => any): this
    on(event: 'presence', listener: () => SocketPresence): this
    on(event: 'internal://selfmessage', listener: () => IMessage): this
    on(event: 'friend://ext/deny', listener: () => IUser): this
    on(event: 'friend://int/deny', listener: () => IUser): this
    on(event: 'friend://ext/accept', listener: () => IUser): this
    on(event: 'friend://int/accept', listener: () => IUser): this
    on(event: 'friend://ext/pending', listener: () => IUser): this
    on(event: 'friend://int/pending', listener: () => void): this
    on(event: 'friend://ext/removed', listener: () => IUser): this
    on(event: 'friend://int/removed', listener: () => IUser): this
}
export class ChattySocket extends EventEmitter {
    client: Client;
    compression: SocketCompressionType;
    gateway: string;
    binaryType: SocketBinaryType;
    state: SocketState;
    decoder: ISocketDecoder;
    ws?: WebSocket;
    logger: Logger;
    failureSnack: string;
    reconnector: NodeJS.Timer;
    constructor(client: Client) {
        super();
        this.client = client;
        this.compression = this.client.options.socket!!.compression;
        this.gateway = `${this.client.gateway}/ws?compression=${this.compression}`;
        this.binaryType = (this.compression != "none") ? "arraybuffer" : null;
        this.state = SocketState.INITIALIZED;
        this.decoder = (this.compression = "zlib") ? new ZLibDecoder() : new DefaultDecoder();
        this.logger = new Logger();
        this.logger.logInfo('ChattySocket', 'Init', null);
    }
    async start() {
        this.ws = new WebSocket(`${this.gateway}`);
        this.logger.logInfo('ChattySocket::Start', 'Fast Connect establishing connection', this.ws);
        let snackStore = SnackStore();
        let appStore = AppStore();
        let startFastConnect = Date.now();
        if (this.binaryType) this.ws.binaryType = this.binaryType;

        return new Promise((resolve, reject) => {
            this.ws!!.onopen = () => {
                this.emit('connected');
                this.state = SocketState.CONNECTED;
                this.logger.logSuccess('ChattySocket::Start', `Fast Connect connection established in ${Date.now() - startFastConnect}ms`, this.ws);
                if (this.failureSnack) {
                    snackStore.remove(this.failureSnack);
                    snackStore.create('success', 'Back Online', true, 5000);
                }
                appStore.setOffline(false);
                resolve(this.ws);
            }
            this.ws!!.onerror = (err: Event) => {
                this.emit('error', err);
                this.state = SocketState.DISCONNECTED;
                console.log('Something went wrong', err)
                reject(this.ws);
            }
        })
    }
    async $login() {
        if (!this.ws) throw new Error("Websocket hasn't started");
        if (!this.client.options.auth) throw new Error("Client.options.auth doesn't exist yet");
        this.state = SocketState.AUTHENTICATING;
        let payload: SocketLogin = {
            op: 2,
            token: this.client.options.auth,
            properties: {
                os: 'Windows',
                browser: 'Desktop',
                build: '1.9.2'
            }
        }
        this.ws!!.send(JSON.stringify(payload));
        this.$heartbeat();
        this.$stream();
    }
    async $heartbeat() {

        setInterval(() => {
            if (this.state == SocketState.DISCONNECTED) {
                this.logger.logWarn('ChattySocket', `Can't send 💓 to server as client is currently disconnected`, null);
                return
            } else {
                this.ws!!.send(
                    JSON.stringify({
                        op: 1,
                    })
                );
            }
        }, 30000);
    }
    $tryReconnect() {
        this.logger.logWarn('ChattySocket', 'Attempting to reconnect', null);
        this.start().then(() => {
            this.$login();
            clearInterval(this.reconnector)
        }).catch((err) => {
            console.error('Failed to reconnect', err);
        });
    }
    $stream() {
        let snackStore = SnackStore();
        let appStore = AppStore();
        if (!this.ws) throw new Error("Websocket hasn't started");
        this.ws!!.onerror = (err: Event) => {
            this.emit('error', err);
            this.state = SocketState.DISCONNECTED;
            console.log('Something went wrong', err)
        };
        this.ws!!.onclose = (e: CloseEvent) => {
            this.state = SocketState.DISCONNECTED;
            this.logger.logWarn('ChattySocket', 'Websocket closed', e);
            this.failureSnack = snackStore.create('error', `Disconnected from server`, false, null).id;
            this.reconnector = setInterval(() => {
                this.$tryReconnect();
            }, 10000)
            appStore.setOffline(true);
        }
        this.ws!!.onmessage = async (event: MessageEvent) => {
            let message = (this.compression == "zlib") ? await this.decoder.decode(event.data) : await this.decoder.decode(event.data);
            switch (message.op) {
                case OPCodes.Dispatch: {
                    this.emit('authenticated', {
                        user: message.d.user
                    });
                    this.state = SocketState.CONNECTED;
                    break;
                }
                case OPCodes.Heartbeat: {
                    this.emit('internal://heartbeat');
                    break;
                }
                case OPCodes.Identify: {
                    this.emit('internal://identify');
                    break;
                }
                case OPCodes.Presence: {
                    this.emit('presence', message.d.user);
                    break;
                }
                case OPCodes.Voice: {
                    this.emit('internal://voice');
                    break;
                }
                case OPCodes.Resume: {
                    this.emit('internal://resume');
                    break;
                }
                case OPCodes.Invalid: {
                    this.emit('internal://invalid');
                    break;
                }
                case OPCodes.Hello: {
                    this.emit('internal://hello');
                    break;
                }
                case OPCodes.ACK: {
                    this.emit('internal://ack');
                    break;
                }
                case OPCodes.Recieve: {
                    this.emit('internal://recieve', message.d);
                    switch (message.type!!) {
                        case RecieveCodes.INVALID_AUTH: {
                            this.emit('invalid', message.d.expiry);
                            break;
                        }
                        case RecieveCodes.Message: {
                            console.log('MESSAGE', message);
                            this.emit('message', {
                                user: message.d.user,
                                message: message.d.message
                            });
                            break;
                        }
                        case RecieveCodes.Presence: {
                            this.emit('presence', {
                                id: message.d.id,
                                status: message.d.status,
                                online: message.d.online
                            })
                            break;
                        }
                        case RecieveCodes.SELF: {
                            this.emit('internal://selfmessage', {
                                user: message.d.user,
                                message: message.d.message
                            });
                            break;
                        }
                        case RecieveCodes.Friend: {
                            switch (message.d.ft) {
                                case FriendType.DENY: {
                                    if (message.d.ft == 0) {
                                        this.emit('friend://ext/deny', message.d.friend);
                                    } else {
                                        this.emit('friend://int/deny', message.d.user);
                                    }
                                    break;
                                }
                                case FriendType.ACCEPT: {
                                    if (message.d.ft == 1) {
                                        this.emit('friend://ext/accept', message.d.friend);
                                    } else {
                                        this.emit('friend://int/accept', message.d.user);
                                    }
                                    break;
                                }
                                case FriendType.PENDING: {
                                    if (message.d.ft == 2) {
                                        this.emit('friend://ext/pending', message.d.user);
                                    } else {
                                        this.emit('friend://int/pending');
                                    }
                                    break;
                                }
                                case FriendType.REMOVED: {
                                    if (message.d.ft == 3) {
                                        this.emit('friend://ext/removed', message.d.user);
                                    } else {
                                        this.emit('friend://int/removed', message.d.user);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
}

export type SocketBinaryType = "arraybuffer" | "blob" | null;
export enum SocketState {
    INITIALIZED = 0,
    DISCONNECTED = 1,
    AUTHENTICATING = 2,
    CONNECTED = 3,
}

export interface SocketLogin {
    op: number,
    token: string,
    properties: SocketProperties
}

export interface SocketAuthenticated extends SocketResponse {
    user: string
}
export interface SocketPresence extends SocketResponse {
    user: IUser
}
export interface SocketMessage extends SocketResponse {
    user: IUser
    message: IMessage
}
export interface SocketPresence extends SocketResponse {
    id: string,
    status?: SocketStatus
    online: OnlineStatus
}

export interface SocketStatus extends SocketResponse {
    text: string;
    icon: string;
}