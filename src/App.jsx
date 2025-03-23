import './App.css'
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function App() {
  const Apikey1 = import.meta.env.VITE_API_KEY1
  const Apikey2 = import.meta.env.VITE_API_KEY2

  const [currentKey, setCurrentKey] = useState(Apikey1)
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("")
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const responseRef = useRef(null);
  const modelSelectorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Available models
  const availableModels = [
    { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro", description: "Fast, versatile model for text and code tasks" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Advanced model with vision support and reasoning" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Faster model with both text and vision capabilities" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Latest model with enhanced speed and capabilities" },
    { id: "gemini-2.0-flash-exp-image-generation", name: "Gemini 2.0 Image Gen", description: "Create AI-generated images from text descriptions" }
  ];

  // Get current model
  const getCurrentModel = () => {
    if (isImageGenModel()) {
      return new GoogleGenerativeAI(currentKey).getGenerativeModel({ 
        model: selectedModel,
        generationConfig: {
          responseModalities: ['Text', 'Image']
        }
      });
    }
    return new GoogleGenerativeAI(currentKey).getGenerativeModel({ model: selectedModel });
  };
  
  // Check if current model supports vision
  const isVisionModel = () => {
    return selectedModel === "gemini-1.5-pro" || selectedModel === "gemini-1.5-flash";
  };

  // Check if current model supports image generation
  const isImageGenModel = () => {
    return selectedModel === "gemini-2.0-flash-exp-image-generation";
  };

  const handleInput = (e) => {
    setSearch(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchResponse();
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  }

  const toggleModelSelector = () => {
    setModelSelectorOpen(!modelSelectorOpen);
  }

  const selectModel = (modelId) => {
    setSelectedModel(modelId);
    setModelSelectorOpen(false);
    // Reset image and conversations when changing models
    if (!isVisionModel()) {
      setSelectedImage(null);
      setImagePreview(null);
    }
    clearConversation();
  }

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // File to generative model content
  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    
    return {
      inlineData: { 
        data: await base64EncodedDataPromise,
        mimeType: file.type
      },
    };
  };

  const fetchResponse = async () => {
    if (!search.trim() && !selectedImage) {
      alert("Please enter a question or prompt, or upload an image with the vision model");
      return;
    }
    
    setLoading(true);
    const userQuery = search;
    setSearch(""); // Clear input after sending
    setSidebarOpen(false); // Close sidebar when sending message on mobile
    
    try {
      let userContent = [];
      
      // If there's an image and we're using vision model
      if (selectedImage && isVisionModel()) {
        const imagePart = await fileToGenerativePart(selectedImage);
        userContent = [
          { text: userQuery || "What's in this image?" },
          imagePart
        ];
        
        // Add user query and image to conversations
        setConversations(prev => [...prev, { 
          type: 'user', 
          content: userQuery || "What's in this image?",
          image: imagePreview 
        }]);
      } else {
        // Text-only query
        userContent = userQuery;
        
        // Add user query to conversations
        setConversations(prev => [...prev, { type: 'user', content: userQuery }]);
      }
      
      // Get appropriate model
      const model = getCurrentModel();
      
      // Handle image generation model - doesn't support streaming
      if (isImageGenModel()) {
        // Generate content
        const result = await model.generateContent(userContent);
        let textContent = "";
        let generatedImage = null;
        
        // Extract text and image from response
        for (const part of result.response.candidates[0].content.parts) {
          if (part.text) {
            textContent += part.text;
          } else if (part.inlineData) {
            generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
        
        setResponse(textContent);
        
        // Add AI response with both text and generated image
        setConversations(prev => [...prev, { 
          type: 'ai', 
          content: textContent,
          generatedImage: generatedImage 
        }]);
      } else {
        // For text-based models, use streaming
        setIsStreaming(true);
        
        // Create a placeholder for the streaming response
        const aiResponseId = Date.now();
        setConversations(prev => [...prev, { 
          type: 'ai', 
          content: '',
          id: aiResponseId,
          isStreaming: true
        }]);
        
        // Stream the content
        let streamedContent = '';
        const result = await model.generateContentStream(userContent);
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          streamedContent += chunkText;
          
          // Update the streaming response
          setConversations(prev => 
            prev.map(item => 
              item.id === aiResponseId 
                ? { ...item, content: streamedContent } 
                : item
            )
          );
        }
        
        // Update the final response
        setResponse(streamedContent);
        
        // Mark streaming as complete
        setConversations(prev => 
          prev.map(item => 
            item.id === aiResponseId 
              ? { ...item, isStreaming: false } 
              : item
          )
        );
        setIsStreaming(false);
      }
      
      // Clear image after sending if using vision model
      if (isVisionModel()) {
        removeImage();
      }
      
    } catch (error) {
      console.error("Error:", error);
      setIsStreaming(false);
      
      // Add error to conversations
      setConversations(prev => [...prev, { 
        type: 'error', 
        content: error.message || "Sorry, I encountered an error processing your request." 
      }]);
    }

    setLoading(false);
  };

  const clearConversation = () => {
    setConversations([]);
    setResponse("");
    removeImage();
  };

  useEffect(() => {
    // Scroll to the bottom of responses when new content arrives
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [conversations]);

  // Close model selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target)) {
        setModelSelectorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get current model name
  const getCurrentModelName = () => {
    const model = availableModels.find(m => m.id === selectedModel);
    return model ? model.name : selectedModel;
  };

  return (
    <div className="app-container">
      {/* Background orbs */}
      <div className="orb-1"></div>
      <div className="orb-2"></div>

      {/* SVG gradient definition for the logo */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="gradient-fill" x1="0" y1="0" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff7597" />
            <stop offset="50%" stopColor="#5ab9ea" />
            <stop offset="100%" stopColor="#9d65d0" />
          </linearGradient>
        </defs>
      </svg>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <svg viewBox="0 0 24 24" className="gemini-icon">
            <path d="M8 2L2 12L8 22L18 22L12 12L18 2z" />
          </svg>
          <h2>NexusAI</h2>
        </div>

        {/* Model Selector */}
        <div className="model-selector-container" ref={modelSelectorRef}>
          <button className="model-selector-toggle" onClick={toggleModelSelector}>
            <div className="model-info">
              <span className="current-model-label">Current Model</span>
              <span className="current-model-name">{getCurrentModelName()}</span>
            </div>
            <svg className={`chevron-icon ${modelSelectorOpen ? 'open' : ''}`} viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {modelSelectorOpen && (
            <div className="model-dropdown">
              {availableModels.map(model => (
                <div 
                  key={model.id} 
                  className={`model-option ${selectedModel === model.id ? 'active' : ''}`}
                  onClick={() => selectModel(model.id)}
                >
                  <div className="model-option-name">{model.name}</div>
                  <div className="model-option-description">{model.description}</div>
                  {selectedModel === model.id && (
                    <svg className="check-icon" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="info">
          <p>Powered by Google Gemini API</p>
          <button className="new-chat-btn" onClick={clearConversation}>
            <span>+</span> New Chat
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="mobile-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <svg viewBox="0 0 24 24" className="menu-icon">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
          <h2>NexusAI</h2>
        </div>

        <div className="chat-container" ref={responseRef}>
          {conversations.length === 0 ? (
            <div className="empty-state">
              <div className="welcome-text">
                <h1>NexusAI Assistant</h1>
                <p>Your advanced AI companion powered by Gemini. Ask anything and get intelligent responses with beautiful presentation.</p>
              </div>
              <div className="model-badge">Currently using <span>{getCurrentModelName()}</span></div>
              {isVisionModel() && (
                <div className="vision-guide">
                  <p>Gemini 1.5 models can analyze images! Upload an image below and ask questions about it.</p>
                </div>
              )}
              {isImageGenModel() && (
                <div className="image-gen-guide">
                  <p>Describe any image you want to create and Gemini will generate it for you!</p>
                </div>
              )}
              <div className="suggestion-chips">
                {isVisionModel() ? (
                  <>
                    <button onClick={() => setSearch("What can you see in this image?")}>What's in this image?</button>
                    <button onClick={() => setSearch("Describe this image in detail")}>Describe in detail</button>
                    <button onClick={() => setSearch("What objects are present in this image?")}>Identify objects</button>
                    <button onClick={() => setSearch("Is there anything unusual in this image?")}>Find unusual elements</button>
                  </>
                ) : isImageGenModel() ? (
                  <>
                    <button onClick={() => setSearch("Create a 3D rendered image of a cute robot cat in a futuristic city")}>Robot cat</button>
                    <button onClick={() => setSearch("Generate an image of a peaceful mountain landscape at sunset")}>Mountain sunset</button>
                    <button onClick={() => setSearch("Create a fantasy image of a floating island with waterfalls")}>Floating island</button>
                    <button onClick={() => setSearch("Generate a photorealistic image of a cozy coffee shop interior")}>Cozy coffee shop</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setSearch("Explain quantum computing")}>Explain quantum computing</button>
                    <button onClick={() => setSearch("Write a short story about space travel")}>Write a short story</button>
                    <button onClick={() => setSearch("How to learn React in 2024?")}>Learn React in 2024</button>
                    <button onClick={() => setSearch("Create a workout plan for beginners")}>Workout plan</button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="conversations">
              {conversations.map((item, index) => (
                <div key={index} className={`conversation-item ${item.type}`}>
                  <div className="avatar">
                    {item.type === 'user' ? '👤' : item.type === 'ai' ? '🤖' : '⚠️'}
                  </div>
                  <div className="content">
                    {item.image && (
                      <div className="image-preview-container">
                        <img src={item.image} alt="User uploaded" className="conversation-image" />
                      </div>
                    )}
                    {item.type === 'ai' ? (
                      <>
                        <ReactMarkdown
                          children={item.content}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || "");
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        />
                        {item.isStreaming && (
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        )}
                        {item.generatedImage && (
                          <div className="generated-image-container">
                            <img src={item.generatedImage} alt="AI generated" className="generated-image" />
                            <a 
                              href={item.generatedImage} 
                              download="gemini-generated-image.png" 
                              className="download-image-btn"
                              title="Download Image"
                            >
                              <svg viewBox="0 0 24 24">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                              </svg>
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <p>{item.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-container">
          {isVisionModel() && (
            <div className="image-upload-container">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="file-input" 
              />
              
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button className="remove-image-btn" onClick={removeImage}>
                    <svg viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <button className="upload-image-btn" onClick={triggerFileInput}>
                  <svg viewBox="0 0 24 24">
                    <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8h-5zM5 19l3-4 2 3 3-4 4 5H5z"/>
                  </svg>
                  <span>Add Image</span>
                </button>
              )}
            </div>
          )}
          
          <div className="input-wrapper">
            <input 
              type="text" 
              value={search} 
              onChange={handleInput} 
              onKeyDown={handleKeyDown}
              placeholder={isVisionModel() && imagePreview ? "Ask about this image..." : "Ask me anything..."}
              disabled={loading || isStreaming}
            />
            <button 
              className="send-button"
              onClick={fetchResponse} 
              disabled={loading || isStreaming || (!search.trim() && !imagePreview)}
            >
              {loading ? (
                <div className="loader"></div>
              ) : isStreaming ? (
                <div className="streaming-indicator"></div>
              ) : (
                <svg viewBox="0 0 24 24" className="send-icon">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="disclaimer">Powered by Google Gemini. Responses may not always be accurate or complete.</p>
        </div>
      </div>
    </div>
  );
}

export default App
