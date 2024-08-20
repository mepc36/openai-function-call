# Summary

This repo is a minimal example. It shows how to get an OpenAI LLM to call a tool/function.

## Source:

This repo is mainly the result of following the tutorial in OpenAI docs [here](https://platform.openai.com/docs/guides/function-calling/step-1-pick-a-function-in-your-codebase-that-the-model-should-be-able-to-call).

## Running the App:

1. Install dependencies:

```
yarn install
```

2. Set up your .env file:

```
cp .env.example .env
```

3. Add your OPENAI_API_KEY value to your .env file.

4. Run the script:

```
node call-openai-function.js
```

## TODO:

1. Integrate this call at a custom layer inside a Kong API Gateway (perhaps via an event hook?)