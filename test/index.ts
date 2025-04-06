import { OpenAI } from "openai";
import { functionTools } from "./tools";
import { webSearchTool } from "./functions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ToolCall {
  arguments: string;
  call_id: string;
  name: string;
  type: string;
}

const resolveAction = async (message: string) => {
  try {

    const input = [
        {
            role: "user",
            content: message
        }
    ];

    const response = await openai.responses.create({
      model: "gpt-4",
      input,
      tools: functionTools,
    });

    // console.log(response);

    const toolCall = response.output[0] as ToolCall;
    const nameFunction = toolCall.name;
    const args = JSON.parse(toolCall.arguments);
    console.log("nameFunction", nameFunction);
    console.log("args", args);

    if (nameFunction === "web_search") {
        const result = await webSearchTool(args.query);
        console.log("result", result);
        input.push(toolCall); // append model's function call message
        input.push({                               // append result message
            type: "function_call_output",
            call_id: toolCall.call_id,
            output: result.toString()
        });

        const response2 = await openai.responses.create({
            model: "gpt-4",
            input,
            tools: functionTools,
            stream: true,
            store: true,
        });
        for await (const event of response2) {
          console.log(event)
        }
    }

  } catch (error) {
    console.error('Error executing action:', error)
  }
}

// Example usage
resolveAction("search about bitcoin");