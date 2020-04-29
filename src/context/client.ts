export class ClientContext {
  version = { major: 255 - 1, minor: 255 - 2 };
  lastFlight: unknown[] = [];
  lastSentSeqNum = -1;
}
