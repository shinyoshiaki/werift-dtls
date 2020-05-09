import { ServerHello } from "../handshake/message/server/hello";
import { Certificate } from "../handshake/message/certificate";
import { ServerHelloDone } from "../handshake/message/server/helloDone";
import { HandshakeType } from "../handshake/const";
import { ClientContext } from "../context/client";
import { ServerKeyExchange } from "../handshake/message/server/keyExchange";
import { generateKeyPair } from "../cipher/namedCurve";
import { prfPreMasterSecret, prfMasterSecret } from "../cipher/prf";
import { ClientKeyExchange } from "../handshake/message/client/keyExchange";
import { ChangeCipherSpec } from "../handshake/message/changeCipherSpec";
import { Finished } from "../handshake/message/finished";
import { createFragments, createPlaintext } from "../record/builder";
import { RecordContext } from "../context/record";
import { UdpContext } from "../context/udp";
import { DtlsRandom } from "../handshake/random";
import { ContentType } from "../record/const";
import { createCipher } from "../cipher/cipher/create";
import { ProtocolVersion } from "../handshake/binary";
import { encode, decode, types } from "binary-data";
import { createHash } from "crypto";
import { CipherSuite } from "../cipher/const";
import { CipherContext } from "../context/cipher";

export const flight5 = (
  udp: UdpContext,
  client: ClientContext,
  record: RecordContext,
  cipher: CipherContext
) => (
  messages: (ServerHello | Certificate | ServerKeyExchange | ServerHelloDone)[]
) => {
  if (client.flight === 5) return;

  messages.forEach((message) => {
    handlers[message.msgType]({ client, cipher })(message);
  });

  const clientKeyExchange = new ClientKeyExchange(
    cipher.localKeyPair?.publicKey!
  );
  {
    const fragments = createFragments(client)([clientKeyExchange]);
    const packets = createPlaintext(client)(
      fragments,
      ++record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    client.bufferHandshake(
      Buffer.concat(fragments.map((v) => v.fragment)),
      true,
      5
    );
    udp.send(buf);
  }

  const changeCipherSpec = ChangeCipherSpec.createEmpty().serialize();
  {
    const packets = createPlaintext(client)(
      [{ type: ContentType.changeCipherSpec, fragment: changeCipherSpec }],
      ++record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    udp.send(buf);
  }

  const cache = Buffer.concat(client.handshakeCache.map((v) => v.data));

  const localVerifyData = cipher.cipher?.prf(
    cipher.cipher.verifyDataLength,
    cipher.masterSecret!,
    "client finished",
    createHash(cipher.cipher.hash!).update(cache).digest()
  )!;
  // const localVerifyData = prfVerifyDataClient(client.masterSecret!, cache);

  const finish = new Finished(localVerifyData);
  const fragments = createFragments(client)([finish]);
  client.epoch = 1;
  const pkt = createPlaintext(client)(
    fragments,
    ++record.recordSequenceNumber
  )[0];
  record.recordSequenceNumber = 0;
  let raw = pkt.serialize();

  const header = pkt.recordLayerHeader;
  raw = cipher.cipher?.encrypt({ type: 1 }, pkt.fragment, {
    type: header.contentType,
    version: decode(
      Buffer.from(encode(header.protocolVersion, ProtocolVersion).slice()),
      { version: types.uint16be }
    ).version,
    epoch: header.epoch,
    sequenceNumber: header.sequenceNumber,
  })!;
  pkt.fragment = raw;
  pkt.recordLayerHeader.contentLen = raw.length;
  const buf = pkt.serialize();
  udp.send(buf);

  client.flight = 5;
};

const handlers: {
  [key: number]: (contexts: {
    client: ClientContext;
    cipher: CipherContext;
  }) => (message: any) => void;
} = {};

handlers[HandshakeType.server_hello] = ({ cipher }) => (
  message: ServerHello
) => {
  cipher.remoteRandom = DtlsRandom.from(message.random);
  cipher.cipherSuite = message.cipherSuite;
};

handlers[HandshakeType.certificate] = ({ cipher }) => (
  message: Certificate
) => {
  cipher.remoteCertificate = message.certificateList[0];
};

handlers[HandshakeType.server_key_exchange] = ({ cipher }) => (
  message: ServerKeyExchange
) => {
  cipher.remoteKeyPair = {
    curve: message.namedCurve,
    publicKey: message.publicKey,
  };
  cipher.localKeyPair = generateKeyPair(message.namedCurve);
  const preMasterSecret = prfPreMasterSecret(
    cipher.remoteKeyPair.publicKey!,
    cipher.localKeyPair?.privateKey!,
    cipher.localKeyPair?.curve!
  )!;
  cipher.masterSecret = prfMasterSecret(
    preMasterSecret,
    cipher.localRandom?.serialize()!,
    cipher.remoteRandom?.serialize()!
  );

  cipher.cipher = createCipher(CipherSuite.EcdheEcdsaWithAes128GcmSha256)!;
  cipher.cipher.init({
    masterSecret: cipher.masterSecret!,
    serverRandom: cipher.remoteRandom!.serialize(),
    clientRandom: cipher.localRandom!.serialize(),
  });
};

handlers[HandshakeType.server_hello_done] = () => (
  message: ServerHelloDone
) => {};
