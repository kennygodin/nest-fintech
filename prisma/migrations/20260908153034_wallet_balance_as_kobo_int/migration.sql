/*
  Warnings:

  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE INTEGER;
