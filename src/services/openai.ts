import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
}

export const getChatCompletion = async (
  prompt: string,
  previousMessages: ChatMessage[] = []
): Promise<string> => {
  try {
    // Your predefined API key - replace this with your actual OpenAI API key
    const apiKey = "your-openai-api-key-here"; // Replace this with your actual API key
    
    // Prepare the messages for the API
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You are an election assistant that provides accurate, factual information about the electoral process, candidates, and policies. Be concise and helpful."
      },
      ...previousMessages,
      { role: "user", content: prompt }
    ];

    // If using mock responses for testing, uncomment this
    // return getMockResponse(prompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages,
        model: "gpt-4o-mini", // Using a modern OpenAI model
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenAI API request failed");
    }

    const data: ChatCompletionResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error getting chat completion:", error);
    toast.error("Failed to get a response from the AI. Please try again.");
    
    // Return a fallback response when the API call fails
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
};

// Provides mock responses when needed for testing
const getMockResponse = (prompt: string): string => {
  const normalizedPrompt = prompt.toLowerCase();
  
  // Return the existing mock responses if we have them
  for (const question in BOT_RESPONSES) {
    if (normalizedPrompt === question.toLowerCase()) {
      return BOT_RESPONSES[question];
    }
  }
  
  // Check for partial matches
  for (const question in BOT_RESPONSES) {
    if (normalizedPrompt.includes(question.toLowerCase().split(" ")[0])) {
      return BOT_RESPONSES[question];
    }
  }
  
  return "I don't have specific information on that topic yet. I'm continuously learning to provide better answers about the election process and candidates. Feel free to try another question or check back later.";
};

// Mock responses for testing (same as the ones currently in Chatbot.tsx)
const BOT_RESPONSES: Record<string, string> = {
  "How does the electoral process work?": 
    "The electoral process involves several stages: voter registration, candidate nomination, campaigning, voting, and result declaration. Each citizen aged 18 and above can register to vote. Elections are held on scheduled dates where voters cast ballots for their preferred candidates. The votes are then counted, and winners are declared according to the electoral system in place.",
  
  "What are the main policy differences between candidates?": 
    "The main policy differences between candidates typically revolve around approaches to economy, healthcare, education, and environment. Progressive candidates generally advocate for expanded public services and stronger regulations, while conservative candidates often support smaller government and free-market solutions. Centrist candidates typically seek balanced approaches that incorporate elements from both perspectives.",
  
  "When is the next election day?": 
    "The next election is scheduled for November 5, 2024. This will be a general election for national and state offices. Polls will be open from 7:00 AM to 8:00 PM in most locations. Early voting options may be available in your area starting two weeks before election day.",
  
  "What documents do I need to vote?": 
    "To vote, you typically need a government-issued photo ID such as a driver's license, passport, or voter identification card. Requirements vary by jurisdiction, so it's best to check with your local election office. Some locations also accept utility bills, bank statements, or government checks as proof of identity and residence.",
  
  "How can I check my voter registration status?": 
    "You can check your voter registration status through your state's election website, or through national resources like vote.org. You'll need to provide basic information such as your name, date of birth, and address. If you find you're not registered, many states offer online registration options.",
  
  "What are the main environmental proposals?": 
    "The main environmental proposals from candidates include approaches to climate change, conservation, and sustainable development. Progressive candidates typically support aggressive carbon reduction targets, renewable energy investments, and stronger environmental regulations. Conservative candidates often favor market-based solutions and balancing environmental protection with economic growth. All major candidates acknowledge the importance of clean air and water protections."
};
