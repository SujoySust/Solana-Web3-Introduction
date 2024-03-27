import { SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { STATIC_PUBLICKEY, connection, payer, testWallet } from "../lib/vars";
import { explorerURL, printConsoleSeparator } from "../lib/helper";

(async () => {
  console.log("Payer address:", payer.publicKey.toBase58());
  console.log("Test wallet address:", testWallet.publicKey.toBase58());

  /**
   * create a simple instruction (using web3.js) to create an account
   */

  const space = 0;

  // request the cost (in lamports) to allocate `space` number of bytes on chain
  const balanceForRentExemption = await connection.getMinimumBalanceForRentExemption(space);

   // create test account
  const createTestAccountIx = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: testWallet.publicKey,
      lamports: balanceForRentExemption + 2_000_000,
      space: space,
      programId: SystemProgram.programId
  });

  // create an instruction to transfer lamports
  const transferToTestWalletIx = SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: testWallet.publicKey,
      lamports: balanceForRentExemption + 100_000,
      programId: SystemProgram.programId,
  });

  // create an other instruction to transfer lamports
  const transferToStacticWalletIx = SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: STATIC_PUBLICKEY,
      lamports: 100_000,
      programId: SystemProgram.programId,
  });

  /**
   * build the transaction to send to the blockchain
   */
  
  let recentBlockhash = await connection.getLatestBlockhash().then(res => res.blockhash);
  // create a transaction message

  const message = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash,
    instructions: [
        createTestAccountIx,
        transferToStacticWalletIx,
        transferToTestWalletIx,
        transferToStacticWalletIx,
    ]
  }).compileToV0Message();

  // create a versioned transaction using the message
  const tx = new VersionedTransaction(message);
  console.log("tx before signing:", tx);

  tx.sign([payer, testWallet]);
  const sig = await connection.sendTransaction(tx);

  /**
   * display some helper text
   */
  printConsoleSeparator();

  console.log("Transaction completed.");
  console.log(explorerURL({ txSignature: sig }));

})();
