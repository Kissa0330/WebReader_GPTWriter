import MyOpenAIApi from "./openai.js";

const response = await MyOpenAIApi.createChatCompletion({model: "gpt-3.5-turbo", messages: [{role:"user", content: "Hello, I'm a human."}]});
console.log(response.data.choices[0].message.content);