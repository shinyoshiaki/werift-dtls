import { Handshake } from "../typings/domain";

export class ClientContext {
  version = { major: 255 - 1, minor: 255 - 2 };
  lastFlight: Handshake[] = [];
  sequenceNumber = 0;
  epoch = 0;
  flight = 0;
  handshakeCache: { isLocal: boolean; data: Buffer; flight: number }[] = [];

  bufferHandshake(data: Buffer, isLocal: boolean, flight: number) {
    this.handshakeCache = [...this.handshakeCache, { isLocal, data, flight }];
  }
}
