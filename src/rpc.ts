import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { config } from "./config";

export const rpc = createSolanaRpc(config.rpc.https);

export const rpcSubscriptions = createSolanaRpcSubscriptions(
  config.rpc.wss,
);