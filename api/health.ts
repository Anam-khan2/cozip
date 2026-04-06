// Diagnostic endpoint — returns env var presence and import status
// Hit GET https://cozip.vercel.app/api/health to debug FUNCTION_INVOCATION_FAILED

export default async function handler(req: Request): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    // Test imports one by one so we can see which one fails
    let supabaseOk = false;
    let groqOk = false;
    let aiOk = false;

    try {
      await import('./lib/supabaseServer');
      supabaseOk = true;
    } catch (e) {
      // logged below
    }

    try {
      await import('./lib/openrouter');
      groqOk = true;
    } catch (e) {
      // logged below
    }

    try {
      const { streamText } = await import('ai');
      aiOk = !!streamText;
    } catch (e) {
      // logged below
    }

    const info = {
      ok: true,
      env: {
        GROQ_API_KEY: !!process.env.GROQ_API_KEY,
        GROQ_MODEL: process.env.GROQ_MODEL ?? '(not set)',
        VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        VERCEL: !!process.env.VERCEL,
        NODE_ENV: process.env.NODE_ENV,
        NODE_VERSION: process.version,
      },
      imports: {
        supabaseServer: supabaseOk,
        openrouter: groqOk,
        ai: aiOk,
      },
    };

    return new Response(JSON.stringify(info, null, 2), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers,
    });
  }
}
