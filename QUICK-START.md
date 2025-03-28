# NexusAI Quick Start Guide

This guide will help you quickly set up and run NexusAI with GPT-4o support.

## Getting Started in 5 Minutes

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/nexusai.git
cd nexusai

# Install dependencies
npm install
```

### 2. Configure API Keys

Create a `.env` file in the root directory:

```
# Google Gemini API key (required for Gemini models)
VITE_API_KEY1=your_gemini_api_key_here

# GitHub token (required for GPT-4o)
VITE_GITHUB_TOKEN=your_github_token_here
```

You can get a GitHub token from: https://github.com/settings/tokens

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173

### 4. Use the Application

1. Open the application in your browser
2. Select a model from the dropdown in the sidebar:
   - Gemini models for Google AI
   - GPT-4o for OpenAI's latest model
3. Start chatting!

## Features

- Multi-model support (Gemini and GPT-4o)
- Image upload and analysis
- Image generation (with Gemini 2.0)
- Code syntax highlighting
- Streaming responses
- Modern UI with dark mode

## Troubleshooting

- **GPT-4o not working?** Make sure your GitHub token is valid and set correctly
- **Images not uploading?** Ensure you've selected a vision-capable model (Gemini 1.5 or GPT-4o)
- **Slow responses?** Some models may take longer to respond than others

For more detailed setup instructions, see [GPT4O-SETUP.md](./GPT4O-SETUP.md). 