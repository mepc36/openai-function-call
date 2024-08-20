require('dotenv').config()
const OpenAI = require('openai');

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

;

(async () => {
  try {
    console.log('START')
    const getDeliveryDate = async () => {
      const deliveryDate = new Date().toISOString()
      return deliveryDate
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "getDeliveryDate",
          description: "Get the delivery date for a customer's order. Call this whenever you need to know the delivery date, for example when a customer asks 'Where is my package'",
          parameters: {
            type: "object",
            properties: {
              order_id: {
                type: "string",
                description: "The customer's order ID.",
              },
            },
            required: ["order_id"],
            additionalProperties: false,
          },
        }
      }
    ];

    const messages = [
      { role: "system", content: "You are a helpful customer support assistant. Use the supplied tools to assist the user." },
      { role: "user", content: "Hi, can you tell me the delivery date for my order?" }
    ];

    const response = await openAiClient.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      tools: tools,
    });

    if (response?.choices.length && response?.choices[0]?.message) {
      const { message: { content } } = response?.choices.length && response?.choices[0]
      console.log('content:', content)
    }
  } catch (error) {
    console.log('ERROR:', error)
  } finally {
    console.log('DONE')
  }
})()