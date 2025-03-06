---
title: Execute AI Generated Code
description: Use QuickJS to run ai generated code in a sandbox fast and secure
image: /use-case-ai.jpg
order: 10
---

# Executing AI-Generated Code

With the rise of **AI-generated code**, we’re entering an exciting new era of automation, dynamic programming, and just-in-time execution.  

However, executing AI-generated code in real-time comes with significant challenges:  

✅ The execution environment should be **isolated and secure**.  
✅ The environment should be **instantly available**—no delays.  
✅ The generated code might be **faulty or incomplete**.  
✅ The execution should prevent **potentially dangerous operations**.  

A **virtual execution environment** is the best solution, allowing **sandboxed execution** while ensuring **safety and performance**.  

## 🏗️ Choosing the Right Execution Environment  

There are several options to execute AI-generated code, each with **trade-offs**:  

| Environment | Pros | Cons |
|------------|------|------|
| **Docker Containers** | Fully isolated, supports all Node.js features | Slow cold start, heavy setup |
| **VM-based Sandboxes** | Strong security, full feature set | High resource usage |
| **QuickJS (WebAssembly)** | Fast, lightweight, runs anywhere | Limited feature set, dependency handling |

### 🔥 Why QuickJS?

A **WebAssembly-based QuickJS runtime** provides an **ultra-lightweight**, **cross-platform** environment that can run **in the backend or frontend**.  

✅ **Low overhead**—No need to start a full Node.js process.  
✅ **Instant availability**—Cold starts are **extremely fast**.  
✅ **Built-in security**—Restricts execution, preventing unwanted operations.  

🔹 **Drawback:** It does not offer full **Node.js API compatibility**. However, for many AI-generated scripts, it’s **more than enough**.  

## 🤖 Example: Running AI-Generated Code  

Let’s walk through a **real-world example** where an **LLM generates JavaScript code**, which we **immediately execute** in a sandboxed environment.

### 📝 Step 1: The AI Prompt  

The **prompt** should clearly specify:  
✅ The expected function structure  
✅ Constraints (e.g., **ESM syntax**, **no external packages**)  
✅ Rules for **safe execution**  

#### 📌 **LLM Prompt Example**  

```md
Your task is to implement a function in JavaScript for the user's instruction.

<instruction>
%INSTRUCTION%
</instruction>

Implementation details:
- You are in a Node.js environment.
- Use ESM syntax with `import` statements.
- Use **only** native Node.js packages.
- Never use external dependencies.
- The generated code must return the result using `export default`.
- If the function is `async`, use `await` before returning the result.
- You **can** use the native `fetch` function.

Example:
\`\`\`ts
async function myFunction() {
  const res = await fetch('https://example.com');
  if (!res.ok) {
    throw new Error('Failed to fetch example.com');
  }
  return res.json();
}

export default await myFunction();
\`\`\`

Return only the JavaScript code **as plain text**—no explanations or additional formatting.
```

### 🎯 Example AI Response  

Using **Qwen Coder 2.5 7B** (running locally with **Ollama**), we generate a function based on the instruction:  

💡 **User request:** _"Get the `<title>` tag from `https://purista.dev`."_  

#### 📝 Generated Code

```js
async function getTitleTag() {
  const res = await fetch('https://purista.dev');
  if (!res.ok) {
    throw new Error('Failed to fetch purista.dev');
  }
  const html = await res.text();
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1];
  } else {
    throw new Error('Title tag not found');
  }
}

export default await getTitleTag();
```

## ⚡ Step 2: Executing the AI-Generated Code  

Once we have the generated function, we need to **execute it safely**.  

### 🔹 Using QuickJS for Sandboxed Execution  

```ts
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const code = '...' // The AI-generated JavaScript code

const { runSandboxed } = await loadQuickJs()

const options: SandboxOptions = {
  allowFetch: true, // Enable network requests
}

const result = await runSandboxed(async ({ evalCode }) => {
  const evalResult = await evalCode(code)

  console.log('evalCode result', evalResult)
  return evalResult
})
```

✅ **AI-generated code now runs securely inside QuickJS**  
✅ **The AI-generated function can fetch data, process input, and return output**  

## 🔄 Step 3: Automating the Full Workflow  

A **complete AI-powered execution pipeline** involves:  

1️⃣ **User provides an instruction**  
2️⃣ **AI generates JavaScript code**  
3️⃣ **Code runs inside the QuickJS sandbox**  
4️⃣ **The system validates & returns the output**  

Here’s how it looks in practice:  

```ts
async function executeAIInstruction(instruction: string) {
  // 1️⃣ Generate AI code
  const generatedCode = await generateAIJavaScript(instruction)

  // 2️⃣ Set up sandbox execution
  const { runSandboxed } = await loadQuickJs()
  const options: SandboxOptions = { allowFetch: true }

  // 3️⃣ Execute generated code
  return await runSandboxed(async ({ evalCode }) => evalCode(generatedCode))
}

// Example Usage:
const result = await executeAIInstruction("Get the <title> tag from https://purista.dev")
console.log(result)
```

## 🔍 Observations & Improvements  

### ⚠️ Handling Errors in AI-Generated Code  

🛑 **Problem:** AI-generated code is **not always perfect**—execution might fail.  
✅ **Solution:** Implement **retry mechanisms** and **error analysis** to improve robustness.  

### 🛠️ **Handling Formatting Issues**  

LLMs might return **unexpected formatting** (e.g., extra Markdown backticks).  
🔹 **Solution:** Use a regex to clean up AI responses before execution.  

```ts
const cleanCode = rawOutput.replace(/```(js|ts)?/g, '').trim()
```

### 🔄 **Adding Code Validation**  

Before execution, we can **pre-validate** the AI-generated code:  

✅ **Check for dangerous operations (e.g., `process`, `require`, `fs`)**  
✅ **Enforce a maximum execution time**  
✅ **Restrict available APIs**  

### 📌 Full AI Workflow with QuickJS  

<<< @../../example/ai/index.ts

## 🎯 Key Takeaways  

✅ **QuickJS allows fast & secure execution** of AI-generated code.  
✅ **Sandboxing prevents security risks**, ensuring that untrusted code can’t harm the host system.  
✅ **Combining AI generation with a WebAssembly runtime** enables **dynamic, real-time execution**.  
✅ **Proper error handling & validation** can significantly improve reliability.  

🚀 This approach is ideal for **automated workflows**, **intelligent assistants**, and **AI-powered automation**.  

## 🔗 Next Steps  

✅ **Try it out!** Experiment with QuickJS in your own project.  
✅ **Enhance security** by restricting certain functions and adding execution limits.  
✅ **Improve reliability** with retry mechanisms and error correction.  

QuickJS **opens the door** to **safe, efficient, AI-driven code execution** — without the complexity of full-fledged containerized environments. 🎯  
