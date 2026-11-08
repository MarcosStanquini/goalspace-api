-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "remindBefore24h" BOOLEAN NOT NULL DEFAULT false,
    "remindBefore1h" BOOLEAN NOT NULL DEFAULT false,
    "onGoalCompleted" BOOLEAN NOT NULL DEFAULT false,
    "weeklyReport" BOOLEAN NOT NULL DEFAULT false,
    "achievementAlert" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
