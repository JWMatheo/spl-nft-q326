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
    //change the image uri to your image uri obtained from nft_image.ts
    const image =
      "https://gateway.irys.xyz/4TPr5zxzdXcDb85hP23oa1PfTd2XKtpWjiSN9RUNjf9Q";

    //json scheme : https://www.metaplex.com/docs/smart-contracts/core/json-schema
    //change the metadata
    const metadata = {
      name: "myNftItem",
      description: "I'm inspired!",
      image,
      category: "image",
      attributes: [
        {
          trait_type: "Mindset",
          value: "Personal growth",
        },
      ],
    };

    const myUri = await umi.uploader.uploadJson(metadata);
    console.log(`metadata uri: ${myUri}`);
  } catch (error) {
    console.log("error", error);
  }
})();
