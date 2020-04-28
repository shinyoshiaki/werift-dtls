import { ClientHello } from "../handshake/message/client/hello";
import { contentType } from "./const";

export const createFragments = (handshakes: ClientHello[]) => {
  return handshakes
    .map((handshake) => {
      handshake.messageSeq = 0;
      const fragment = handshake.toFragment();
      const fragments = fragment.chunk().map((f) => ({
        type: contentType.handshake,
        fragmentData: f.serialize(),
        fragment: f,
      }));
      return fragments;
    })
    .flatMap((v) => v);
};
