/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,blockType]` on the table `AppBlock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AppBlock_sessionId_blockType_key" ON "AppBlock"("sessionId", "blockType");
