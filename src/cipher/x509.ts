import { KJUR } from "jsrsasign";
import { encode, types } from "binary-data";

export function generateKeySignature(
  clientRandom: Buffer,
  serverRandom: Buffer,
  publicKey: Buffer,
  namedCurve: number,
  privateKey: string,
  hashAlgorithm: string
) {
  const sig = valueKeySignature(
    clientRandom,
    serverRandom,
    publicKey,
    namedCurve
  );
  const signer = new KJUR.crypto.Signature({ alg: "SHA256withECDSA" });
  signer.init({ d: privateKey, curve: "secp256r1" });
  signer.updateHex(sig.toString("hex"));
  const enc = signer.sign();
  return enc;
}

function valueKeySignature(
  clientRandom: Buffer,
  serverRandom: Buffer,
  publicKey: Buffer,
  namedCurve: number
) {
  const serverParams = Buffer.from(
    encode(
      { type: 3, curve: namedCurve, len: publicKey.length },
      { type: types.uint8, curve: types.uint16be, len: types.uint8 }
    ).slice()
  );
  return Buffer.concat([clientRandom, serverRandom, serverParams, publicKey]);
}
