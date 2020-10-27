-- Up
CREATE TABLE "commodityCategories" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "commodities" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" INTEGER NOT NULL,
    "averagePrice" INTEGER NOT NULL,
    "rare" INTEGER NOT NULL,
    "maxBuyPrice" INTEGER NOT NULL,
    "maxSellPrice" INTEGER NOT NULL,
    "minBuyPrice" INTEGER NOT NULL,
    "minSellPrice" INTEGER NOT NULL,
    "buyPriceLowerAverage" INTEGER NOT NULL,
    "sellPriceUpperAverage" INTEGER NOT NULL,
    "nonMarketable" INTEGER NOT NULL,
    "edId" INTEGER NOT NULL,
    CONSTRAINT "commodityCategory" FOREIGN KEY ( "category" ) REFERENCES "commodityCategories"( "id" ) ON DELETE CASCADE
);

-- Down
DROP TABLE "commodities";
DROP TABLE "commodityCategories";
