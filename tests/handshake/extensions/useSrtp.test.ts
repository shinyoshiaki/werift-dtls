import { UseSRTP } from "../../../src/handshake/extensions/useSrtp";

test("handshake_extensions_useSrtp", () => {
  const raw = Buffer.from([
    0x00,
    0x0e,
    0x00,
    0x05,
    0x00,
    0x02,
    0x00,
    0x01,
    0x00,
  ]);
  const c = UseSRTP.deSerialize(raw);
  expect(c.type).toBe(14);
  // expect(c.data).toEqual([0x0001]);
  expect(raw).toEqual(c.serialize());
});
