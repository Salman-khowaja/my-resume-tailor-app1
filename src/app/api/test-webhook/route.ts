export async function GET() {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL
  
  return new Response(JSON.stringify({
    hasWebhookUrl: !!webhookUrl,
    webhookUrl: webhookUrl ? webhookUrl.substring(0, 50) + '...' : 'not set',
    allEnvVars: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasWebhookUrl: !!process.env.MAKE_WEBHOOK_URL
    }
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
} 