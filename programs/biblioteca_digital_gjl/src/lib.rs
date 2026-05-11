use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

declare_id!("Biblibrary11111111111111111111111111111111111");

const MAX_ISBN_LENGTH: usize = 32;
const MAX_TITLE_LENGTH: usize = 100;
const MAX_HASH_LENGTH: usize = 64;
const MAX_BOOKS_READ: usize = 50;
const MINT_AUTHORITY_SEED: &[u8] = b"mint_authority";

#[program]
pub mod biblioteca_digital_gjl {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;

        // O dono da conta UserAccount será sempre a carteira que inicializa o perfil.
        user_account.owner = ctx.accounts.user.key();
        user_account.xp = 0;
        user_account.level = 1;
        user_account.total_tokens = 0;
        user_account.books_read = Vec::new();

        Ok(())
    }

    pub fn create_book(ctx: Context<CreateBook>, isbn: String, title: String, ipfs_hash: String) -> Result<()> {
        let book_account = &mut ctx.accounts.book_account;

        require!(isbn.len() <= MAX_ISBN_LENGTH, ContractError::IsbnTooLong);
        require!(title.len() <= MAX_TITLE_LENGTH, ContractError::TitleTooLong);
        require!(ipfs_hash.len() <= MAX_HASH_LENGTH, ContractError::IpfsHashTooLong);

        book_account.owner = ctx.accounts.authority.key();
        book_account.isbn = isbn;
        book_account.title = title;
        book_account.ipfs_hash = ipfs_hash;

        Ok(())
    }

    pub fn register_reading(ctx: Context<RegisterReading>, isbn: String) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;

        require!(isbn.len() <= MAX_ISBN_LENGTH, ContractError::IsbnTooLong);
        require!(user_account.books_read.len() < MAX_BOOKS_READ, ContractError::MaxBooksReached);
        require!(!user_account.books_read.contains(&isbn), ContractError::BookAlreadyRead);

        // Atualiza o estado do usuário antes de executar o CPI de mint.
        user_account.books_read.push(isbn.clone());
        user_account.xp = user_account.xp.checked_add(100).ok_or(ContractError::Overflow)?;
        user_account.level = compute_level(user_account.xp);

        let reward_multiplier = 1 + (user_account.level as u64 / 3);
        let reward_amount = 10u64.checked_mul(reward_multiplier).ok_or(ContractError::Overflow)?;
        user_account.total_tokens = user_account.total_tokens.checked_add(reward_amount).ok_or(ContractError::Overflow)?;

        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let bump = *ctx.bumps.get("mint_authority").unwrap();
        let seeds = &[MINT_AUTHORITY_SEED, &[bump]];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(cpi_program, cpi_accounts, signer),
            reward_amount,
        )?;

        emit!(ReadingCompleted {
            user: user_account.owner,
            isbn,
            xp: user_account.xp,
            level: user_account.level,
            reward: reward_amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = user,
        space = UserAccount::LEN,
        seeds = [b"user_account", user.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateBook<'info> {
    #[account(init, payer = authority, space = BookAccount::LEN)]
    pub book_account: Account<'info, BookAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterReading<'info> {
    #[account(
        mut,
        constraint = user_account.owner == user.key() @ ContractError::UnauthorizedUser,
        seeds = [b"user_account", user.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut, token::mint = token_mint, token::authority = user)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    /// CHECK: mint authority is uma PDA derivada pelo programa.
    #[account(seeds = [MINT_AUTHORITY_SEED], bump)]
    pub mint_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct UserAccount {
    pub owner: Pubkey,
    pub xp: u64,
    pub level: u8,
    pub total_tokens: u64,
    pub books_read: Vec<String>,
}

impl UserAccount {
    pub const LEN: usize = 8 + 32 + 8 + 1 + 8 + 4 + MAX_BOOKS_READ * (4 + MAX_ISBN_LENGTH);
}

#[account]
pub struct BookAccount {
    pub owner: Pubkey,
    pub isbn: String,
    pub title: String,
    pub ipfs_hash: String,
}

impl BookAccount {
    pub const LEN: usize = 8 + 32 + 4 + MAX_ISBN_LENGTH + 4 + MAX_TITLE_LENGTH + 4 + MAX_HASH_LENGTH;
}

#[event]
pub struct ReadingCompleted {
    pub user: Pubkey,
    pub isbn: String,
    pub xp: u64,
    pub level: u8,
    pub reward: u64,
}

#[error_code]
pub enum ContractError {
    #[msg("O usuário já registrou a leitura deste livro.")]
    BookAlreadyRead,
    #[msg("O usuário atingiu o limite de livros registrados.")]
    MaxBooksReached,
    #[msg("A wallet informada não é dona deste perfil.")]
    UnauthorizedUser,
    #[msg("O ISBN excede o tamanho máximo permitido.")]
    IsbnTooLong,
    #[msg("O título excede o tamanho máximo permitido.")]
    TitleTooLong,
    #[msg("O hash IPFS excede o tamanho máximo permitido.")]
    IpfsHashTooLong,
    #[msg("Arithmetic overflow ao atualizar o estado do usuário.")]
    Overflow,
}

fn compute_level(xp: u64) -> u8 {
    match xp {
        0..=499 => 1,
        500..=1499 => 2,
        1500..=2999 => 3,
        3000..=4999 => 4,
        _ => ((xp / 1000) + 1).min(255) as u8,
    }
}
