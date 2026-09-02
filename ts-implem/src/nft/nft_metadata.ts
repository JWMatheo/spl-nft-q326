import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { config } from "../config";

const umi = createUmi(config.rpc.https);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const image =
      "https://gateway.irys.xyz/2ZGWuupLwnTbzqiZwKL2VQuuPWYTSKW3P4DSRPADaRho";

    const metadata = {
      name: "Q326 Core NFT Updated",
      description: "Updated Turbin3 Week 1 MPL Core NFT on Solana devnet.",
      image,
      category: "image",
      attributes: [
        {
          trait_type: "Status",
          value: "Updated",
        },
      ],
    };

    const myUri = await umi.uploader.uploadJson(metadata);
    console.log(`metadata uri: ${myUri}`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
})();
