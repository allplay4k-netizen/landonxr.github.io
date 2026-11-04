# 3D Prints storefront

Static storefront hosted on GitHub Pages. Supabase provides product data, admin authentication, photo storage, and order storage. A Supabase Edge Function sends notifications through Resend.

## 1. Supabase project
1. Create a Supabase project (an adult can help with account setup if needed).
2. In SQL Editor, run all of `supabase/schema.sql`.
3. In Authentication > Users, create the store admin account.
4. Copy that user's UUID and run the final INSERT statement in schema.sql with the UUID.
5. In Project Settings > API, copy the Project URL and anon/public key into `config.js`. The anon key is meant to be public; never use the service-role key in the website.

## 2. Deploy the order function
Deploy `supabase/functions/submit-order/index.ts` as an Edge Function named `submit-order`.
Set these Edge Function secrets:
- `SUPABASE_URL` (usually already provided by Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `RESEND_API_KEY`
- `ORDER_NOTIFICATION_TO` = `landon.luper@icloud.com`
- `ORDERS_FROM_EMAIL` = a sender address on a domain verified with Resend

Do not commit any of these secret values to GitHub. Verify the sending domain in Resend before expecting email delivery.

## 3. Publish
Commit/push the repository to GitHub. Enable GitHub Pages for the `main` branch and root folder if it is not already enabled. Visit the Pages URL, then visit `/admin.html` to sign in and manage products.

## Notes
- The public shop only displays active products.
- Only the UUID added to `admin_users` can manage products or view order records.
- Order requests are requests, not payments or confirmed sales.
- If email is not configured, the function still saves the request and reports that email was not sent.
