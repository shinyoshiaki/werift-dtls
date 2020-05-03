import { HandshakeType } from "../handshake/const";

type Version = { major: number; minor: number };
type Random = { gmt_unix_time: number; random_bytes: Buffer };

type Handshake = { msgType: HandshakeType; serialize: () => Buffer };
