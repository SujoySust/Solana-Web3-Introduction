import { PublicKey } from "@solana/web3.js";
import { explorerURL, loadPublicKeysFromFile, printConsoleSeparator } from "../lib/helper";
import { connection, payer } from "../lib/vars";
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";

(async () => {
  console.log("Payer address:", payer.publicKey.toBase58());

  // load the stored PublicKeys for ease of use
  let localKeys = loadPublicKeysFromFile();

  // ensure the desired script was already run
  if (!localKeys?.tokenMint)
    return console.warn("No local keys were found. Please run '3.createTokenWithMetadata.ts'");

  const tokenMint: PublicKey = localKeys.tokenMint;

  console.log("==== Local PublicKeys loaded ====");
  console.log("Token's mint address:", tokenMint.toBase58());
  console.log(explorerURL({ address: tokenMint.toBase58() }));

  /**
   * define our ship's JSON metadata
   * checkout: https://nft.storage/ to help store images
   */
  const metadata = {
    name: "The Gradient Pearl",
    symbol: "SHIP",
    description:
      "The Gradient Pearl is a legendary Pirate ship that sails the Seven Seas. Captain Rajovenko leads with a drink can in his hand. ",
    image:
      "https://bafybeic75qqhfytc6xxoze2lo5af2lfhmo2kh4mhirelni2wota633dgqu.ipfs.nftstorage.link/",
  };

  // create an instance of Metaplex sdk for use
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    );

  console.log("Uploading metadata...");
  // upload the JSON metadata
  const { uri } = await metaplex.nfts().uploadMetadata(metadata);

  console.log("Metadata uploaded:", uri);
  printConsoleSeparator("NFT details");
  console.log("Creating NFT using Metaplex...");

  // create a new nft using the metaplex sdk
  const { nft, response } = await metaplex.nfts().create({
    uri,
    name: metadata.name,
    symbol: metadata.symbol,
    sellerFeeBasisPoints: 500,
    isMutable: true,
  });

  console.log(nft);

  printConsoleSeparator("NFT created:");
  console.log(explorerURL({ txSignature: response.signature }));

})();
