import { SocketType, Socket, createSocket } from "dgram";

export type Options = SocketType;

export class Client {
  udp: Socket;
  constructor(private options: Options) {
    this.udp = createSocket(options).on("listening", this.udpOnListening);
  }

  private udpOnListening = () => {};
}
