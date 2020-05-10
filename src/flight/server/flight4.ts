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
import { ServerHello } from "../../handshake/message/server/hello";
import { Certificate } from "../../handshake/message/certificate";
import { createX509 } from "../../cipher/x509";

export class Flight4 {
  constructor(
    private udp: UdpContext,
    private dtls: DtlsContext,
    private record: RecordContext,
    private cipher: CipherContext
  ) {}

  exec(clientHello: ClientHello) {
    this.dtls.flight = 4;
    this.dtls.sequenceNumber = 1;

    this.sendServerHello();
    this.sendCertificate();
  }

  sendServerHello() {
    const serverHello = new ServerHello(
      this.dtls.version,
      this.cipher.localRandom!,
      Buffer.from([0x00]),
      this.cipher.cipherSuite!,
      0,
      []
    );
    const fragments = createFragments(this.dtls)([serverHello]);
    const packets = createPlaintext(this.dtls)(
      fragments,
      ++this.record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    this.udp.send(buf);
  }

  sendCertificate() {
    const cert = createX509();
    const certificate = new Certificate([cert]);
    const fragments = createFragments(this.dtls)([certificate]);
    const packets = createPlaintext(this.dtls)(
      fragments,
      ++this.record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    this.udp.send(buf);
  }

  sendKeyExchange() {
    const serverRandom = this.cipher.localRandom?.serialize()!;
    const clientRandom = this.cipher.remoteRandom?.serialize()!;
  }
}
