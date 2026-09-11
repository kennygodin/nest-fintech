export const WALLET_MESSAGES = {
  NOT_FOUND: 'Wallet not found',
  NOT_ACTIVE: 'Wallet is not active',
  IDEMPOTENCY_CONFLICT: 'Idempotency key conflict',
  MISSING_IDEMPOTENCY_KEY: 'Idempotency key is required',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  CANNOT_TRANSFER_TO_SELF: 'Cannot transfer to self',
  RECIPIENT_WALLET_NOT_ACTIVE: 'Recipient wallet is not active',
} as const;
