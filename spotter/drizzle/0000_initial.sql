CREATE TABLE "account_metric_days" (
	"platform_account_id" uuid NOT NULL,
	"data_origin" text NOT NULL,
	"day" text NOT NULL,
	"metrics" jsonb NOT NULL,
	"collected_at" timestamp with time zone NOT NULL,
	CONSTRAINT "account_metric_days_platform_account_id_day_pk" PRIMARY KEY("platform_account_id","day")
);
--> statement-breakpoint
CREATE TABLE "ai_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"input_hash" text NOT NULL,
	"status" text NOT NULL,
	"topic" text,
	"topic_key" text,
	"format" text,
	"hook" text,
	"hook_type" text,
	"style" text,
	"target_audience" text,
	"controversy" real,
	"exercises" text[],
	"keywords" text[],
	"summary" text,
	"confidence" real,
	"niche_relevance" real,
	"error" text,
	"attempts" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_analysis_content_item_id_unique" UNIQUE("content_item_id")
);
--> statement-breakpoint
CREATE TABLE "api_quota_usage" (
	"bucket" text NOT NULL,
	"quota_day" text NOT NULL,
	"units_used" integer DEFAULT 0 NOT NULL,
	"call_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_quota_usage_bucket_quota_day_pk" PRIMARY KEY("bucket","quota_day")
);
--> statement-breakpoint
CREATE TABLE "collection_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"data_mode" text NOT NULL,
	"trigger" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"clock_at" timestamp with time zone,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"heartbeat_at" timestamp with time zone,
	"worker_id" text,
	"platform_results" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "content_embeddings" (
	"content_item_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"dims" integer NOT NULL,
	"vector" real[] NOT NULL,
	"input_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_embeddings_content_item_id_model_pk" PRIMARY KEY("content_item_id","model")
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"data_origin" text NOT NULL,
	"external_id" text NOT NULL,
	"creator_id" uuid,
	"is_own" boolean DEFAULT false NOT NULL,
	"url" text,
	"published_at" timestamp with time zone,
	"title" text,
	"caption" text,
	"transcript" text,
	"duration_seconds" integer,
	"media_type" text,
	"hashtags" text[],
	"audio_id" text,
	"audio_name" text,
	"audio_type" text,
	"thumbnail_url" text,
	"language" text,
	"discovered_via" text,
	"availability" text DEFAULT 'available' NOT NULL,
	"availability_checked_at" timestamp with time zone,
	"content_hash" text,
	"first_collected_at" timestamp with time zone NOT NULL,
	"last_collected_at" timestamp with time zone NOT NULL,
	"metadata_refreshed_at" timestamp with time zone NOT NULL,
	"latest_snapshot_at" timestamp with time zone,
	"latest_view_count" bigint,
	"latest_like_count" bigint,
	"latest_comment_count" bigint,
	"latest_share_count" bigint,
	"latest_save_count" bigint,
	"latest_reach" bigint,
	"latest_impressions" bigint,
	"own_lift" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_items_platform_check" CHECK (platform in ('youtube', 'instagram', 'tiktok'))
);
--> statement-breakpoint
CREATE TABLE "content_metric_snapshots" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"content_item_id" uuid NOT NULL,
	"collected_at" timestamp with time zone NOT NULL,
	"collection_run_id" uuid,
	"view_count" bigint,
	"like_count" bigint,
	"comment_count" bigint,
	"share_count" bigint,
	"save_count" bigint,
	"reach" bigint,
	"impressions" bigint,
	"creator_follower_count" bigint,
	"source" text NOT NULL,
	"extra" jsonb
);
--> statement-breakpoint
CREATE TABLE "creator_baselines" (
	"creator_id" uuid PRIMARY KEY NOT NULL,
	"computed_at" timestamp with time zone NOT NULL,
	"method" text NOT NULL,
	"sample_size" integer NOT NULL,
	"window_days" integer NOT NULL,
	"sufficient" boolean NOT NULL,
	"median_views" double precision,
	"mad_log_views" double precision,
	"p25_views" double precision,
	"p75_views" double precision,
	"median_engagement_rate" double precision,
	"median_views_per_follower" double precision
);
--> statement-breakpoint
CREATE TABLE "creator_content_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"data_mode" text NOT NULL,
	"computed_at" timestamp with time zone NOT NULL,
	"dimension" text NOT NULL,
	"value" text NOT NULL,
	"post_count" integer NOT NULL,
	"mean_log_lift" double precision NOT NULL,
	"lift" double precision NOT NULL,
	"median_views" double precision,
	"avg_engagement_rate" double precision,
	"confidence" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"niche" text DEFAULT 'Fitness / Bodybuilding / Strength Training' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"data_mode" text DEFAULT 'demo' NOT NULL,
	"settings" jsonb NOT NULL,
	"setup_step" integer DEFAULT 1 NOT NULL,
	"setup_completed_at" timestamp with time zone,
	"demo_anchor_at" timestamp with time zone,
	"demo_seed" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "creator_profiles_data_mode_check" CHECK ("creator_profiles"."data_mode" in ('demo', 'live'))
);
--> statement-breakpoint
CREATE TABLE "creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"data_origin" text NOT NULL,
	"external_id" text NOT NULL,
	"handle" text,
	"display_name" text,
	"profile_url" text,
	"avatar_url" text,
	"follower_count" bigint,
	"follower_count_observed_at" timestamp with time zone,
	"is_own" boolean DEFAULT false NOT NULL,
	"platform_account_id" uuid,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creators_platform_check" CHECK (platform in ('youtube', 'instagram', 'tiktok'))
);
--> statement-breakpoint
CREATE TABLE "data_deletion_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"confirmation_code" text NOT NULL,
	"platform" text NOT NULL,
	"external_user_id" text,
	"source" text NOT NULL,
	"status" text NOT NULL,
	"detail" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "data_deletion_requests_confirmation_code_unique" UNIQUE("confirmation_code")
);
--> statement-breakpoint
CREATE TABLE "oauth_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_account_id" uuid NOT NULL,
	"access_token_enc" text NOT NULL,
	"refresh_token_enc" text,
	"token_type" text,
	"scope" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"last_refreshed_at" timestamp with time zone,
	"refresh_failures" integer DEFAULT 0 NOT NULL,
	"last_refresh_error" text,
	"encryption_key_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_credentials_platform_account_id_unique" UNIQUE("platform_account_id")
);
--> statement-breakpoint
CREATE TABLE "oauth_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_hash" text NOT NULL,
	"platform" text NOT NULL,
	"mode" text NOT NULL,
	"user_id" uuid NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"code_verifier_enc" text,
	"redirect_uri" text NOT NULL,
	"return_to" text,
	"auth_variant" text,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_states_state_hash_unique" UNIQUE("state_hash")
);
--> statement-breakpoint
CREATE TABLE "platform_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"mode" text NOT NULL,
	"auth_variant" text,
	"external_account_id" text,
	"username" text,
	"display_name" text,
	"profile_url" text,
	"avatar_url" text,
	"follower_count" bigint,
	"granted_scopes" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'connected' NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_sync_at" timestamp with time zone,
	"disconnected_at" timestamp with time zone,
	"access_lost_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"discovery_cursor" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_accounts_platform_check" CHECK (platform in ('youtube', 'instagram', 'tiktok')),
	CONSTRAINT "platform_accounts_mode_check" CHECK ("platform_accounts"."mode" in ('mock', 'live'))
);
--> statement-breakpoint
CREATE TABLE "platform_connector_health" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"mode" text NOT NULL,
	"status" text NOT NULL,
	"token_status" text DEFAULT 'missing' NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"last_success_at" timestamp with time zone,
	"last_failure_at" timestamp with time zone,
	"last_failure_kind" text,
	"last_failure_reason" text,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"backoff_until" timestamp with time zone,
	"next_scheduled_at" timestamp with time zone,
	"rate_limit" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"data_mode" text NOT NULL,
	"batch_id" uuid NOT NULL,
	"source" text DEFAULT 'batch' NOT NULL,
	"cluster_id" uuid,
	"rank" integer NOT NULL,
	"opportunity_score" real NOT NULL,
	"trend_score" real NOT NULL,
	"creator_fit_score" real NOT NULL,
	"confidence" real NOT NULL,
	"stage" text NOT NULL,
	"trend_label" text NOT NULL,
	"one_liner" text NOT NULL,
	"why_it_matters" text NOT NULL,
	"suggested_angle" text NOT NULL,
	"suggested_hook" text NOT NULL,
	"title_concept" text NOT NULL,
	"caption_concept" text,
	"structure" jsonb NOT NULL,
	"alternative_angles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence" jsonb NOT NULL,
	"fit_components" jsonb NOT NULL,
	"generated_by" text NOT NULL,
	"prompt_version" text NOT NULL,
	"generation_note" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "system_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"creator_profile_id" uuid,
	"level" text NOT NULL,
	"category" text NOT NULL,
	"platform" text,
	"message" text NOT NULL,
	"context" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trend_cluster_members" (
	"cluster_id" uuid NOT NULL,
	"content_item_id" uuid NOT NULL,
	"similarity" real NOT NULL,
	"assigned_at" timestamp with time zone NOT NULL,
	"outperformance" real,
	"outperformance_method" text,
	"views_per_hour" real,
	CONSTRAINT "trend_cluster_members_cluster_id_content_item_id_pk" PRIMARY KEY("cluster_id","content_item_id")
);
--> statement-breakpoint
CREATE TABLE "trend_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"data_mode" text NOT NULL,
	"label" text NOT NULL,
	"label_item_count" integer DEFAULT 0 NOT NULL,
	"topic_key" text,
	"summary" text,
	"status" text DEFAULT 'active' NOT NULL,
	"merged_into_id" uuid,
	"centroid" real[] NOT NULL,
	"embedding_model" text NOT NULL,
	"first_detected_at" timestamp with time zone NOT NULL,
	"last_activity_at" timestamp with time zone NOT NULL,
	"stage" text,
	"stage_basis" text,
	"platforms" text[] DEFAULT '{}'::text[] NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"creator_count" integer DEFAULT 0 NOT NULL,
	"is_breakout" boolean DEFAULT false NOT NULL,
	"keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"patterns" jsonb,
	"explanation" text,
	"explanation_by" text,
	"latest_trend_score" real,
	"latest_confidence" real,
	"latest_fit_score" real,
	"latest_fit_components" jsonb,
	"latest_opportunity_score" real,
	"latest_scored_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trend_clusters_data_mode_check" CHECK ("trend_clusters"."data_mode" in ('demo', 'live'))
);
--> statement-breakpoint
CREATE TABLE "trend_scores" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"cluster_id" uuid NOT NULL,
	"collection_run_id" uuid,
	"computed_at" timestamp with time zone NOT NULL,
	"trend_score" real NOT NULL,
	"components" jsonb NOT NULL,
	"weights" jsonb NOT NULL,
	"confidence" real NOT NULL,
	"stage" text NOT NULL,
	"metrics" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account_metric_days" ADD CONSTRAINT "account_metric_days_platform_account_id_platform_accounts_id_fk" FOREIGN KEY ("platform_account_id") REFERENCES "public"."platform_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analysis" ADD CONSTRAINT "ai_analysis_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD CONSTRAINT "collection_runs_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_embeddings" ADD CONSTRAINT "content_embeddings_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_metric_snapshots" ADD CONSTRAINT "content_metric_snapshots_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_metric_snapshots" ADD CONSTRAINT "content_metric_snapshots_collection_run_id_collection_runs_id_fk" FOREIGN KEY ("collection_run_id") REFERENCES "public"."collection_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_baselines" ADD CONSTRAINT "creator_baselines_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_content_performance" ADD CONSTRAINT "creator_content_performance_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_platform_account_id_platform_accounts_id_fk" FOREIGN KEY ("platform_account_id") REFERENCES "public"."platform_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_credentials" ADD CONSTRAINT "oauth_credentials_platform_account_id_platform_accounts_id_fk" FOREIGN KEY ("platform_account_id") REFERENCES "public"."platform_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_states" ADD CONSTRAINT "oauth_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_states" ADD CONSTRAINT "oauth_states_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_accounts" ADD CONSTRAINT "platform_accounts_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_connector_health" ADD CONSTRAINT "platform_connector_health_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_cluster_id_trend_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."trend_clusters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_events" ADD CONSTRAINT "system_events_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trend_cluster_members" ADD CONSTRAINT "trend_cluster_members_cluster_id_trend_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."trend_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trend_cluster_members" ADD CONSTRAINT "trend_cluster_members_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trend_clusters" ADD CONSTRAINT "trend_clusters_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trend_scores" ADD CONSTRAINT "trend_scores_cluster_id_trend_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."trend_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trend_scores" ADD CONSTRAINT "trend_scores_collection_run_id_collection_runs_id_fk" FOREIGN KEY ("collection_run_id") REFERENCES "public"."collection_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_analysis_topic_key_idx" ON "ai_analysis" USING btree ("topic_key");--> statement-breakpoint
CREATE INDEX "collection_runs_profile_requested_idx" ON "collection_runs" USING btree ("creator_profile_id","requested_at");--> statement-breakpoint
CREATE INDEX "collection_runs_status_idx" ON "collection_runs" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "collection_runs_schedule_slot_key" ON "collection_runs" USING btree ("creator_profile_id","data_mode","scheduled_for") WHERE "collection_runs"."trigger" = 'schedule';--> statement-breakpoint
CREATE INDEX "content_embeddings_model_idx" ON "content_embeddings" USING btree ("model");--> statement-breakpoint
CREATE UNIQUE INDEX "content_items_platform_origin_external_key" ON "content_items" USING btree ("platform","data_origin","external_id");--> statement-breakpoint
CREATE INDEX "content_items_origin_own_published_idx" ON "content_items" USING btree ("data_origin","is_own","published_at");--> statement-breakpoint
CREATE INDEX "content_items_creator_idx" ON "content_items" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "content_metric_snapshots_item_time_idx" ON "content_metric_snapshots" USING btree ("content_item_id","collected_at");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_content_performance_key" ON "creator_content_performance" USING btree ("creator_profile_id","data_mode","dimension","value");--> statement-breakpoint
CREATE UNIQUE INDEX "creators_platform_origin_external_key" ON "creators" USING btree ("platform","data_origin","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_accounts_profile_platform_mode_key" ON "platform_accounts" USING btree ("creator_profile_id","platform","mode");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_connector_health_key" ON "platform_connector_health" USING btree ("creator_profile_id","platform","mode");--> statement-breakpoint
CREATE INDEX "recommendations_profile_mode_created_idx" ON "recommendations" USING btree ("creator_profile_id","data_mode","created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "system_events_profile_created_idx" ON "system_events" USING btree ("creator_profile_id","created_at");--> statement-breakpoint
CREATE INDEX "trend_cluster_members_item_idx" ON "trend_cluster_members" USING btree ("content_item_id");--> statement-breakpoint
CREATE INDEX "trend_clusters_profile_mode_status_idx" ON "trend_clusters" USING btree ("creator_profile_id","data_mode","status");--> statement-breakpoint
CREATE INDEX "trend_scores_cluster_time_idx" ON "trend_scores" USING btree ("cluster_id","computed_at");