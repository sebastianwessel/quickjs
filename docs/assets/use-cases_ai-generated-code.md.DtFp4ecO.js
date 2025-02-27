import{_ as i,c as a,o as n,ag as t}from"./chunks/framework.DDIS5Pnb.js";const g=JSON.parse('{"title":"Execute AI Generated Code","description":"Use QuickJS to run ai generated code in a sandbox fast and secure","frontmatter":{"title":"Execute AI Generated Code","description":"Use QuickJS to run ai generated code in a sandbox fast and secure","image":"/use-case-ai.jpg","order":10},"headers":[],"relativePath":"use-cases/ai-generated-code.md","filePath":"use-cases/ai-generated-code.md","lastUpdated":1740591147000}'),e={name:"use-cases/ai-generated-code.md"};function h(l,s,p,r,k,o){return n(),a("div",null,s[0]||(s[0]=[t(`<h1 id="executing-ai-generated-code" tabindex="-1">Executing AI-Generated Code <a class="header-anchor" href="#executing-ai-generated-code" aria-label="Permalink to &quot;Executing AI-Generated Code&quot;">​</a></h1><p>With the rise of <strong>AI-generated code</strong>, we’re entering an exciting new era of automation, dynamic programming, and just-in-time execution.</p><p>However, executing AI-generated code in real-time comes with significant challenges:</p><p>✅ The execution environment should be <strong>isolated and secure</strong>.<br> ✅ The environment should be <strong>instantly available</strong>—no delays.<br> ✅ The generated code might be <strong>faulty or incomplete</strong>.<br> ✅ The execution should prevent <strong>potentially dangerous operations</strong>.</p><p>A <strong>virtual execution environment</strong> is the best solution, allowing <strong>sandboxed execution</strong> while ensuring <strong>safety and performance</strong>.</p><h2 id="🏗️-choosing-the-right-execution-environment" tabindex="-1">🏗️ Choosing the Right Execution Environment <a class="header-anchor" href="#🏗️-choosing-the-right-execution-environment" aria-label="Permalink to &quot;🏗️ Choosing the Right Execution Environment&quot;">​</a></h2><p>There are several options to execute AI-generated code, each with <strong>trade-offs</strong>:</p><table tabindex="0"><thead><tr><th>Environment</th><th>Pros</th><th>Cons</th></tr></thead><tbody><tr><td><strong>Docker Containers</strong></td><td>Fully isolated, supports all Node.js features</td><td>Slow cold start, heavy setup</td></tr><tr><td><strong>VM-based Sandboxes</strong></td><td>Strong security, full feature set</td><td>High resource usage</td></tr><tr><td><strong>QuickJS (WebAssembly)</strong></td><td>Fast, lightweight, runs anywhere</td><td>Limited feature set, dependency handling</td></tr></tbody></table><h3 id="🔥-why-quickjs" tabindex="-1">🔥 Why QuickJS? <a class="header-anchor" href="#🔥-why-quickjs" aria-label="Permalink to &quot;🔥 Why QuickJS?&quot;">​</a></h3><p>A <strong>WebAssembly-based QuickJS runtime</strong> provides an <strong>ultra-lightweight</strong>, <strong>cross-platform</strong> environment that can run <strong>in the backend or frontend</strong>.</p><p>✅ <strong>Low overhead</strong>—No need to start a full Node.js process.<br> ✅ <strong>Instant availability</strong>—Cold starts are <strong>extremely fast</strong>.<br> ✅ <strong>Built-in security</strong>—Restricts execution, preventing unwanted operations.</p><p>🔹 <strong>Drawback:</strong> It does not offer full <strong>Node.js API compatibility</strong>. However, for many AI-generated scripts, it’s <strong>more than enough</strong>.</p><h2 id="🤖-example-running-ai-generated-code" tabindex="-1">🤖 Example: Running AI-Generated Code <a class="header-anchor" href="#🤖-example-running-ai-generated-code" aria-label="Permalink to &quot;🤖 Example: Running AI-Generated Code&quot;">​</a></h2><p>Let’s walk through a <strong>real-world example</strong> where an <strong>LLM generates JavaScript code</strong>, which we <strong>immediately execute</strong> in a sandboxed environment.</p><h3 id="📝-step-1-the-ai-prompt" tabindex="-1">📝 Step 1: The AI Prompt <a class="header-anchor" href="#📝-step-1-the-ai-prompt" aria-label="Permalink to &quot;📝 Step 1: The AI Prompt&quot;">​</a></h3><p>The <strong>prompt</strong> should clearly specify:<br> ✅ The expected function structure<br> ✅ Constraints (e.g., <strong>ESM syntax</strong>, <strong>no external packages</strong>)<br> ✅ Rules for <strong>safe execution</strong></p><h4 id="📌-llm-prompt-example" tabindex="-1">📌 <strong>LLM Prompt Example</strong> <a class="header-anchor" href="#📌-llm-prompt-example" aria-label="Permalink to &quot;📌 **LLM Prompt Example**&quot;">​</a></h4><div class="language-md vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">md</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Your task is to implement a function in JavaScript for the user&#39;s instruction.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;instruction&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">%INSTRUCTION%</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/instruction&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Implementation details:</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> You are in a Node.js environment.</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Use ESM syntax with </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\`import\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> statements.</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Use </span><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**only**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> native Node.js packages.</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Never use external dependencies.</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> The generated code must return the result using </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\`export default\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> If the function is </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\`async\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, use </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\`await\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> before returning the result.</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> You </span><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**can**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> use the native </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\`fetch\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> function.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Example:</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\\`\\\`\\\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ts</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">async function myFunction() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  const res = await fetch(&#39;https://example.com&#39;);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  if (!res.ok) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    throw new Error(&#39;Failed to fetch example.com&#39;);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  return res.json();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">export default await myFunction();</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\\`\\\`\\\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Return only the JavaScript code </span><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**as plain text**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">—no explanations or additional formatting.</span></span></code></pre></div><h3 id="🎯-example-ai-response" tabindex="-1">🎯 Example AI Response <a class="header-anchor" href="#🎯-example-ai-response" aria-label="Permalink to &quot;🎯 Example AI Response&quot;">​</a></h3><p>Using <strong>Qwen Coder 2.5 7B</strong> (running locally with <strong>Ollama</strong>), we generate a function based on the instruction:</p><p>💡 <strong>User request:</strong> <em>&quot;Get the <code>&lt;title&gt;</code> tag from <code>https://purista.dev</code>.&quot;</em></p><h4 id="📝-generated-code" tabindex="-1">📝 Generated Code <a class="header-anchor" href="#📝-generated-code" aria-label="Permalink to &quot;📝 Generated Code&quot;">​</a></h4><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getTitleTag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> res</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://purista.dev&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">res.ok) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Failed to fetch purista.dev&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> html</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> res.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> titleMatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> html.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">match</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">&lt;title&gt;(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*?</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">)&lt;</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold;">\\/</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">title&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">i</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (titleMatch </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> titleMatch[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> titleMatch[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Title tag not found&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> default</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getTitleTag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h2 id="⚡-step-2-executing-the-ai-generated-code" tabindex="-1">⚡ Step 2: Executing the AI-Generated Code <a class="header-anchor" href="#⚡-step-2-executing-the-ai-generated-code" aria-label="Permalink to &quot;⚡ Step 2: Executing the AI-Generated Code&quot;">​</a></h2><p>Once we have the generated function, we need to <strong>execute it safely</strong>.</p><h3 id="🔹-using-quickjs-for-sandboxed-execution" tabindex="-1">🔹 Using QuickJS for Sandboxed Execution <a class="header-anchor" href="#🔹-using-quickjs-for-sandboxed-execution" aria-label="Permalink to &quot;🔹 Using QuickJS for Sandboxed Execution&quot;">​</a></h3><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SandboxOptions, loadQuickJs } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@sebastianwessel/quickjs&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> code</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;...&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // The AI-generated JavaScript code</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadQuickJs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SandboxOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  allowFetch: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Enable network requests</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> evalResult</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(code, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;evalCode result&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, evalResult)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> evalResult</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>✅ <strong>AI-generated code now runs securely inside QuickJS</strong><br> ✅ <strong>The AI-generated function can fetch data, process input, and return output</strong></p><h2 id="🔄-step-3-automating-the-full-workflow" tabindex="-1">🔄 Step 3: Automating the Full Workflow <a class="header-anchor" href="#🔄-step-3-automating-the-full-workflow" aria-label="Permalink to &quot;🔄 Step 3: Automating the Full Workflow&quot;">​</a></h2><p>A <strong>complete AI-powered execution pipeline</strong> involves:</p><p>1️⃣ <strong>User provides an instruction</strong><br> 2️⃣ <strong>AI generates JavaScript code</strong><br> 3️⃣ <strong>Code runs inside the QuickJS sandbox</strong><br> 4️⃣ <strong>The system validates &amp; returns the output</strong></p><p>Here’s how it looks in practice:</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> executeAIInstruction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">instruction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 1️⃣ Generate AI code</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> generatedCode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> generateAIJavaScript</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(instruction)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 2️⃣ Set up sandbox execution</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadQuickJs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SandboxOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { allowFetch: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 3️⃣ Execute generated code</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(generatedCode, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Example Usage:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> executeAIInstruction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Get the &lt;title&gt; tag from https://purista.dev&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(result)</span></span></code></pre></div><h2 id="🔍-observations-improvements" tabindex="-1">🔍 Observations &amp; Improvements <a class="header-anchor" href="#🔍-observations-improvements" aria-label="Permalink to &quot;🔍 Observations &amp; Improvements&quot;">​</a></h2><h3 id="⚠️-handling-errors-in-ai-generated-code" tabindex="-1">⚠️ Handling Errors in AI-Generated Code <a class="header-anchor" href="#⚠️-handling-errors-in-ai-generated-code" aria-label="Permalink to &quot;⚠️ Handling Errors in AI-Generated Code&quot;">​</a></h3><p>🛑 <strong>Problem:</strong> AI-generated code is <strong>not always perfect</strong>—execution might fail.<br> ✅ <strong>Solution:</strong> Implement <strong>retry mechanisms</strong> and <strong>error analysis</strong> to improve robustness.</p><h3 id="🛠️-handling-formatting-issues" tabindex="-1">🛠️ <strong>Handling Formatting Issues</strong> <a class="header-anchor" href="#🛠️-handling-formatting-issues" aria-label="Permalink to &quot;🛠️ **Handling Formatting Issues**&quot;">​</a></h3><p>LLMs might return <strong>unexpected formatting</strong> (e.g., extra Markdown backticks).<br> 🔹 <strong>Solution:</strong> Use a regex to clean up AI responses before execution.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> cleanCode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rawOutput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">replace</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">\`\`\`(js</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">ts)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">g</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span></code></pre></div><h3 id="🔄-adding-code-validation" tabindex="-1">🔄 <strong>Adding Code Validation</strong> <a class="header-anchor" href="#🔄-adding-code-validation" aria-label="Permalink to &quot;🔄 **Adding Code Validation**&quot;">​</a></h3><p>Before execution, we can <strong>pre-validate</strong> the AI-generated code:</p><p>✅ <strong>Check for dangerous operations (e.g., <code>process</code>, <code>require</code>, <code>fs</code>)</strong><br> ✅ <strong>Enforce a maximum execution time</strong><br> ✅ <strong>Restrict available APIs</strong></p><h2 id="🎯-key-takeaways" tabindex="-1">🎯 Key Takeaways <a class="header-anchor" href="#🎯-key-takeaways" aria-label="Permalink to &quot;🎯 Key Takeaways&quot;">​</a></h2><p>✅ <strong>QuickJS allows fast &amp; secure execution</strong> of AI-generated code.<br> ✅ <strong>Sandboxing prevents security risks</strong>, ensuring that untrusted code can’t harm the host system.<br> ✅ <strong>Combining AI generation with a WebAssembly runtime</strong> enables <strong>dynamic, real-time execution</strong>.<br> ✅ <strong>Proper error handling &amp; validation</strong> can significantly improve reliability.</p><p>🚀 This approach is ideal for <strong>automated workflows</strong>, <strong>intelligent assistants</strong>, and <strong>AI-powered automation</strong>.</p><h2 id="🔗-next-steps" tabindex="-1">🔗 Next Steps <a class="header-anchor" href="#🔗-next-steps" aria-label="Permalink to &quot;🔗 Next Steps&quot;">​</a></h2><p>✅ <strong>Try it out!</strong> Experiment with QuickJS in your own project.<br> ✅ <strong>Enhance security</strong> by restricting certain functions and adding execution limits.<br> ✅ <strong>Improve reliability</strong> with retry mechanisms and error correction.</p><p>QuickJS <strong>opens the door</strong> to <strong>safe, efficient, AI-driven code execution</strong> — without the complexity of full-fledged containerized environments. 🎯</p>`,48)]))}const E=i(e,[["render",h]]);export{g as __pageData,E as default};
