import { fetchAsset, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import { config } from "../config";
import { buildNftBurn } from "./nft_operations";

const assetAddress = process.env.NFT_ASSET_ADDRESS;

if (!assetAddress) {
  throw new Error("Missing NFT_ASSET_ADDRESS env");
}

const umi = createUmi(config.rpc.https);
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    const asset = await fetchAsset(umi, publicKey(assetAddress));
    const tx = buildNftBurn(umi, asset);
    const signedTx = await tx.buildAndSign(umi);
    const simulation = await umi.rpc.simulateTransaction(signedTx, {
      commitment: "confirmed",
    });

    if (simulation.err) {
      throw new Error(`Simulation failed: ${JSON.stringify(simulation.err)}`);
    }

    const result = await tx.sendAndConfirm(umi);
    const [signature] = base58.deserialize(result.signature);

    console.log(`simulation units: ${simulation.unitsConsumed}`);
    console.log(`signature ${signature}`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
})();
