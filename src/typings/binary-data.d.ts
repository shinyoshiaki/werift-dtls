declare module "binary-data" {
  type Types = {
    uint16be: any;
    buffer: any;
    uint8: any;
    uint24be: any;
    array: any;
    uint32be: any;
  };
  declare const types: Types;
  type Encode = (o: object, spec: object) => { slice: () => number[] };
  declare const encode: Encode;

  type Decode = <T extends any>(buf: Buffer, spec: object) => T;
  declare const decode: Decode;

  export { types, encode, decode };
}
