import { RemoteInfo, Socket } from "dgram";
import { ClientHello } from "../handshake/message/client/hello";
import { dtlsRandom } from "../handshake/random";
import { createFragments } from "../record/builder";
import { DtlsPlaintext } from "../record/message/plaintext";

export const flight1 = (socket: Socket, rinfo: Partial<RemoteInfo>) => {
  const clientHello = new ClientHello(
    { major: 255 - 1, minor: 255 - 2 },
    dtlsRandom(),
    Buffer.from([]),
    Buffer.from([]),
    [139],
    [0],
    []
  );
  const fragments = createFragments([clientHello]);
  const buf = Buffer.concat(
    fragments.map((msg) => {
      const packet = new DtlsPlaintext(
        {
          contentType: msg.type,
          protocolVersion: clientHello.clientVersion,
          epoch: 0,
          sequenceNumber: 0,
          contentLen: msg.fragmentData.length,
        },
        msg.fragment
      );
      return packet.serialize();
    })
  );

  socket.send(buf, rinfo.port, rinfo.address);
};
