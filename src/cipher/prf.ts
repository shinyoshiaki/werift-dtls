import { NamedCurveAlgorithm } from "./namedCurve";
import { ec } from "elliptic";
import * as nacl from "tweetnacl";
import { createHmac, createHash } from "crypto";
const elliptic = new ec("secp256k1");

export function prfPreMasterSecret(
  publicKey: Buffer,
  privateKey: Buffer,
  curve: number
) {
  switch (curve) {
    case NamedCurveAlgorithm.namedCurveP256:
      const pub = elliptic.keyFromPublic(publicKey).getPublic();
      const x = pub.getX();
      const y = pub.getY();

      return;

    case NamedCurveAlgorithm.namedCurveX25519:
      return Buffer.from(nacl.scalarMult(privateKey, publicKey));
  }
}

function hmac(algorithm: string, secret: Buffer, data: Buffer) {
  const hash = createHmac(algorithm, secret);
  hash.update(data);
  return hash.digest();
}

function prfPHash(secret: Buffer, seed: Buffer, requestedLegth: number) {
  const totalLength = requestedLegth;
  const bufs = [];
  let Ai = seed; // A0

  do {
    Ai = hmac("sha256", secret, Ai); // A(i) = HMAC(secret, A(i-1))
    const output = hmac("sha256", secret, Buffer.concat([Ai, seed]));

    bufs.push(output);
    requestedLegth -= output.length; // eslint-disable-line no-param-reassign
  } while (requestedLegth > 0);

  return Buffer.concat(bufs, totalLength);
}

export function prfMasterSecret(
  preMasterSecret: Buffer,
  clientRandom: Buffer,
  serverRandom: Buffer
) {
  const seed = Buffer.concat([
    Buffer.from("master secret"),
    clientRandom,
    serverRandom,
  ]);
  return prfPHash(preMasterSecret, seed, 48);
}

function hash(algorithm: string, data: Buffer) {
  return createHash(algorithm).update(data).digest();
}

function prfVerifyData(
  masterSecret: Buffer,
  handshakes: Buffer,
  label: string
) {
  const bytes = hash("sha256", handshakes);
  return prfPHash(masterSecret, Buffer.concat([Buffer.from(label), bytes]), 12);
}

export function prfVerifyDataClient(masterSecret: Buffer, handshakes: Buffer) {
  return prfVerifyData(masterSecret, handshakes, "client finished");
}

export function prfVerifyDataServer(masterSecret: Buffer, handshakes: Buffer) {
  return prfVerifyData(masterSecret, handshakes, "server finished");
}
