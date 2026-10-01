-- Rollback migration: 0005_secret_betty_ross
-- Drops the static_pages table and all associated indexes/constraints
DROP TABLE IF EXISTS "static_pages" CASCADE;
