export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS Headers تاکہ فرنٹ اینڈ بلاک نہ ہو
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { prompt, sourceLang, targetLang } = await request.json();

    // Groq API کو کلاؤڈ فلیر کے خفیہ سیکرٹ (env.GROQ_API_KEY) کے ساتھ کال کرنا
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are a professional language translator. Translate the text exactly from ${sourceLang} to ${targetLang}. Return ONLY the direct translation output. No extra notes, no chatting, no intro.`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0].message.content) {
      return new Response(JSON.stringify({ error: "Groq API Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const translatedText = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ translatedText }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}

// OPTIONS ریکویسٹ کو ہینڈل کرنے کے لیے
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
