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

  ;

(async () => {
  try {
    console.log('------ START')

    const messages = mockLlmMessages()
    const toolCallResponse = await getGptResponse('gpt-4o', messages, tools)

    const toolCallMessage = toolCallResponse.choices[0].message
    const toolCall = toolCallMessage.tool_calls[0];

    // NOTE: The presence of this .arguments property is what indicates that the model has generated a function call
    // source: https://platform.openai.com/docs/guides/function-calling/if-the-model-generated-a-function-call
    const toolArguments = JSON.parse(toolCall.function.arguments);
    const { order_id } = toolArguments;

    if (toolCall.function.name === 'getDeliveryDate') {
      const delivery_date = getDeliveryDate(order_id);
      const { id: tool_call_id } = toolCallMessage.tool_calls[0]

      const toolCallResult = {
        role: "tool",
        content: JSON.stringify({
          order_id,
          delivery_date
        }),
        tool_call_id
      };

      const deliveryDateResponse = await getGptResponse('gpt-4o', [...messages, toolCallMessage, toolCallResult])
      handleGptResponse(deliveryDateResponse)
    } else {
      throw new Error(`Model requested to call an unrecognized tool`)
    }
  } catch (error) {
    console.log('------ ERROR:', error)
  } finally {
    console.log('------ DONE')
  }
})()