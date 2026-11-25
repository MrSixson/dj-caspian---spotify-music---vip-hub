# Firebase Cloud Messaging setup for DJ Caspian

## Already configured in this repository
- Android package ID: `com.caspian.dj`
- Firebase project: `dj-caspian`
- Android Firebase config: `firebase/google-services.json`
- Capacitor push notification registration is initialized only in the native app.
- Device FCM tokens are inserted into `public.device_push_tokens`; clients cannot read the token table.

## One-time Supabase database setup
Run the SQL in:
`supabase/migrations/20261125160000_device_push_tokens.sql`

You can run it in Supabase Dashboard → SQL Editor → New query. Do not paste any service-role key into the app or GitHub.

## Android build
The GitHub Actions workflow copies `firebase/google-services.json` into `android/app`, applies the Google Services Gradle plugin, generates launcher icons from the official Caspian logo, and builds `DJ-Caspian.apk`.

## Important limitation
Receiving notifications is wired into the Android app, but sending a broadcast requires a trusted server-side sender (Firebase Admin SDK / FCM HTTP v1) and a private Firebase service-account credential stored as a Supabase Edge Function secret. Never put that private JSON key in this repository or in the APK. The Firebase Console campaign composer can also send supported campaigns after the app is installed and has registered with FCM.

## Test
1. Install a newly built APK on a real Android phone.
2. Allow notifications when Android asks.
3. Open Supabase Table Editor and confirm a row appears in `device_push_tokens`.
4. Send a test notification from Firebase Cloud Messaging and verify it appears on the phone.


## Enable automatic push sending
Deploy the Edge Function in `supabase/functions/send-push-notification/index.ts` to the Supabase project.

In Supabase Dashboard → Project Settings → Edge Functions → Secrets, add:
- `FIREBASE_SERVICE_ACCOUNT`: the full JSON contents of a private service-account key created in Firebase Console → Project settings → Service accounts → Generate new private key.

Keep this JSON private. Do not commit it, upload it to GitHub, or place it in the Android app. Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions.

The function checks the caller's authenticated `user_roles.role = 'admin'` before sending. Publishing a new track or publishing an app release then requests a push notification automatically. If the function or secret is not deployed, publishing still succeeds but no system notification is sent.
