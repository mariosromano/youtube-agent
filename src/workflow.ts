// @ts-nocheck
import { hostedMcpTool, Agent, RunContext, AgentInputItem, Runner, withTrace } from "@openai/agents";
import { z } from "zod";

// Tool definitions
const mcp = hostedMcpTool({
  serverLabel: "zapier",
  allowedTools: [
    "bumpups_send_chat",
    "youtube_find_video"
  ],
  authorization: '{"expression":"\\"NzQ3ZWM5NTktZWQxYy00NzgwLWJiOGUtYzdjOWRlYjJmZTVlOjNkOTViY2Q5LWViN2QtNDAyZi05YTY5LTU3M2NiODg0MDNiYg==\\"","format":"cel"}',
  requireApproval: "always",
  serverUrl: "https://mcp.zapier.com/api/mcp/mcp"
});

const mcp1 = hostedMcpTool({
  serverLabel: "zapier",
  allowedTools: [
    "youtube_find_video"
  ],
  authorization: '{"expression":"\\"NzQ3ZWM5NTktZWQxYy00NzgwLWJiOGUtYzdjOWRlYjJmZTVlOjNkOTViY2Q5LWViN2QtNDAyZi05YTY5LTU3M2NiODg0MDNiYg==\\"","format":"cel"}',
  requireApproval: "always",
  serverUrl: "https://mcp.zapier.com/api/mcp/mcp"
});

const YoutubeHelperSchema = z.object({ 
  url: z.string(), 
  prompt: z.string(), 
  model: z.enum(["bump-1.0"]), 
  language: z.enum(["en"]), 
  output_format: z.enum(["text"]) 
});

const YtUiSchema = z.object({ 
  title: z.string(), 
  duration: z.string(), 
  thumbnailUrl: z.string(), 
  videoUrl: z.string() 
});

const youtubeHelper = new Agent({
  name: "YouTube Helper",
  instructions: `You are a payload formatter.

User will provide a YouTube URL, and you will set it in the json schema for URL

User will ask you a question about the video and you set that to prompt`,
  model: "gpt-4.1",
  outputType: YoutubeHelperSchema,
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

interface YtBotContext {
  stateYoutubeurl: string;
  stateModel: string;
  statePrompt: string;
  stateLanguage: string;
  stateOutputFormat: string;
}

const ytBotInstructions = (runContext: RunContext<YtBotContext>, _agent: Agent<YtBotContext>) => {
  const { stateYoutubeurl, stateModel, statePrompt, stateLanguage, stateOutputFormat } = runContext.context;
  return `Here is the expected data for the bumpups_send_chat payload:

"url":"${stateYoutubeurl}",
"model":"${stateModel}",
"prompt":"${statePrompt}",
"language":"${stateLanguage}",
"output_format":"${stateOutputFormat}", 

use the mcp tool, save its response and put it in chat`;
};

const ytBot = new Agent({
  name: "yt bot",
  instructions: ytBotInstructions,
  model: "gpt-5-chat-latest",
  tools: [mcp],
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

interface YtUiContext {
  stateYoutubeurl: string;
}

const ytUiInstructions = (runContext: RunContext<YtUiContext>, _agent: Agent<YtUiContext>) => {
  const { stateYoutubeurl } = runContext.context;
  return `Find the video thumbnail url maxres, videoDuration and title using youtube_find_video tool

then place in widget

here is the YouTube video:
 ${stateYoutubeurl}`;
};

const ytUi = new Agent({
  name: "YT UI",
  instructions: ytUiInstructions,
  model: "gpt-4.1",
  tools: [mcp1],
  outputType: YtUiSchema,
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

type WorkflowInput = { input_as_text: string };

export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("YouTube link", async () => {
    const state: {
      youtubeurl: string | null;
      prompt: string | null;
      model: string | null;
      language: string | null;
      output_format: string | null;
    } = {
      youtubeurl: null,
      prompt: null,
      model: null,
      language: null,
      output_format: null
    };
    
    const conversationHistory: AgentInputItem[] = [
      { role: "user", content: [{ type: "input_text", text: workflow.input_as_text }] }
    ];
    
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_690131a2fb1c819099106c600d93de51065afd62e7ab395a"
      }
    });
    
    // Step 1: Parse the user input
    const youtubeHelperResultTemp = await runner.run(
      youtubeHelper,
      [...conversationHistory]
    );
    conversationHistory.push(...youtubeHelperResultTemp.newItems.map((item) => item.rawItem));

    if (!youtubeHelperResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const youtubeHelperResult = {
      output_text: JSON.stringify(youtubeHelperResultTemp.finalOutput),
      output_parsed: youtubeHelperResultTemp.finalOutput
    };
    
    state.youtubeurl = youtubeHelperResult.output_parsed.url;
    state.prompt = youtubeHelperResult.output_parsed.prompt;
    state.model = youtubeHelperResult.output_parsed.model;
    state.language = youtubeHelperResult.output_parsed.language;
    state.output_format = youtubeHelperResult.output_parsed.output_format;
    
    // Step 2: Send to BumpUps for analysis
    const ytBotResultTemp = await runner.run(
      ytBot,
      [...conversationHistory],
      {
        context: {
          stateYoutubeurl: state.youtubeurl!,
          stateModel: state.model!,
          statePrompt: state.prompt!,
          stateLanguage: state.language!,
          stateOutputFormat: state.output_format!
        }
      }
    );
    conversationHistory.push(...ytBotResultTemp.newItems.map((item) => item.rawItem));

    if (!ytBotResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const ytBotResult = {
      output_text: ytBotResultTemp.finalOutput ?? ""
    };
    
    // Step 3: Get video metadata for UI
    const ytUiResultTemp = await runner.run(
      ytUi,
      [...conversationHistory],
      {
        context: {
          stateYoutubeurl: state.youtubeurl!
        }
      }
    );
    conversationHistory.push(...ytUiResultTemp.newItems.map((item) => item.rawItem));

    if (!ytUiResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const ytUiResult = {
      output_text: JSON.stringify(ytUiResultTemp.finalOutput),
      output_parsed: ytUiResultTemp.finalOutput
    };
    
    // Return the combined results
    return {
      analysis: ytBotResult.output_text,
      video: ytUiResult.output_parsed
    };
  });
};
