#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const google_1 = require("@ai-sdk/google");
const ai_1 = require("ai");
// Create an MCP server
const server = new mcp_js_1.McpServer({
    name: "Text Summarizer",
    version: "1.0.0"
});
// Add a text summarization tool
server.tool("summarize", {
    text: zod_1.z.string().min(1),
    maxLength: zod_1.z.number().optional().default(200),
    language: zod_1.z.string().optional().default("en")
}, async ({ text, maxLength, language }) => {
    try {
        const prompt = `Please summarize the following text in ${language}, keeping the summary within ${maxLength} characters:\n\n${text}`;
        const model = google_1.google.chat("gemini-1.5-pro");
        const result = await (0, ai_1.generateText)({
            model: model,
            prompt: prompt,
            maxTokens: maxLength,
            temperature: 0.5
        });
        return {
            content: [{
                    type: "text",
                    text: result.text
                }]
        };
    }
    catch (error) {
        console.error('Summarization error:', error);
        throw new Error('Failed to generate summary');
    }
});
// Add a dynamic greeting resource
server.resource("greeting", new mcp_js_1.ResourceTemplate("greeting://{name}", { list: undefined }), async (uri, { name }) => ({
    contents: [{
            uri: uri.href,
            text: `Hello, ${name}!`
        }]
}));
// Start receiving messages on stdin and sending messages on stdout
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
