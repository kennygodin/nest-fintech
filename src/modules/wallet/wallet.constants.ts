export const WALLET_MESSAGES = {
  NOT_FOUND: 'Wallet not found',
  NOT_ACTIVE: 'Wallet is not active',
  IDEMPOTENCY_CONFLICT: 'Idempotency key conflict',
  MISSING_IDEMPOTENCY_KEY: 'Idempotency key is required',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  CANNOT_TRANSFER_TO_SELF: 'Cannot transfer to self',
  RECIPIENT_WALLET_NOT_ACTIVE: 'Recipient wallet is not active',
  DEPOSIT_SUCCESS: 'Deposit successful',
  TRANSFER_SENT: 'Transfer sent',
  TRANSFER_RECEIVED: 'Transfer received',
  WITHDRAWAL_SUCCESS: 'Withdrawal success',
  WITHDRAWAL_REVERSED: 'Withdrawal reversed',
} as const;

export const WALLET_CODE = {
  DEPOSIT_SUCCESS: 'DEPOSIT_SUCCESS',
  TRANSFER_SENT: 'TRANSFER_SENT',
  TRANSFER_RECEIVED: 'TRANSFER_RECEIVED',
  WITHDRAWAL_SUCCESS: 'WITHDRAWAL_SUCCESS',
  WITHDRAWAL_REVERSED: 'WITHDRAWAL_REVERSED',
} as const;
