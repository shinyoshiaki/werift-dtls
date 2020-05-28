import { Transport } from "../transport";

export class UdpContext {
  constructor(public socket: Transport) {}

  send(buf: Buffer) {
    this.socket.send(buf);
  }
}
