import * as forge from "node-forge";
import { encode, types } from "binary-data";
import { hash } from "./prf";
import { privateEncrypt, constants, createSign } from "crypto";

const pki = forge.pki;

export function createX509() {
  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  const attrs = [
    {
      name: "commonName",
      value: "example.org",
    },
    {
      name: "countryName",
      value: "US",
    },
    {
      shortName: "ST",
      value: "Virginia",
    },
    {
      name: "localityName",
      value: "Blacksburg",
    },
    {
      name: "organizationName",
      value: "Test",
    },
    {
      shortName: "OU",
      value: "Test",
    },
  ];
  cert.setSubject(attrs);
  // alternatively set subject from a csr
  //cert.setSubject(csr.subject.attributes);
  cert.setIssuer(attrs);
  cert.setExtensions([
    {
      name: "basicConstraints",
      cA: true,
    },
    {
      name: "keyUsage",
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: "extKeyUsage",
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true,
    },
    {
      name: "nsCertType",
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true,
    },
    {
      name: "subjectAltName",
      altNames: [
        {
          type: 6, // URI
          value: "http://example.org/webid#me",
        },
        {
          type: 7, // IP
          ip: "127.0.0.1",
        },
      ],
    },
    {
      name: "subjectKeyIdentifier",
    },
  ]);

  cert.sign(keys.privateKey);

  const pem = pki.certificateToPem(cert);
  return Buffer.from(pem);
}

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
  const signer = createSign(hashAlgorithm);
  signer.update(sig);
  const enc = signer.sign(privateKey);
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
