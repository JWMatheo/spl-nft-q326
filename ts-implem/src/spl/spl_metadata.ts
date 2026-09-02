import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { config } from "../config";

const mint = publicKey("4y2UoGff2mM3N3RNosKbasM6JSKUkPBoBSqeocvNnyWY");

const umi = createUmi(config.rpc.https);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };

    const data: DataV2Args ={
      name: "Q326 Devnet Token",
      symbol: "Q326",
      uri: "https://gateway.irys.xyz/DW5gkatWP6Dbs4JWPNsQycYYgstPrLnLJYy2w2kJhkfJ",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    }

    const args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails : null
    }

    const tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });

    const signedTx = await tx.buildAndSign(umi);
    const simulation = await umi.rpc.simulateTransaction(signedTx, {
      commitment: "confirmed",
    });

    if (simulation.err) {
      throw new Error(`Simulation failed: ${JSON.stringify(simulation.err)}`);
    }

    const result = await tx.sendAndConfirm(umi);
    console.log(`simulation units: ${simulation.unitsConsumed}`);
    console.log("signature: ", bs58.encode(Buffer.from(result.signature)));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
})();
