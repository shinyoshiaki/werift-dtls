import { encode, types, decode } from "binary-data";
const { uint16be, uint8, buffer, array, uint32be } = types;

export const Random = {
  gmt_unix_time: uint32be,
  random_bytes: buffer(28),
};

const ExtensionType = uint16be;

const Extension = {
  type: ExtensionType,
  data: buffer(uint16be),
};

export const ExtensionList = array(Extension, uint16be, "bytes");
