-- Add duration column to cms_banners table
ALTER TABLE "cms_banners" ADD COLUMN "duration" INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN "cms_banners"."duration" IS 'Duration in seconds for video banners (null = use default carousel timing)';
