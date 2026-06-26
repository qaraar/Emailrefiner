export async function onRequestPost(context) {
    const { request } = context;
    const { prompt, tone } = await request.json();

    // API Key
    const apiKey = "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";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
                {
                    role: "system",
                    content: `You are a professional Email Refiner. Please rewrite the following email in a ${tone} tone.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
        return new Response(
            JSON.stringify({
                refinedEmail: data.choices[0].message.content
            }),
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    } else {
        return new Response(
            JSON.stringify({
                error: "API Response Error",
                details: data
            }),
            {
                status: 500
            }
        );
    }
}
