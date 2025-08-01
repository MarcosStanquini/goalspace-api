/*
  Warnings:

  - Added the required column `isCompleted` to the `subtasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subtasks" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL;
