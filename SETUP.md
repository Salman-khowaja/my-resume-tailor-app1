# AI Recipe Generator Setup Guide

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

### Required for Authentication (Supabase)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Required for Recipe Generation (Make.com Webhook)
```env
MAKE_WEBHOOK_URL=your_make_webhook_url
```

## How to Get These Values

### Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Add them to your `.env.local` file

### Make.com Webhook Setup
1. Go to [make.com](https://make.com) and create a new scenario
2. Add a webhook trigger
3. Copy the webhook URL
4. Add it to your `.env.local` file

## Authentication Flow

Once Supabase is configured:
1. Users will be redirected to `/login` when accessing the main page
2. They enter their email and receive a magic link
3. Clicking the magic link logs them in and redirects to the main page
4. They can then generate recipes using the connected webhook

## Testing the Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. You should be redirected to the login page
4. Enter your email to test the magic link authentication
5. After login, try generating a recipe to test the webhook

## Troubleshooting

- **Not redirecting to login**: Check that Supabase environment variables are set
- **Webhook not working**: Check that `MAKE_WEBHOOK_URL` is set correctly
- **Magic link not working**: Check your Supabase project settings and email configuration 