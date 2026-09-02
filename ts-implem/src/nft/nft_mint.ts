import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { config } from "../config";

const umi = createUmi(config.rpc.https);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

umi.use(mplCore());

(async () => {
  try {
    const metadataUri =
      "https://gateway.irys.xyz/Hd5Ch7J5aHP7Yv24X6xesiSAoF8YbhmacPkZHdAstD1n";
    const asset = generateSigner(umi);

    //add you nft name and metadata uri
    const tx = create(umi, { asset, uri: metadataUri, name: "myNftItem" });

    const signature = base58.deserialize(await tx.send(umi));

    console.log(`signature ${signature} , asset : ${asset.publicKey}`);
  } catch (e) {
    console.log(`errior ${e}`);
  }
})();
