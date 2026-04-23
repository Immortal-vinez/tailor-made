-- Improve Product query performance for storefront/category filtering.
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product" ("category");
CREATE INDEX IF NOT EXISTS "Product_featured_idx" ON "Product" ("featured");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product" ("createdAt");
CREATE INDEX IF NOT EXISTS "Product_category_featured_createdAt_idx" ON "Product" ("category", "featured", "createdAt");
