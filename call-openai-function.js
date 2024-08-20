require('dotenv').config()
const OpenAI = require('openai');

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const getDeliveryDate = () => {
  console.log('Calling getDeliveryDate() tool...')
  const deliveryDate = getRandomDate(new Date(2012, 0, 1), new Date())
  return deliveryDate
}

const model = 'gpt-4o'

const mockLlmMessages = () => {
  const llmPersona = "You are a helpful customer support assistant. Use the supplied tools to assist the user."
  const deliveryDateRequest = "Hi, can you tell me the delivery date for my order?"
  const orderIdRequest = "Hi there! I can help with that. Can you please provide your order ID?"
  const messageWithOrderId = "i think it is order_12345"

  const mockedMessages = [
    { role: "system", content: llmPersona },
    { role: "user", content: deliveryDateRequest },
    { role: "assistant", content: orderIdRequest },
    { role: "user", content: messageWithOrderId },
  ];

  return mockedMessages
}

const getGptResponse = async (model = 'gpt-4o', messages = [], tools = null) => {
  const gptResponse = await openAiClient.chat.completions.create({
    model,
    messages,
    tools,
  });

  return gptResponse
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

const handleGptResponse = (gptResponse) => {
  if (gptResponse?.choices.length && gptResponse?.choices[0]?.message?.content) {
    const { message: { content } } = gptResponse?.choices.length && gptResponse?.choices[0]
    console.log(`Bot response:\n${content}`)
  } else {
    throw new Error(`No response found`)
  }
}

const handleToolCall = async (orderId, toolCallMessage) => {
  const delivery_date = getDeliveryDate(orderId);
  const { id: tool_call_id } = toolCallMessage.tool_calls[0]

  const toolCallResult = {
    role: "tool",
    content: JSON.stringify({
      orderId,
      delivery_date
    }),
    tool_call_id
  };

  const messages = mockLlmMessages()
  const deliveryDateResponse = await getGptResponse(model, [...messages, toolCallMessage, toolCallResult])
  handleGptResponse(deliveryDateResponse)
}

const getShouldCallDeliveryDateTool = (toolCall) => {
  // NOTE: The presence of this .arguments property is what indicates that the model has generated a function call
  // source: https://platform.openai.com/docs/guides/function-calling/if-the-model-generated-a-function-call
  return toolCall.function.name === 'getDeliveryDate'
}

  ;

(async () => {
  try {
    console.log('------ START')

    const messages = mockLlmMessages()
    const toolCallResponse = await getGptResponse(model, messages, tools)
    const toolCallMessage = toolCallResponse.choices[0].message
    const toolCall = toolCallMessage.tool_calls[0];
    const shouldCallDeliveryDateTool = getShouldCallDeliveryDateTool(toolCall)

    if (shouldCallDeliveryDateTool) {
      console.log('GPT has requested to call getDeliveryDate() tool...')
      const toolArguments = JSON.parse(toolCall.function.arguments);
      const { order_id } = toolArguments;
      await handleToolCall(order_id, toolCallMessage)
    } else {
      // TODO: handle edge cases -- https://platform.openai.com/docs/guides/function-calling/edge-cases
      throw new Error(`Model did not request to call tool`)
    }
  } catch (error) {
    console.log('------ ERROR:', error)
  } finally {
    console.log('------ DONE')
  }
})();