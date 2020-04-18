import { ClientKeyExchange } from "../../../../src/handshake/message/client/keyExchange";
test("handshake_message_client_keyExchange", () => {
  const raw = Buffer.from([
    0x20,
    0x26,
    0x78,
    0x4a,
    0x78,
    0x70,
    0xc1,
    0xf9,
    0x71,
    0xea,
    0x50,
    0x4a,
    0xb5,
    0xbb,
    0x00,
    0x76,
    0x02,
    0x05,
    0xda,
    0xf7,
    0xd0,
    0x3f,
    0xe3,
    0xf7,
    0x4e,
    0x8a,
    0x14,
    0x6f,
    0xb7,
    0xe0,
    0xc0,
    0xff,
    0x54,
  ]);
  const c = ClientKeyExchange.deSerialize(raw);
  expect(raw).toEqual(c.serialize());
});
