# Solana-Web3-Introduction

📘 Welcome to the Solana Web3 Introduction repository! This repository contains a custom function designed to interact with the Solana blockchain using its Web3 API. Solana is a high-performance blockchain platform known for its scalability and low transaction costs, making it an ideal choice for decentralized applications (dApps) and financial infrastructure.

## Tech stack used

- uses TypeScript and NodeJS
- yarn (as the package manager)

## Setup locally

1. Clone this repo to your local system
2. Install the packages via `yarn install`
3. Copy rename the `example.env` file to be named `.env`
4. Update the `RPC_URL` variable to be the cluster URL of a supporting RPC provider

If you have the Solana CLI installed locally: update the `LOCAL_PAYER_JSON_ABSPATH` environment
variable to be the **_absolute path_** of your local testing wallet keypair JSON file.

## Recommended flow to explore this repo

After setting up locally, I recommend exploring the code of the following files (in order):

- [`1_simple_transaction.ts`](./scripts/1_simple_transaction.ts)
- [`2_complex_transaction.ts`](./scripts/2_complex_transaction.ts)
- [`3_create_token_with_metadata.ts`](./scripts/3_create_token_with_metadata.ts)
- [`4_mint_tokens.ts`](./scripts/4_mint_tokens.ts)
- [`5_update_metadata.ts`](./scripts/5_update_metadata.ts)
- [`6_create_nfts.ts`](./scripts/6_create_nfts.ts)

After reviewing the code in each of these scripts, try running each in order.

> **Note:** Running each of these scripts may save some various bits of data to a `.local_keys`
> folder within this repo for use by the other scripts later in this ordered list. Therefore,
> running them in a different order may result in them not working as written/desired. You have been
> warned :)

### Running the included Scripts

Once setup locally, you will be able to run the scripts included within this repo:

```
yarn demo ./scripts/<script>
```

#### `1_simple_transaction.ts`

A brief introduction to the Solana web3.js package. Demonstrating how to build and send simple
transactions to the blockchain

#### `2_complex_transaction.ts`

An introduction to more complex transactions using Solana web3.js Demonstrates how to build a more
complex transaction, with multiple instructions.

#### `3_create_token_with_metadata.ts`

Demonstrates how to create a SPL token and store it's metadata on chain (using the Metaplex MetaData
program)

#### `4_mint_tokens.ts`

Demonstrates how to create new SPL tokens (aka "minting tokens") into an existing SPL Token Mint

#### `5_update_metadata.ts`

Demonstrates how to update the metadata for an SPL token, using the Metaplex MetadataProgram

#### `6_create_nfts.ts`

Demonstrates how to mint NFTs and store their metadata on chain using the Metaplex MetadataProgram