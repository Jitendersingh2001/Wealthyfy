export const CONSTANTS = Object.freeze({
    COMPLETED_STATUS: 'COMPLETED',
});

// Transaction type constants
export const TRANSACTION_TYPES = Object.freeze({
    CREDIT: 'CREDIT' as const,
    DEBIT: 'DEBIT' as const,
} as const);

export type TransactionType = typeof TRANSACTION_TYPES.CREDIT | typeof TRANSACTION_TYPES.DEBIT;
