import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GoldPeggedToken } from "../target/types/gold_pegged_token";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo, getAccount } from "@solana/spl-token";
import assert from "assert";

describe("gold-pegged-token", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GoldPeggedToken as Program<GoldPeggedToken>;

  let mint: PublicKey;
  let userTokenAccount: PublicKey;
  let contractTokenAccount: PublicKey;
  const user = provider.wallet.publicKey;
  const contract = Keypair.generate();

  before(async () => {
    // Create the mint and token accounts
    mint = await createMint(provider.connection, provider.wallet.payer, user, null, 9);
    userTokenAccount = await createAccount(provider.connection, provider.wallet.payer, mint, user);
    contractTokenAccount = await createAccount(provider.connection, provider.wallet.payer, mint, contract.publicKey);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    // const calculator = anchor.web3.Keypair.generate();
   



  it("Mints gold tokens by paying SOL", async () => {
    const amount = 1000;

    await program.rpc.mint_gold(new anchor.BN(amount), {
      accounts: {
        mint: mint,
        tokenAccount: userTokenAccount,
        authority: user,
        user: user,
        contract: contract.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
    });

    const userTokenAccountInfo = await getAccount(provider.connection, userTokenAccount);
    assert.ok(userTokenAccountInfo.amount.toNumber() === amount);
  });

  it("Sells gold tokens to get SOL back", async () => {
    const amount = 500;

    await program.rpc.sellGold(new anchor.BN(amount), {
      accounts: {
        tokenAccount: userTokenAccount,
        contractTokenAccount: contractTokenAccount,
        user: user,
        contract: contract.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    const userTokenAccountInfo = await getAccount(provider.connection, userTokenAccount);
    assert.ok(userTokenAccountInfo.amount.toNumber() === 500);
  });
});
