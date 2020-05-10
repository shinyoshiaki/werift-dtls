import { Handshake } from "../typings/domain";

export class DtlsContext {
  version = { major: 255 - 1, minor: 255 - 2 };
  lastFlight: Handshake[] = [];
  sequenceNumber = 0;
  epoch = 0;
  flight = 1;
  handshakeCache: { isLocal: boolean; data: Buffer; flight: number }[] = [];
  cookie?: Buffer;

  bufferHandshake(data: Buffer, isLocal: boolean, flight: number) {
    this.handshakeCache = [...this.handshakeCache, { isLocal, data, flight }];
  }
}
