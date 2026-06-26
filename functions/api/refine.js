export async function onRequestPost(context) {
    const { request, env } = context;
    const { prompt, tone } = await request.json();

    // اگر آپ نے کلاؤڈ فلیر میں نام APT رکھا ہو یا API، یہ دونوں کو سنبھال لے گا
    const finalApiKey = env.GROQ_API_KEY || env.GROQ_APT_KEY;

    if (!finalApiKey) {
        return new Response(JSON.stringify({ error: "Cloudflare settings missing Key" }), { status: 500 });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + finalApiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // یہاں ہم نے ایک اور مستحکم ماڈل لگا دیا ہے تاکہ ماڈل کا مسئلہ حل ہو جائے
                model: "llama-3.1-8b-instant", 
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
            // اب اگر کوئی ایرر آئے گا تو یہ اسکرین پر Groq کا اصل میسج دکھائے گا
            const errorMsg = data.error?.message || "Groq rejected the key";
            return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: "Fetch failed on Cloudflare side" }), { status: 500 });
    }
}
