import { prfPreMasterSecret, prfMasterSecret } from "../../src/cipher/prf";
import { NamedCurveAlgorithm } from "../../src/cipher/namedCurve";
describe("cipher/prf", () => {
  test("prfPreMasterSecret", () => {
    const priv = Buffer.from([
      0x20,
      0x21,
      0x22,
      0x23,
      0x24,
      0x25,
      0x26,
      0x27,
      0x28,
      0x29,
      0x2a,
      0x2b,
      0x2c,
      0x2d,
      0x2e,
      0x2f,
      0x30,
      0x31,
      0x32,
      0x33,
      0x34,
      0x35,
      0x36,
      0x37,
      0x38,
      0x39,
      0x3a,
      0x3b,
      0x3c,
      0x3d,
      0x3e,
      0x3f,
    ]);
    const pub = Buffer.from([
      0x9f,
      0xd7,
      0xad,
      0x6d,
      0xcf,
      0xf4,
      0x29,
      0x8d,
      0xd3,
      0xf9,
      0x6d,
      0x5b,
      0x1b,
      0x2a,
      0xf9,
      0x10,
      0xa0,
      0x53,
      0x5b,
      0x14,
      0x88,
      0xd7,
      0xf8,
      0xfa,
      0xbb,
      0x34,
      0x9a,
      0x98,
      0x28,
      0x80,
      0xb6,
      0x15,
    ]);
    const sec = Buffer.from([
      0xdf,
      0x4a,
      0x29,
      0x1b,
      0xaa,
      0x1e,
      0xb7,
      0xcf,
      0xa6,
      0x93,
      0x4b,
      0x29,
      0xb4,
      0x74,
      0xba,
      0xad,
      0x26,
      0x97,
      0xe2,
      0x9f,
      0x1f,
      0x92,
      0x0d,
      0xcc,
      0x77,
      0xc8,
      0xa0,
      0xa0,
      0x88,
      0x44,
      0x76,
      0x24,
    ]);

    const expected = prfPreMasterSecret(
      pub,
      priv,
      NamedCurveAlgorithm.namedCurveX25519
    );
    expect(expected).toEqual(sec);
  });

  test("prfMasterSecret", () => {
    const preMasterSecret = Buffer.from([
      0xdf,
      0x4a,
      0x29,
      0x1b,
      0xaa,
      0x1e,
      0xb7,
      0xcf,
      0xa6,
      0x93,
      0x4b,
      0x29,
      0xb4,
      0x74,
      0xba,
      0xad,
      0x26,
      0x97,
      0xe2,
      0x9f,
      0x1f,
      0x92,
      0x0d,
      0xcc,
      0x77,
      0xc8,
      0xa0,
      0xa0,
      0x88,
      0x44,
      0x76,
      0x24,
    ]);
    const clientRandom = Buffer.from([
      0x00,
      0x01,
      0x02,
      0x03,
      0x04,
      0x05,
      0x06,
      0x07,
      0x08,
      0x09,
      0x0a,
      0x0b,
      0x0c,
      0x0d,
      0x0e,
      0x0f,
      0x10,
      0x11,
      0x12,
      0x13,
      0x14,
      0x15,
      0x16,
      0x17,
      0x18,
      0x19,
      0x1a,
      0x1b,
      0x1c,
      0x1d,
      0x1e,
      0x1f,
    ]);
    const serverRandom = Buffer.from([
      0x70,
      0x71,
      0x72,
      0x73,
      0x74,
      0x75,
      0x76,
      0x77,
      0x78,
      0x79,
      0x7a,
      0x7b,
      0x7c,
      0x7d,
      0x7e,
      0x7f,
      0x80,
      0x81,
      0x82,
      0x83,
      0x84,
      0x85,
      0x86,
      0x87,
      0x88,
      0x89,
      0x8a,
      0x8b,
      0x8c,
      0x8d,
      0x8e,
      0x8f,
    ]);
    const expected = Buffer.from([
      0x91,
      0x6a,
      0xbf,
      0x9d,
      0xa5,
      0x59,
      0x73,
      0xe1,
      0x36,
      0x14,
      0xae,
      0x0a,
      0x3f,
      0x5d,
      0x3f,
      0x37,
      0xb0,
      0x23,
      0xba,
      0x12,
      0x9a,
      0xee,
      0x02,
      0xcc,
      0x91,
      0x34,
      0x33,
      0x81,
      0x27,
      0xcd,
      0x70,
      0x49,
      0x78,
      0x1c,
      0x8e,
      0x19,
      0xfc,
      0x1e,
      0xb2,
      0xa7,
      0x38,
      0x7a,
      0xc0,
      0x6a,
      0xe2,
      0x37,
      0x34,
      0x4c,
    ]);

    const master = prfMasterSecret(preMasterSecret, clientRandom, serverRandom);
    expect(expected).toEqual(master);
  });
});
