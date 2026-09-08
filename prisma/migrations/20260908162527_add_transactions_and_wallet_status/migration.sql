-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('active', 'frozen', 'closed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'transfer', 'withdrawal');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'processing', 'success', 'failed', 'reversed');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('debit', 'credit');

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "entryType" "LedgerEntryType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "description" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderWalletId" TEXT,
    "recipientWalletId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_idempotencyKey_key" ON "Transaction"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderWalletId_fkey" FOREIGN KEY ("senderWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recipientWalletId_fkey" FOREIGN KEY ("recipientWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
