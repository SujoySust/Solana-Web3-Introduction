import { Connection, Keypair, SystemProgram, clusterApiUrl } from "@solana/web3.js";
import { connection, payer, testWallet } from "../lib/vars";
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMint2Instruction } from "@solana/spl-token";
import { PublicKey } from "@metaplex-foundation/js";

import {
  PROGRAM_ID as METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  buildTransaction,
  explorerURL,
  extractSignatureFromFailedTransaction,
  printConsoleSeparator,
  savePublicKeyToFile,
} from "../lib/helper";

(async () => {
  console.log("Payer address:", payer.publicKey.toBase58());
  console.log("Test wallet address:", testWallet.publicKey.toBase58());

  // generate a new keypair to be used for our mint
  const mintKeyPair = Keypair.generate();

  console.log("Mint address: ", mintKeyPair.publicKey.toBase58());

  //define the assorted token config settings
  const tokenConfig = {
    decimal: 2,
    name: "Seven Seas Gold",
    symbol: "Gold",
    uri: "https://thisisnot.arealurl/info.json",
  };

  /**
   * Build the 2 instructions required to create the token mint:
   * - standard "create account" to allocate space on chain
   * - initialize the token mint
   */

  // Create account to allocate space on chain
  const createMintAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintKeyPair.publicKey,
    lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
    space: MINT_SIZE,
    programId: TOKEN_PROGRAM_ID,
  });

  // Initialize the account as a Mint
  const initMintIx = createInitializeMint2Instruction(
    mintKeyPair.publicKey,
    tokenConfig.decimal,
    payer.publicKey,
    payer.publicKey,
  );

  /**
   * Alternatively, you could also use the helper function from the
   * `@solana/spl-token` sdk to create and initialize the token's mint
   * ---
   * NOTE: this method is normally efficient since the payer would need to
   * sign and pay for multiple transactions to perform all the actions. It
   * would also require more "round trips" to the blockchain as well.
   * But this option is available, should it fit your use case :)
   * */

  /*
  console.log("Creating a token mint...");
  const mint = await createMint(
    connection,
    payer,
    // mint authority
    payer.publicKey,
    // freeze authority
    payer.publicKey,
    // decimals - use any number you desire
    tokenConfig.decimals,
    // manually define our token mint address
    mintKeypair,
  );
  console.log("Token's mint address:", mint.toBase58());
  */

  /**
   * Build the instruction to store the token's metadata on chain
   * - derive the pda for the metadata account
   * - create the instruction with the actual metadata in it
   */

  // derive the pda address for the Metadata account
  const metadataAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mintKeyPair.publicKey.toBuffer()],
    METADATA_PROGRAM_ID,
  )[0];

  console.log("Metadata address:", metadataAccount.toBase58());

  // Create the Metadata account for the Mint
  const createMetadataIx = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataAccount,
      mint: mintKeyPair.publicKey,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: tokenConfig.name,
          symbol: tokenConfig.symbol,
          uri: tokenConfig.uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      },
    },
  );

  /**
   * Build the transaction to send to the blockchain
   */

  const tx = await buildTransaction({
    connection,
    payer: payer.publicKey,
    signers: [payer, mintKeyPair],
    instructions: [createMintAccountIx, initMintIx, createMetadataIx],
  });

  printConsoleSeparator();

  try {
    const sig = await connection.sendTransaction(tx);

    // print the explorer url
    console.log("Transaction completed.");
    console.log(explorerURL({ txSignature: sig }));

    // locally save our addresses for the demo
    savePublicKeyToFile("tokenMint", mintKeyPair.publicKey);
  } catch (err) {
    console.error("Failed to send transaction:");
    console.log(tx);

    // attempt to extract the signature from the failed transaction
    const failedSig = await extractSignatureFromFailedTransaction(connection, err);
    if (failedSig) console.log("Failed signature:", explorerURL({ txSignature: failedSig }));

    throw err;
  }
})();
