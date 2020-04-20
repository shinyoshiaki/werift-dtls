import { Socket } from "dgram";
import { Options } from "../client";

export class RecordLayer {
  constructor(public udpSocket: Socket, public options: Options) {}
}
