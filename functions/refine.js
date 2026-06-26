export async function onRequestPost(context) {
    try {
        const input = await context.request.json();
        const { prompt, tone } = input;
        const apiKey = context.env.GROQ_API_KEY;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: `You are a professional Email Refiner. Rewrite in ${tone} tone.` },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            return new Response(JSON.stringify({ refinedEmail: data.choices[0].message.content }), {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            return new Response(JSON.stringify({ error: "Groq API error" }), { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
