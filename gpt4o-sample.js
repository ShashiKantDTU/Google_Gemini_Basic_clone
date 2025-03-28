// Sample script to demonstrate GPT-4o with GitHub token authentication
import OpenAI from "openai";

// Get GitHub token from environment variable
const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

export async function main() {
  if (!token) {
    console.error("Error: GITHUB_TOKEN environment variable is not set.");
    console.log("Please set your GitHub token using:");
    console.log("  export GITHUB_TOKEN=\"<your-github-token>\" (bash)");
    console.log("  $Env:GITHUB_TOKEN=\"<your-github-token>\" (PowerShell)");
    console.log("  set GITHUB_TOKEN=<your-github-token> (Windows Command Prompt)");
    process.exit(1);
  }

  console.log("Initializing OpenAI client with GPT-4o...");
  const client = new OpenAI({ 
    baseURL: endpoint, 
    apiKey: token,
    dangerouslyAllowBrowser: true
  });

  try {
    console.log("Sending request to GPT-4o...");
    
    // Basic text example
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What can GPT-4o do that earlier models couldn't?" }
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000,
      model: modelName
    });

    console.log("\n--- GPT-4o Response ---\n");
    console.log(response.choices[0].message.content);
    console.log("\n--- End of Response ---\n");

    // Demonstrate streaming
    console.log("Demonstrating streaming with GPT-4o...");
    console.log("\n--- Streaming Response ---\n");
    
    const stream = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Give me 3 quick tips for using GPT-4o effectively." },
      ],
      model: modelName,
      stream: true,
      stream_options: { include_usage: true }
    });

    let usage = null;
    for await (const part of stream) {
      process.stdout.write(part.choices[0]?.delta?.content || '');
      if (part.usage) {
        usage = part.usage;
      }
    }
    
    console.log('\n\n--- End of Streaming Response ---\n');
    
    if (usage) {
      console.log(`Prompt tokens: ${usage.prompt_tokens}`);
      console.log(`Completion tokens: ${usage.completion_tokens}`);
      console.log(`Total tokens: ${usage.total_tokens}`);
    }
    
    console.log("\nTest completed successfully!");
  } catch (err) {
    console.error("The sample encountered an error:", err);
  }
}

// Only run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
} 