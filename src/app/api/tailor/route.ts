// app/api/tailor/route.ts

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming request body:", body);

    const { resume, jobDesc } = body;

    if (!resume || !jobDesc) {
      return new Response(
        JSON.stringify({ error: 'Missing resume or job description' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error("Server misconfiguration: missing N8N_WEBHOOK_URL");
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jobDesc }),
    });

    if (!response.ok) {
      console.error("❌ n8n webhook error:", await response.text());
      return new Response(
        JSON.stringify({ error: 'n8n webhook call failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log("✅ Response from n8n:", result);

    // Try to extract the actual tailored resume string
    let tailoredContent: any = null;

    if (typeof result === 'string') {
      tailoredContent = result;
    } else if (result.tailoredResume) {
      tailoredContent = result.tailoredResume;
    } else if (result.data) {
      tailoredContent = result.data;
    } else if (result.result) {
      tailoredContent = result.result;
    } else if (result.output) {
      tailoredContent = result.output;
    }

    // If it's still not a string, convert it to string for safety
    if (typeof tailoredContent !== 'string') {
      console.warn("🔍 Non-string tailored content received:", tailoredContent);
      tailoredContent = JSON.stringify(tailoredContent);
    }

    return new Response(
      JSON.stringify({ tailoredResume: tailoredContent }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("❌ Server error in /api/tailor:", error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
