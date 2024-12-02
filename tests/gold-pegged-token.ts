import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  getAccount,
} from "@solana/spl-token";
import assert from "assert";
import { GoldPeggedToken } from "../target/types/gold_pegged_token";

describe("gold-token-contract", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .GoldPeggedToken as Program<GoldPeggedToken>;

  let mint: PublicKey;
  let userTokenAccount: PublicKey;
  let contractTokenAccount: PublicKey;
  const user = provider.wallet.publicKey;
  // airdrop user
  // const airdrop = async () => {
  //   await provider.connection.requestAirdrop(user, 1000000000);
  // };
  const contract = Keypair.generate();

  before(async () => {
    // await airdrop();
    // Create the mint and token accounts
    mint = await createMint(
      provider.connection,
      provider.wallet.payer,
      user,
      null,
      9
    );
    userTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      user
    );
    contractTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      contract.publicKey
    );
  });

  it("Mints gold tokens by paying SOL", async () => {
    const amount = 1;

    await program.rpc.mintGold(new anchor.BN(amount), {
      accounts: {
        mint: mint,
        tokenAccount: userTokenAccount,
        authority: user,
        user: user,
        contract: contract.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    const userTokenAccountInfo = await getAccount(
      provider.connection,
      userTokenAccount
    );

    console.log(userTokenAccountInfo);
    // assert.ok(userTokenAccountInfo.amount.toNumber() === amount);
  });

  it("Sells gold tokens to get SOL back", async () => {
    const amount = 1;

    await program.rpc.sellGold(new anchor.BN(amount), {
      accounts: {
        tokenAccount: userTokenAccount,
        contractTokenAccount: contractTokenAccount,
        user: user,
        contract: contract.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    const userTokenAccountInfo = await getAccount(
      provider.connection,
      userTokenAccount
    );

    console.log(userTokenAccountInfo);  
    // assert.ok(userTokenAccountInfo.amount.toNumber() === 500);
  });
});
