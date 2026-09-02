import assert from "node:assert/strict";
import test from "node:test";
import {
  MPL_CORE_PROGRAM_ID,
  mplCore,
} from "@metaplex-foundation/mpl-core";
import {
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  buildNftBurn,
  buildNftTransfer,
  buildNftUpdate,
} from "../src/nft/nft_operations";

const createTestContext = () => {
  const umi = createUmi("http://127.0.0.1:8899");
  const owner = generateSigner(umi);
  const asset = {
    publicKey: generateSigner(umi).publicKey,
    owner: owner.publicKey,
  };

  umi.use(signerIdentity(owner));
  umi.use(mplCore());

  return { umi, owner, asset };
};

test("builds an NFT update instruction", () => {
  const { umi, asset } = createTestContext();
  const name = "Updated NFT";
  const uri = "https://example.com/updated.json";
  const instruction = buildNftUpdate(umi, asset, name, uri).getInstructions()[0];
  const data = Buffer.from(instruction.data);

  assert.equal(instruction.programId, MPL_CORE_PROGRAM_ID);
  assert.equal(instruction.keys[0].pubkey, asset.publicKey);
  assert.equal(instruction.data[0], 30);
  assert.equal(data.includes(Buffer.from(name)), true);
  assert.equal(data.includes(Buffer.from(uri)), true);
});

test("builds an NFT transfer instruction", () => {
  const { umi, asset } = createTestContext();
  const recipient = generateSigner(umi);
  const instruction = buildNftTransfer(
    umi,
    asset,
    recipient.publicKey,
  ).getInstructions()[0];

  assert.equal(instruction.programId, MPL_CORE_PROGRAM_ID);
  assert.equal(instruction.keys[0].pubkey, asset.publicKey);
  assert.equal(instruction.keys[4].pubkey, recipient.publicKey);
  assert.equal(instruction.data[0], 14);
});

test("builds an NFT burn instruction", () => {
  const { umi, owner, asset } = createTestContext();
  const instruction = buildNftBurn(umi, asset).getInstructions()[0];

  assert.equal(instruction.programId, MPL_CORE_PROGRAM_ID);
  assert.equal(instruction.keys[0].pubkey, asset.publicKey);
  assert.equal(instruction.keys[0].isWritable, true);
  assert.equal(instruction.keys[2].pubkey, owner.publicKey);
  assert.equal(instruction.keys[2].isSigner, true);
  assert.equal(instruction.data[0], 12);
});
