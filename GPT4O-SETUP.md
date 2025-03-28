# GPT-4o Setup Guide

This guide will walk you through the process of setting up GPT-4o integration for NexusAI using GitHub token authentication.

## Overview

GPT-4o is OpenAI's most advanced multimodal model, capable of processing both text and images with state-of-the-art performance. In this application, we've integrated GPT-4o through Microsoft's inference endpoint, which uses GitHub tokens for authentication.

## Prerequisites

Before getting started, make sure you have:

1. A GitHub account with a valid personal access token
2. Node.js installed (version 18 or newer recommended)
3. NPM or Yarn package manager

## Step 1: Generate a GitHub Personal Access Token

1. Log in to your GitHub account
2. Go to Settings > Developer settings > Personal access tokens > Fine-grained tokens (or use this direct link: https://github.com/settings/tokens?type=beta)
3. Click "Generate new token"
4. Give your token a descriptive name (e.g., "NexusAI GPT-4o Access")
5. Set an expiration date (or choose "No expiration" if you prefer)
6. Select the appropriate repository access (if you're just using this for API access, "No repository access" is sufficient)
7. Under "Account permissions", make sure to select "User" (Read-only) access
8. Click "Generate token" at the bottom of the page
9. Copy the generated token - **Important**: This is the only time you'll see this token value, so make sure to save it securely

## Step 2: Configure the Application

1. Open the `.env` file in the root of the project
2. Add or update the `VITE_GITHUB_TOKEN` environment variable with your token:
   ```
   VITE_GITHUB_TOKEN=your_github_token_here
   ```
3. Save the file

## Step 3: Install OpenAI SDK

The OpenAI JavaScript SDK is required for GPT-4o integration:

```bash
npm install openai
```

## Step 4: Test Your Setup

To verify your setup is working correctly, run one of the provided sample scripts:

### Basic Text Interaction

```bash
# In bash/zsh
export GITHUB_TOKEN="your-github-token-here"
node gpt4o-sample.js

# In PowerShell
$Env:GITHUB_TOKEN="your-github-token-here"
node gpt4o-sample.js

# In Windows Command Prompt
set GITHUB_TOKEN=your-github-token-here
node gpt4o-sample.js
```

### Image Analysis

For image analysis testing, place an image named `sample.jpg` in the project root, then:

```bash
# In bash/zsh
export GITHUB_TOKEN="your-github-token-here"
node gpt4o-image-sample.js

# In PowerShell
$Env:GITHUB_TOKEN="your-github-token-here"
node gpt4o-image-sample.js

# In Windows Command Prompt
set GITHUB_TOKEN=your-github-token-here
node gpt4o-image-sample.js
```

## Using GPT-4o in the Application

Once configured, you can use GPT-4o in the NexusAI application:

1. Start the application with `npm run dev`
2. Open the application in your browser (usually at http://localhost:5173)
3. Click on the model selector in the sidebar
4. Choose "GPT-4o" from the available models
5. Start chatting or upload an image for analysis

## Troubleshooting

If you encounter issues with GPT-4o integration:

1. **Authentication Errors**: Make sure your GitHub token is valid and correctly set in the `.env` file
2. **Token Expiration**: GitHub tokens can expire. If your token has expired, generate a new one
3. **Rate Limiting**: The GPT-4o service may have rate limits. If you encounter rate limiting, wait and try again later
4. **Network Issues**: Ensure your network allows connections to the Microsoft inference endpoint
5. **Console Errors**: Check your browser's developer console for specific error messages

## Technical Details

This integration uses the OpenAI SDK to connect to Microsoft's inference endpoint for GPT-4o. The implementation:

- Handles both text and image inputs
- Supports streaming responses for better user experience
- Maintains conversation context for multi-turn interactions
- Properly formats image data for the API

### Browser Environment Security Note

When using the OpenAI SDK in a browser environment, you must include the `dangerouslyAllowBrowser: true` flag in the client configuration:

```js
const client = new OpenAI({ 
  baseURL: endpoint, 
  apiKey: GitHubToken,
  dangerouslyAllowBrowser: true // Required for browser usage
});
```

⚠️ **Security Warning**: This flag acknowledges that you understand the risks of exposing API keys in browser environments. In production applications, consider:
- Using a backend proxy for API calls to keep tokens secure
- Implementing proper token validation and rate limiting
- Setting appropriate CORS policies

For developers looking to extend or modify this integration, refer to the implementation in `src/App.jsx` and the sample scripts. 