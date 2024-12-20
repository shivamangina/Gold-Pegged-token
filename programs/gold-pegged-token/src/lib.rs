use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("GLMZuTEAWQSdkiQWTvfvKM1Mv1WKnqphqvTWQWKJm8NB");

#[program]
pub mod gold_pegged_token {
    use super::*;

    pub fn mint_gold(ctx: Context<MintGold>, amount: u64) -> ProgramResult {
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Mint the tokens
        token::mint_to(cpi_ctx, amount)?;
        Ok(())
    }

    pub fn sell_gold(ctx: Context<SellGold>, amount: u64) -> ProgramResult {
        let cpi_accounts = Transfer {
            from: ctx.accounts.token_account.to_account_info(),
            to: ctx.accounts.contract_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Transfer the tokens back to the contract
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintGold<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This account is used to receive SOL and does not need to be deserialized
    #[account(mut)]
    pub contract: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SellGold<'info> {
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    /// CHECK: This account is used for token transfers and does not need to be deserialized
    #[account(mut)]
    pub contract_token_account: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This account is used to send SOL back to the user and does not need to be deserialized
    #[account(mut)]
    pub contract: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}
