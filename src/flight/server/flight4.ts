import { createFragments, createPlaintext } from "../../record/builder";
import { UdpContext } from "../../context/udp";
import { DtlsContext } from "../../context/client";
import { RecordContext } from "../../context/record";
import { CipherContext } from "../../context/cipher";
import { ServerHello } from "../../handshake/message/server/hello";
import { Certificate } from "../../handshake/message/certificate";
import { generateKeySignature, parseX509 } from "../../cipher/x509";
import { ServerKeyExchange } from "../../handshake/message/server/keyExchange";
import { ServerHelloDone } from "../../handshake/message/server/helloDone";

export class Flight4 {
  constructor(
    private udp: UdpContext,
    private dtls: DtlsContext,
    private record: RecordContext,
    private cipher: CipherContext
  ) {}

  exec() {
    this.dtls.flight = 4;
    this.dtls.sequenceNumber = 1;

    const messages = [
      this.sendServerHello(),
      this.sendCertificate(),
      this.sendServerKeyExchange(),
      this.sendServerHelloDone(),
    ];
    messages.forEach((buf) => this.udp.send(buf));
  }

  sendServerHello() {
    if (!this.cipher.localRandom || !this.cipher.cipherSuite)
      throw new Error("");

    const serverHello = new ServerHello(
      this.dtls.version,
      this.cipher.localRandom,
      Buffer.from([0x00]),
      this.cipher.cipherSuite,
      0, // compression
      [] // extensions
    );
    const fragments = createFragments(this.dtls)([serverHello]);
    const packets = createPlaintext(this.dtls)(
      fragments,
      ++this.record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    return buf;
  }

  sendCertificate() {
    const sign = parseX509();
    this.cipher.localPrivateKey = sign.key;
    const certificate = new Certificate([Buffer.from(sign.cert)]);
    const fragments = createFragments(this.dtls)([certificate]);
    const packets = createPlaintext(this.dtls)(
      fragments,
      ++this.record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    return buf;
  }

  sendServerKeyExchange() {
    if (
      !this.cipher.localRandom ||
      !this.cipher.remoteRandom ||
      !this.cipher.localKeyPair ||
      !this.cipher.namedCurve ||
      !this.cipher.localPrivateKey
    )
      throw new Error("");

    const serverRandom = this.cipher.localRandom.serialize();
    const clientRandom = this.cipher.remoteRandom.serialize();
    const signature = generateKeySignature(
      clientRandom,
      serverRandom,
      this.cipher.localKeyPair.publicKey,
      this.cipher.namedCurve,
      this.cipher.localPrivateKey,
      "sha256"
    );
    const keyExchange = new ServerKeyExchange(
      Buffer.from([3, 0]),
      this.cipher.namedCurve,
      this.cipher.localKeyPair.publicKey.length,
      this.cipher.localKeyPair.publicKey,
      4,
      Buffer.from([3, 0]),
      signature.length,
      signature
    );
    const fragments = createFragments(this.dtls)([keyExchange]);
    const packets = createPlaintext(this.dtls)(
      fragments,
      ++this.record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    return buf;
  }

  sendServerHelloDone() {
    const handshake = new ServerHelloDone();
    const fragments = createFragments(this.dtls)([handshake]);
    const packets = createPlaintext(this.dtls)(
      fragments,
      ++this.record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    return buf;
  }
}
