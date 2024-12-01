use anchor_lang::prelude::*;

declare_id!("FXVzuu34eP69d2DyKcVDwUstqxU2cf5YAGdbMCxWvXE7");

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
