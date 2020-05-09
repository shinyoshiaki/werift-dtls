import { ClientHello } from "../handshake/message/client/hello";
import { DtlsRandom } from "../handshake/random";
import { createFragments, createPlaintext } from "../record/builder";
import { UdpContext } from "../context/udp";
import { ClientContext } from "../context/client";
import { EllipticCurves } from "../handshake/extensions/ellipticCurves";
import { Signature } from "../handshake/extensions/signature";
import { NamedCurveAlgorithm } from "../cipher/namedCurve";
import { HashAlgorithm } from "../cipher/hash";
import { RecordContext } from "../context/record";
import { SignatureAlgorithm, CipherSuite } from "../cipher/const";

export const flight1 = async (
  udp: UdpContext,
  client: ClientContext,
  record: RecordContext
) => {
  const curve = EllipticCurves.createEmpty();
  curve.data = [
    NamedCurveAlgorithm.namedCurveX25519,
    NamedCurveAlgorithm.namedCurveP256,
  ];
  const signature = Signature.createEmpty();
  signature.data = [
    { hash: HashAlgorithm.sha256, signature: SignatureAlgorithm.ecdsa },
  ];

  const hello = new ClientHello(
    { major: 255 - 1, minor: 255 - 2 },
    new DtlsRandom(),
    Buffer.from([]),
    Buffer.from([]),
    [CipherSuite.EcdheEcdsaWithAes128GcmSha256],
    [0],
    [curve.extension, signature.extension]
  );

  const fragments = createFragments(client)([hello]);
  const packets = createPlaintext(client)(
    fragments,
    ++record.recordSequenceNumber
  );
  const buf = Buffer.concat(packets.map((v) => v.serialize()));

  client.version = hello.clientVersion;
  client.localRandom = DtlsRandom.from(hello.random);

  udp.send(buf);
};
