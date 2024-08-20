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
]

const model = 'gpt-4o'

module.exports = {
  tools,
  model
}