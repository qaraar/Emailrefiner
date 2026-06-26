export async function onRequestPost(context) {
    const { request, env } = context;
    const { prompt, tone } = await request.json();

    // اگر کلاؤڈ فلیر میں کی (Key) نہ ملے تو یہیں سے ایرر پکڑا جائے گا
    if (!env.GROQ_API_KEY) {
        return new Response(JSON.stringify({ error: "Cloudflare settings missing GROQ_API_KEY" }), { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + env.GROQ_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: "You are a professional Email Refiner. Please rewrite the following email in a " + tone + " tone." },
                { role: "user", content: prompt }
            ]
        })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
        return new Response(JSON.stringify({ refinedEmail: data.choices[0].message.content }), {
            headers: { "Content-Type": "application/json" }
        });
    } else {
        return new Response(JSON.stringify({ error: "Groq API error", details: data }), { status: 500 });
    }
}
