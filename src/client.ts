import { SocketType, Socket, createSocket } from "dgram";
import { RecordLayer } from "./record/recordLayer";

export type Options = SocketType;

export class Client {
  udp: Socket;
  constructor(private options: Options) {
    this.udp = createSocket(options).on("listening", this.udpOnListening);
  }

  private udpOnListening = () => {
    const recordLayer = new RecordLayer(this.udp, this.options);
  };
}
