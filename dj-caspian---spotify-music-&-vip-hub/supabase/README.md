# Supabase migration

Before deploying the application changes, run `migrations/20261030150000_track_integrity.sql` in the SQL Editor of Supabase project `irkdzjizhwxbmnnfyqsx`.

This migration:
- Adds a SHA-256 fingerprint column and a unique partial index.
- Adds an RPC that verifies the authenticated user's admin role, removes known dependent rows, deletes the track row in one database transaction, and returns its Storage paths.
- Does not delete any existing records or Storage objects when applied.

Operational notes:
- Existing tracks have a null fingerprint until a deliberate backfill is performed. The upload flow will prevent new duplicates among files that have fingerprints; it cannot identify old duplicates until backfill.
- Storage cleanup runs after the database transaction. If Storage removal fails, the UI reports the partial failure; an orphaned object may need manual retry.
- The RPC references the currently used `user_roles`, `user_likes`, and `playlist_tracks` tables. Confirm the deployed schema and Storage policies before running the migration.
