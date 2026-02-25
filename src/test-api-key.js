import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("Error: ANTHROPIC_API_KEY environment variable is not set.");
  console.error("Usage: ANTHROPIC_API_KEY=sk-ant-... npm run test-api-key");
  process.exit(1);
}

console.log("Testing Claude API key...");
console.log(`Key prefix: ${apiKey.substring(0, 12)}...`);
console.log("");

const client = new Anthropic({ apiKey });

// Try multiple models to find one that works
const MODELS_TO_TRY = [
  "claude-sonnet-4-5-20250514",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-20240620",
  "claude-3-haiku-20240307",
  "claude-3-5-haiku-20241022",
  "claude-3-opus-20240229",
];

let workingModel = null;

console.log("[Test 0] Finding available model...");
for (const model of MODELS_TO_TRY) {
  try {
    process.stdout.write(`  Trying ${model}... `);
    await client.messages.create({
      model,
      max_tokens: 10,
      messages: [{ role: "user", content: "Hi" }],
    });
    console.log("OK");
    workingModel = model;
    break;
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      console.error("\n\nAuthentication failed - your API key is invalid or expired.");
      console.error("Please check your key at: https://console.anthropic.com/settings/keys");
      process.exit(1);
    }
    console.log(`not available (${e.status || "error"})`);
  }
}

if (!workingModel) {
  console.error("No available model found. Your API key may have restricted access.");
  process.exit(1);
}

console.log(`  Using model: ${workingModel}`);
console.log("");

try {
  // Test 1: Basic API call
  console.log(`[Test 1] Basic API call (${workingModel})...`);
  const response = await client.messages.create({
    model: workingModel,
    max_tokens: 100,
    messages: [{ role: "user", content: "Reply with exactly: API_KEY_VALID" }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  if (text.includes("API_KEY_VALID")) {
    console.log("  PASS - API key is valid and working");
  } else {
    console.log(`  PASS - API responded (unexpected format): ${text.substring(0, 80)}`);
  }
  console.log(`  Model: ${response.model}`);
  console.log(`  Usage: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`);
  console.log("");

  // Test 2: Streaming test
  console.log("[Test 2] Streaming API call...");
  let streamedText = "";
  const stream = client.messages.stream({
    model: workingModel,
    max_tokens: 100,
    messages: [{ role: "user", content: "Say hello in one sentence." }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      streamedText += event.delta.text;
    }
  }
  console.log(`  PASS - Streaming works: "${streamedText.substring(0, 100)}"`);
  console.log("");

  // Test 3: System prompt test (for diagram generator use case)
  console.log("[Test 3] System prompt with AWS architecture context...");
  const archResponse = await client.messages.create({
    model: workingModel,
    max_tokens: 200,
    system: "You are an AWS Solutions Architect. Reply in JSON format with a list of AWS services.",
    messages: [
      {
        role: "user",
        content: "List 3 core AWS services for a basic web application. Return JSON only: {\"services\": [...]}",
      },
    ],
  });

  const archText = archResponse.content[0].type === "text" ? archResponse.content[0].text : "";
  console.log(`  PASS - System prompt works`);
  console.log(`  Response: ${archText.substring(0, 200)}`);
  console.log("");

  // Summary
  console.log("=".repeat(50));
  console.log("All tests passed! Your API key is working correctly.");
  console.log("You are ready to build the AWS Diagram Generator.");
  console.log("=".repeat(50));
} catch (error) {
  console.error("");
  console.error("TEST FAILED");
  console.error("=".repeat(50));

  if (error instanceof Anthropic.AuthenticationError) {
    console.error("Authentication failed - your API key is invalid or expired.");
    console.error("Please check your key at: https://console.anthropic.com/settings/keys");
  } else if (error instanceof Anthropic.PermissionDeniedError) {
    console.error("Permission denied - your API key does not have access to this model.");
  } else if (error instanceof Anthropic.RateLimitError) {
    console.error("Rate limited - too many requests. The key is valid but you've hit the rate limit.");
  } else if (error instanceof Anthropic.BadRequestError) {
    console.error("Bad request - there may be an issue with the request format.");
    console.error(`Details: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error.message}`);
  }
  process.exit(1);
}
