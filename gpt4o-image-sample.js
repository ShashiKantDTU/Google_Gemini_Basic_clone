// Sample script to demonstrate GPT-4o with image analysis
import OpenAI from "openai";
import { readFileSync } from "node:fs";

// Get GitHub token from environment variable
const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

// Path to test image - update this with your image path
const sampleImagePath = "sample.jpg";

/**
 * Convert an image file to a data URL
 * @param {string} imageFile - Path to the image file
 * @param {string} imageFormat - Format of the image (jpg, png, etc.)
 * @returns {string} - Data URL representation of the image
 */
function getImageDataUrl(imageFile, imageFormat) {
  try {
    const imageBuffer = readFileSync(imageFile);
    const imageBase64 = imageBuffer.toString('base64');
    return `data:image/${imageFormat};base64,${imageBase64}`;
  } catch (error) {
    console.error(`Error reading image file: ${imageFile}`);
    console.error(error);
    process.exit(1);
  }
}

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
    console.log(`Analyzing image: ${sampleImagePath}`);
    
    // Get image data URL
    const imageExtension = sampleImagePath.split('.').pop();
    const imageUrl = getImageDataUrl(sampleImagePath, imageExtension);
    
    // Send request with image
    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that specializes in image analysis. Provide detailed descriptions of any images shared with you." 
        },
        { 
          role: "user", 
          content: [
            { type: "text", text: "What can you tell me about this image?" },
            { type: "image_url", image_url: { url: imageUrl }}
          ]
        }
      ],
      model: modelName,
      max_tokens: 1000
    });

    console.log("\n--- GPT-4o Image Analysis ---\n");
    console.log(response.choices[0].message.content);
    console.log("\n--- End of Analysis ---\n");
    
    // Ask a follow-up question about the image
    console.log("Asking a follow-up question about the image...");
    
    const followUpResponse = await client.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that specializes in image analysis. Provide detailed descriptions of any images shared with you." 
        },
        { 
          role: "user", 
          content: [
            { type: "text", text: "What can you tell me about this image?" },
            { type: "image_url", image_url: { url: imageUrl }}
          ]
        },
        {
          role: "assistant",
          content: response.choices[0].message.content
        },
        {
          role: "user",
          content: "Are there any interesting details in this image that might not be obvious at first glance?"
        }
      ],
      model: modelName,
      max_tokens: 1000
    });
    
    console.log("\n--- Follow-up Analysis ---\n");
    console.log(followUpResponse.choices[0].message.content);
    console.log("\n--- End of Follow-up Analysis ---\n");
    
    console.log("\nImage analysis completed successfully!");
  } catch (err) {
    console.error("The sample encountered an error:", err);
    if (err.message.includes("sample.jpg")) {
      console.log("\nNote: This script requires a file named 'sample.jpg' in the current directory.");
      console.log("Please add an image file or update the sampleImagePath variable to point to your image.");
    }
  }
}

// Only run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
} 