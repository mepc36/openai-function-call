require('dotenv').config()

const {
  mockLlmMessages,
  getGptResponse,
  handleDeliveryDateToolCall,
  getShouldCallDeliveryDateTool
} = require('./src/openai/index.js')

const {
  tools,
  model,
} = require('./src/enum/index.js')

  ;

(async () => {
  try {
    console.log('------ START')

    const messages = mockLlmMessages()
    const toolCallResponse = await getGptResponse(model, messages, tools)
    const toolCallMessage = toolCallResponse.choices[0].message
    const toolCall = toolCallResponse.choices[0].message.tool_calls[0];
    const shouldCallDeliveryDateTool = getShouldCallDeliveryDateTool(toolCall.function.name)

    if (shouldCallDeliveryDateTool) {
      console.log('GPT has requested to call getDeliveryDate() tool...')
      // NOTE: The presence of this .arguments property is what indicates that the model has generated a function call:
      // source: https://platform.openai.com/docs/guides/function-calling/if-the-model-generated-a-function-call
      const toolArguments = JSON.parse(toolCall.function.arguments);
      await handleDeliveryDateToolCall(toolArguments.order_id, toolCallMessage)
    } else {
      throw new Error(`Model did not request to call tool`)
    }
  } catch (error) {
    console.log('------ ERROR:', error)
  } finally {
    console.log('------ DONE')
  }
})();