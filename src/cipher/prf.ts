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

export function hmac(algorithm: string, secret: Buffer, data: Buffer) {
  const hash = createHmac(algorithm, secret);
  hash.update(data);
  return hash.digest();
}

export function prfPHash(
  secret: Buffer,
  seed: Buffer,
  requestedLegth: number,
  algorithm = "sha256"
) {
  const totalLength = requestedLegth;
  const bufs = [];
  let Ai = seed; // A0

  do {
    Ai = hmac(algorithm, secret, Ai); // A(i) = HMAC(secret, A(i-1))
    const output = hmac(algorithm, secret, Buffer.concat([Ai, seed]));

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

export function prfVerifyData(
  masterSecret: Buffer,
  data: Buffer,
  label: string,
  size = 12
) {
  const bytes = hash("sha256", data);
  return prfPHash(
    masterSecret,
    Buffer.concat([Buffer.from(label), bytes]),
    size
  );
}

export function prfVerifyDataClient(masterSecret: Buffer, handshakes: Buffer) {
  return prfVerifyData(masterSecret, handshakes, "client finished");
}

export function prfVerifyDataServer(masterSecret: Buffer, handshakes: Buffer) {
  return prfVerifyData(masterSecret, handshakes, "server finished");
}

export function prfEncryptionKeys(
  masterSecret: Buffer,
  clientRandom: Buffer,
  serverRandom: Buffer,
  prfMacLen: number,
  prfKeyLen: number,
  prfIvLen: number
) {
  const seed = Buffer.concat([
    Buffer.from("key expansion"),
    serverRandom,
    clientRandom,
  ]);
  let keyMaterial = prfPHash(
    masterSecret,
    seed,
    2 * prfMacLen + 2 * prfKeyLen + 2 * prfIvLen
  );

  const clientMACKey = keyMaterial.slice(0, prfMacLen);
  keyMaterial = keyMaterial.slice(prfMacLen);

  const serverMACKey = keyMaterial.slice(0, prfMacLen);
  keyMaterial = keyMaterial.slice(prfMacLen);

  const clientWriteKey = keyMaterial.slice(0, prfKeyLen);
  keyMaterial = keyMaterial.slice(prfKeyLen);

  const serverWriteKey = keyMaterial.slice(0, prfKeyLen);
  keyMaterial = keyMaterial.slice(prfKeyLen);

  const clientWriteIV = keyMaterial.slice(0, prfIvLen);
  keyMaterial = keyMaterial.slice(prfIvLen);

  const serverWriteIV = keyMaterial.slice(0, prfIvLen);

  return {
    masterSecret,
    clientMACKey,
    serverMACKey,
    clientWriteKey,
    serverWriteKey,
    clientWriteIV,
    serverWriteIV,
  };
}
