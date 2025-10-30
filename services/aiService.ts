import { GoogleGenAI, Type } from "@google/genai";
import { Lead, AiInsights, LeadData, ApiConfig } from '../types';

// --- Helper Functions ---

const getDmsPrompt = (simplifiedLeads: object[]): string => `
    **Persona:** You are a senior marketing analyst for a B2B SaaS company that sells a Document Management System (DMS) through Google Ads.
    **Task:** Analyze the following JSON array of leads and provide a concise summary and a list of actionable suggestions to improve our marketing and sales strategy.
    **Context for Analysis:**
    1.  **Common Themes:** Identify recurring keywords, questions, or pain points in the lead 'message' field. Are potential customers asking about pricing, on-premise solutions, specific features, security, or integrations?
    2.  **Landing Page Performance:** Analyze the 'pageUrl' field. Identify which landing pages are generating the most leads. Are there patterns in the URLs (e.g., specific campaign IDs, ad groups)?
    3.  **Lead Quality:** Consider the 'status' of leads. Correlate messages and page URLs with leads that are 'Qualified', 'Won', or 'Lost' if possible.
    **Output Format:** Provide a JSON object with a 'summary' and 'suggestions'. The suggestions should be practical and directly related to optimizing Google Ads campaigns, landing page content, or sales follow-up for a DMS product.
    **Lead Data:**
    ${JSON.stringify(simplifiedLeads, null, 2)}
`;

// --- REGEX-BASED OFFLINE PARSER ---

/**
 * Parses lead data from a raw text string using regular expressions.
 * This function works offline and does not require an API key.
 * @param text The raw text containing one or more leads.
 * @returns An array of parsed lead data objects.
 */
export const parseLeadsWithRegex = (text: string): LeadData[] => {
    const results: LeadData[] = [];
    // A robust way to separate leads in a bulk paste is by the "Name:" field, which should start every lead.
    const leadBlocks = text.split(/Name:/).slice(1);

    for (const block of leadBlocks) {
        // Re-add the "Name:" prefix that was removed by the split.
        const fullBlock = "Name:" + block;

        const name = fullBlock.match(/Name:\s*(.*)/)?.[1]?.trim() || '';
        const email = fullBlock.match(/Email:\s*(.*)/)?.[1]?.trim() || '';
        const phone = fullBlock.match(/Phone:\s*(.*)/)?.[1]?.trim() || '';
        const date = fullBlock.match(/Date:\s*(.*)/)?.[1]?.trim() || '';
        const time = fullBlock.match(/Time:\s*(.*)/)?.[1]?.trim() || '';
        const pageUrl = fullBlock.match(/Page URL:\s*(.*)/)?.[1]?.trim() || '';

        // The message is everything between "Message:" and the "---" separator line.
        const messageMatch = fullBlock.match(/Message:\s*([\s\S]*?)\n---/);
        const message = messageMatch?.[1]?.trim() || '';

        // Only add if we found at least a name or an email.
        if (name || email) {
            results.push({ name, email, phone, message, date, time, pageUrl });
        }
    }

    if (results.length === 0 && text.trim() !== '') {
        throw new Error("Could not find any valid leads. Ensure each lead starts with 'Name:'.");
    }

    return results;
};


// --- Gemini Provider ---

const getInsightsWithGemini = async (leads: Lead[], apiKey: string, model?: string): Promise<AiInsights | null> => {
    const ai = new GoogleGenAI({ apiKey });
    const simplifiedLeads = leads.map(({ message, pageUrl, status }) => ({ message, pageUrl, status }));
    const prompt = getDmsPrompt(simplifiedLeads);
    const insightsSchema = {
        type: Type.OBJECT,
        properties: { summary: { type: Type.STRING }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ['summary', 'suggestions']
    };

    const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: insightsSchema }
    });
    
    return JSON.parse(response.text) as AiInsights;
};


// --- OpenAI Provider ---

const getInsightsWithOpenAI = async (leads: Lead[], apiKey: string, model?: string): Promise<AiInsights | null> => {
    const simplifiedLeads = leads.map(({ message, pageUrl, status }) => ({ message, pageUrl, status }));
    const prompt = getDmsPrompt(simplifiedLeads);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model || "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as AiInsights;
};

// --- AI INSIGHTS SERVICE ---

export const getLeadInsights = async (leads: Lead[], config: ApiConfig): Promise<AiInsights | null> => {
    if (leads.length === 0) {
        return { summary: "No lead data to analyze.", suggestions: ["Start by adding some leads to see insights here."] };
    }
    if (!config.apiKey) {
        console.error("API Key is missing.");
        return null;
    }

    try {
        if (config.provider === 'openai') {
            return await getInsightsWithOpenAI(leads, config.apiKey, config.model);
        }
        // Default to Gemini
        return await getInsightsWithGemini(leads, config.apiKey, config.model);

    } catch (error) {
        console.error(`Error generating insights with ${config.provider}:`, error);
        return null;
    }
};