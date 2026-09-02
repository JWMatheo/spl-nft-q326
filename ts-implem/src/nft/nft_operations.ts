import {
  AssetV1,
  burn,
  transfer,
  update,
} from "@metaplex-foundation/mpl-core";
import { PublicKey, Umi } from "@metaplex-foundation/umi";

type NftAsset = Pick<
  AssetV1,
  "publicKey" | "owner" | "oracles" | "lifecycleHooks"
>;

export const buildNftUpdate = (
  umi: Umi,
  asset: NftAsset,
  name: string,
  uri: string,
) => update(umi, { asset, name, uri });

export const buildNftTransfer = (
  umi: Umi,
  asset: NftAsset,
  newOwner: PublicKey,
) => transfer(umi, { asset, newOwner });

export const buildNftBurn = (umi: Umi, asset: NftAsset) =>
  burn(umi, { asset });
