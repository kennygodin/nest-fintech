export const TRANSACTION_MESSAGES = {
  NOT_FOUND: 'Transaction not found',
  NOT_ACTIVE: 'Transaction is not active',
  IDEMPOTENCY_CONFLICT: 'Idempotency key conflict',
  MISSING_IDEMPOTENCY_KEY: 'Idempotency key is required',
} as const;
