# NexusAI - Multi-Model AI Assistant

NexusAI is a powerful AI chat interface that supports both Google Gemini models and OpenAI's GPT-4o, providing a seamless way to interact with multiple AI models in one application.

![NexusAI Screenshot](./public/screenshot.png)

## Features

- Support for multiple AI models:
  - Google Gemini models (1.0 Pro, 1.5 Pro, 1.5 Flash, 2.0 Flash)
  - Image generation with Gemini 2.0
  - OpenAI's GPT-4o
- Image upload and analysis with vision-capable models
- Streaming responses for real-time interaction
- Markdown and code syntax highlighting
- Clean, modern UI with responsive design

## Setup

### Prerequisites

- Node.js (latest stable version recommended)
- Google Gemini API key
- GitHub token for GPT-4o access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nexusai.git
   cd nexusai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your API keys:
     ```
     VITE_API_KEY1=your_gemini_api_key
     VITE_GITHUB_TOKEN=your_github_token
     ```

### GitHub Token Setup for GPT-4o

To use GPT-4o in the application, you need to authenticate using a GitHub token:

1. Generate a GitHub token:
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Create a new token with appropriate permissions (User scope is sufficient)
   - Copy the generated token

2. Add the token to your `.env` file:
   ```
   VITE_GITHUB_TOKEN=your_github_token_here
   ```

3. The application will now be able to access GPT-4o through Microsoft's inference endpoint.

## Development

Run the development server:

```bash
npm run dev
```

The app will be available at http://localhost:5173/

## Building for Production

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage Guide

1. Select a model from the dropdown in the sidebar
2. For text-only queries:
   - Type your prompt in the input field and press Enter
3. For image analysis (with Gemini 1.5 or GPT-4o):
   - Upload an image using the upload button
   - Add a prompt or question about the image (optional)
   - Press Enter to send
4. For image generation (with Gemini 2.0 Image Gen):
   - Select the image generation model
   - Describe the image you want to create
   - Press Enter to generate

## Technologies Used

- React
- Vite
- Google Generative AI API
- OpenAI API
- React Markdown
- Syntax Highlighting with Prism
