use anchor_lang::prelude::*;

declare_id!("BddZyxYaMEnRSBMjqjYMLbGzwfnZwXggB8FFoLYC5hED");

#[program]
pub mod gold_pegged_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
