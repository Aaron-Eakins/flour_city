import PostalMime from 'https://esm.sh/postal-mime';

export default {
    async email(message, env, ctx) {
        // 1. Parse the raw email
        const email = await PostalMime.parse(message.raw);

        // 2. Extract key headers for threading
        const inReplyTo = email.headers.find(h => h.key === 'in-reply-to')?.value;
        const references = email.headers.find(h => h.key === 'references')?.value;

        // 3. Forward to Supabase
        const response = await fetch("https://joaisrcmzktcdxplilil.supabase.co/functions/v1/inbound-reply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.SUPABASE_INBOUND_SECRET}`
            },
            body: JSON.stringify({
                from: message.from,
                to: message.to,
                subject: email.subject,
                text: email.text,
                html: email.html,
                inReplyTo: inReplyTo,
                references: references
            })
        });

        if (!response.ok) {
            console.error("Failed to post to Supabase", await response.text());
        }
    }
}
