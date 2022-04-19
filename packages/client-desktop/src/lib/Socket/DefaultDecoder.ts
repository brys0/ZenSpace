import ISocketDecoder, { SocketResponse } from "./SocketDecode";

export default class DefaultDecoder implements ISocketDecoder {
    async decode(data: ArrayBuffer | string): Promise<SocketResponse> { 
        return JSON.parse(data as string) as SocketResponse
    }
}