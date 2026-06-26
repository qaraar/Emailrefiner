export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { prompt, sourceLang, targetLang } = await request.json();
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: `You are a professional language translator. Translate the text exactly from ${sourceLang} to ${targetLang}. Return ONLY the direct translation output. No extra notes.` },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();
    return new Response(JSON.stringify({ translatedText }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}
