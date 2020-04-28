import { Socket } from "dgram";
import { Options } from "../client";
import { AntiReplayWindow } from "./antiReplayWindow";

export type Epoch = {
  index: number;
  connectionState: any;
  writeSequenceNumber: number;
  antiReplayWindow: AntiReplayWindow;
};

export class RecordLayer {
  receiveEpoch = 0;
  sendEpoch = 0;

  constructor(public udpSocket: Socket, public options: Options) {}
}
