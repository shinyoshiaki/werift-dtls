import { KeyExchange } from "./key-exchange";

export default class AbstractCipher {
  id = 0;
  name?: string;
  hash?: string;
  verifyDataLength = 12;

  blockAlgorithm?: string;
  kx?: KeyExchange;

  /**
   * Init cipher.
   * @abstract
   */
  init(...args: any) {
    throw new Error("not implemented");
  }

  /**
   * Encrypts data.
   * @abstract
   */
  encrypt(...args: any): Buffer {
    throw new Error("not implemented");
  }

  /**
   * Decrypts data.
   * @abstract
   */
  decrypt(...args: any): Buffer {
    throw new Error("not implemented");
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.name;
  }
}
