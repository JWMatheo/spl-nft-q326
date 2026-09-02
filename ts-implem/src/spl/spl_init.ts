import {
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsTransactionMessageWithBlockhashLifetime,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import {
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";

import wallet from "../../devnet-wallet.json";

import { rpc, rpcSubscriptions } from "../rpc";

(async () => {
  try {
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

    const mint = await generateKeyPairSigner();

    const space = BigInt(getMintSize());

    const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    const message = createTransactionMessage({ version: 0 });

    const messageWithPayer = setTransactionMessageFeePayerSigner(
      signer,
      message,
    );

    const msgWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      messageWithPayer,
    );

    const tx = appendTransactionMessageInstructions(
      [
        getCreateAccountInstruction({
          payer: signer,
          lamports: rent,
          newAccount: mint,
          programAddress: TOKEN_PROGRAM_ADDRESS,
          space,
        }),

        getInitializeMintInstruction({
          mint: mint.address,
          decimals: 6,
          mintAuthority: signer.address,
        }),
      ],
      msgWithLifetime,
    );

    const signedTx = await signTransactionMessageWithSigners(tx);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    const simulation = await rpc
      .simulateTransaction(getBase64EncodedWireTransaction(signedTx), {
        commitment: "confirmed",
        encoding: "base64",
      })
      .send();

    if (simulation.value.err) {
      throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }

    const signature = getSignatureFromTransaction(signedTx);

    await sendAndConfirm(signedTx, {
      commitment: "confirmed",
    });

    console.log(`simulation units: ${simulation.value.unitsConsumed}`);
    console.log(`signature: ${signature}`);
    console.log(`mint: ${mint.address}`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
})();
