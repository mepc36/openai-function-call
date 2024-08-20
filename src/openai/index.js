const OpenAI = require('openai');

const { getDeliveryDate } = require('../util')
const { model } = require('../enum/index.js')

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const handleGptResponse = (gptResponse) => {
  const { message: { content } } = gptResponse?.choices.length && gptResponse?.choices[0]
  console.log(`"${content}"`)
}

const handleDeliveryDateToolCall = async (orderId, toolCallMessage) => {
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

const getShouldCallDeliveryDateTool = (toolCallFunctionName) => toolCallFunctionName === 'getDeliveryDate'

module.exports = {
  openAiClient,
  handleDeliveryDateToolCall,
  getShouldCallDeliveryDateTool,
  mockLlmMessages,
  getGptResponse,
}