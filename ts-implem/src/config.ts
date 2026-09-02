const rpc = process.env.DEVNET_RPC_URL

const rpcWss = process.env.DEVNET_WSS_RPC_URL

if (!rpc) {
    throw new Error("Missing rpc env")
}

if (!rpcWss) {
    throw new Error("Missing rpcWss env")
}

export const config = {
    rpc: {
        https: rpc,
        wss: rpcWss
    }
}