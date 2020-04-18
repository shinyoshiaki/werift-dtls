import { encode, types, decode } from "binary-data";
const { uint16be, uint24be, buffer, array, uint32be, uint8, string } = types;

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

export const ASN11Cert = buffer(uint24be);

export const ClientCertificateType = uint8;
export const DistinguishedName = string(uint16be);

export const SignatureAlgorithm = uint16be;
