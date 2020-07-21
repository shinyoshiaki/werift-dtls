import { TransportContext } from "./context/transport";
import { DtlsContext } from "./context/dtls";
import { CipherContext } from "./context/cipher";
import { createPlaintext } from "./record/builder";
import { ContentType } from "./record/const";
import { Transport } from "./transport";
import { UseSRTP } from "./handshake/extensions/useSrtp";
import { EllipticCurves } from "./handshake/extensions/ellipticCurves";
import {
  NamedCurveAlgorithm,
  HashAlgorithm,
  SignatureAlgorithm,
} from "./cipher/const";
import { Signature } from "./handshake/extensions/signature";
import { Extension } from "./typings/domain";

export type Options = {
  transport: Transport;
  srtpProfiles?: number[];
  cert?: string;
  key?: string;
  certificateRequest?: boolean;
};

export abstract class DtlsSocket {
  onConnect: () => void = () => {};
  onData: (buf: Buffer) => void = () => {};
  onClose: () => void = () => {};
  udp: TransportContext;
  dtls = new DtlsContext();
  cipher = new CipherContext();

  extensions: Extension[] = [];

  constructor(public options: Options) {
    this.udp = new TransportContext(options.transport);
    this.setupExtensions();
  }

  private setupExtensions() {
    if (this.options.srtpProfiles && this.options.srtpProfiles.length > 0) {
      const useSrtp = UseSRTP.create(
        this.options.srtpProfiles,
        Buffer.from([0x00])
      );
      this.extensions.push(useSrtp.extension);
    }
    const curve = EllipticCurves.createEmpty();
    curve.data = [
      NamedCurveAlgorithm.namedCurveX25519,
      NamedCurveAlgorithm.namedCurveP256,
    ];
    this.extensions.push(curve.extension);
    const signature = Signature.createEmpty();
    signature.data = [
      { hash: HashAlgorithm.sha256, signature: SignatureAlgorithm.rsa },
      { hash: HashAlgorithm.sha256, signature: SignatureAlgorithm.ecdsa },
    ];
    this.extensions.push(signature.extension);
  }

  send(buf: Buffer) {
    const pkt = createPlaintext(this.dtls)(
      [{ type: ContentType.applicationData, fragment: buf }],
      ++this.dtls.recordSequenceNumber
    )[0];
    this.udp.send(this.cipher.encryptPacket(pkt).serialize());
  }

  close() {
    this.udp.socket.close();
  }
}
