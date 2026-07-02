
-- Add views column to articles table
ALTER TABLE "public"."articles" ADD COLUMN "views" int4 DEFAULT 0;
