export enum SignatureAlgorithm {
  rsa = 1,
  ecdsa = 3,
}

export enum CipherSuite {
  EcdheEcdsaWithAes128GcmSha256 = 0xc02b, //49195
  EcdheRsaWithAes128GcmSha256 = 0xc02f,
}

export enum HashAlgorithm {
  sha256 = 4,
}
