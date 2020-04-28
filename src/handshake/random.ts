import { randomBytes } from "crypto";

export const dtlsRandom = () => ({
  gmt_unix_time: Math.floor(Date.now() / 1000),
  random_bytes: randomBytes(28),
});
