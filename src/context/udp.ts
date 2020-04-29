import { Socket, RemoteInfo } from "dgram";

export class UdpContext {
  constructor(public socket: Socket, public rinfo: Partial<RemoteInfo>) {}
}
