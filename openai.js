import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
dotenv.config();
const configuration = new Configuration({
    organization: "org-CfhyXw8u9HJSO3vrp7fVv5Pj",
    apiKey: process.env.OPENAI_API_KEY,
});
const MyOpenAIApi = new OpenAIApi(configuration);
export default MyOpenAIApi;