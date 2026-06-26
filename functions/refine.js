export async function onRequestPost(context) {
    try {
        const { prompt, tone } = await context.request.json();
        const apiKey = context.env.GROQ_API_KEY;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: `Rewrite this email in ${tone} tone: ${prompt}` }]
            })
        });

        const data = await response.json();
        
        return new Response(JSON.stringify({ refinedEmail: data.choices[0].message.content }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
