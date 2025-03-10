import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Ensure this environment variable is set in your Vite project
  dangerouslyAllowBrowser: true, // Allow API calls from the browser (use with caution)
});

// System prompt to define the AI's behavior
const systemPrompt = `You are an expert music assistant with deep knowledge of music theory, composition, and production.
You have a friendly, encouraging personality and can engage in natural conversation while providing expert musical guidance.
You can discuss both technical music concepts and engage in casual conversation.

Key traits:
- You maintain conversation context and remember personal details shared
- You can switch between casual chat and technical music discussions naturally
- You provide specific, actionable musical advice when asked
- You're encouraging and supportive of all skill levels
- You can explain complex musical concepts in simple terms when needed

When giving musical suggestions:
- Consider the user's skill level and preferences
- Provide concrete examples (e.g. specific chord progressions, scales)
- Explain the reasoning behind your suggestions
- Break down complex concepts into digestible steps

Remember:
- Stay focused on music-related topics while being conversational
- Be encouraging but honest
- Maintain a helpful and friendly tone
- Use markdown formatting for better readability
- Keep responses concise but informative`;

/**
 * Fetches a streaming response from OpenAI's chat completions API.
 * @param messages - Array of message objects with `role` and `content`.
 * @returns A ReadableStream of the AI's response.
 */
export async function getChatResponse(messages: Array<{ role: string; content: string }>) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use GPT-3.5-turbo for cost-effectiveness
      messages: [
        { role: 'system', content: systemPrompt }, // Include the system prompt
        ...messages, // Include the conversation history
      ],
      temperature: 0.7, // Balance creativity and focus
      max_tokens: 500, // Limit response length
      stream: true, // Enable streaming
    });

    // Return the streaming response
    return completion;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error; // Re-throw the error for handling in the component
  }
}