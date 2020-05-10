import { ClientHello } from "../../handshake/message/client/hello";
import { DtlsRandom } from "../../handshake/random";
import { createFragments, createPlaintext } from "../../record/builder";
import { UdpContext } from "../../context/udp";
import { DtlsContext } from "../../context/client";
import { EllipticCurves } from "../../handshake/extensions/ellipticCurves";
import { Signature } from "../../handshake/extensions/signature";
import { generateKeyPair, supportedCurveFilter } from "../../cipher/namedCurve";
import { RecordContext } from "../../context/record";
import { CipherContext } from "../../context/cipher";
import { ServerHelloVerifyRequest } from "../../handshake/message/server/helloVerifyRequest";
import { randomBytes } from "crypto";

export const flight2 = (
  udp: UdpContext,
  dtls: DtlsContext,
  record: RecordContext,
  cipher: CipherContext
) => (clientHello: ClientHello) => {
  cipher.remoteRandom = DtlsRandom.from(clientHello.random);
  cipher.cipherSuite = clientHello.cipherSuites[0];
  clientHello.extensions.forEach((extension) => {
    switch (extension.type) {
      case EllipticCurves.type:
        {
          const curves = EllipticCurves.fromData(extension.data).data;
          cipher.namedCurve = supportedCurveFilter(curves)[0];
        }
        break;
      case Signature.type:
        {
        }
        break;
    }
  });

  cipher.localKeyPair = generateKeyPair(cipher.namedCurve!);
  dtls.cookie = randomBytes(20);
  const helloVerifyReq = new ServerHelloVerifyRequest(
    {
      major: 255 - 1,
      minor: 255 - 2,
    },
    dtls.cookie
  );
  const fragments = createFragments(dtls)([helloVerifyReq]);
  const packets = createPlaintext(dtls)(
    fragments,
    ++record.recordSequenceNumber
  );
  const buf = Buffer.concat(packets.map((v) => v.serialize()));
  dtls.flight = 2;
  udp.send(buf);
};
