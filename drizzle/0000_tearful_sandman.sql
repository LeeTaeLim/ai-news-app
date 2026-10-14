CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source" text NOT NULL,
	"original_title" text NOT NULL,
	"link" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"title_ko" text NOT NULL,
	"summary_ko" text NOT NULL,
	"category_id" uuid,
	"notion_page_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_userId_link_unique" UNIQUE("user_id","link")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_userId_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "notion_connections" (
	"user_id" text PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"target_page_id" text
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_user_id_published_at_index" ON "articles" USING btree ("user_id","published_at");--> statement-breakpoint
CREATE INDEX "articles_category_id_index" ON "articles" USING btree ("category_id");