import{_ as i,c as a,o as e,ag as n}from"./chunks/framework.DDIS5Pnb.js";const g=JSON.parse('{"title":"Version 2.0","description":"See whats new in version 2.0 of @sebastianwessel/quickjs package","frontmatter":{"title":"Version 2.0","description":"See whats new in version 2.0 of @sebastianwessel/quickjs package","date":"2025-03-01T12:00:00.000Z","categories":"release"},"headers":[],"relativePath":"blog/2024-09-01-version-2.md","filePath":"blog/2024-09-01-version-2.md","lastUpdated":1740685031000}'),t={name:"blog/2024-09-01-version-2.md"};function h(l,s,p,r,o,k){return e(),a("div",null,s[0]||(s[0]=[n(`<h1 id="🚀-announcing-version-2-0" tabindex="-1">🚀 Announcing Version 2.0 <a class="header-anchor" href="#🚀-announcing-version-2-0" aria-label="Permalink to &quot;🚀 Announcing Version 2.0&quot;">​</a></h1><p>After months of hard work, <strong>QuickJS Version 2.0</strong> is finally here! 🎉</p><p>This release brings <strong>major improvements</strong>, including a complete rewrite of the <strong>data exchange layer</strong> between the guest and host. The API has been <strong>simplified</strong>, making it easier than ever to work with <strong>JavaScript sandboxes</strong> while providing even more control.</p><p>Along with <strong>bug fixes</strong>, <strong>TypeScript support</strong>, <strong>async execution</strong>, and <strong>enhanced configurability</strong>, we&#39;ve also revamped the <strong>official website</strong> to provide better documentation and examples.</p><p>Let’s dive into what’s new! 🔥</p><hr><h2 id="✨-what-s-new-in-quickjs-2-0" tabindex="-1">✨ What’s New in QuickJS 2.0? <a class="header-anchor" href="#✨-what-s-new-in-quickjs-2-0" aria-label="Permalink to &quot;✨ What’s New in QuickJS 2.0?&quot;">​</a></h2><h3 id="🔁-re-use-of-context" tabindex="-1">🔁 Re-Use of Context <a class="header-anchor" href="#🔁-re-use-of-context" aria-label="Permalink to &quot;🔁 Re-Use of Context&quot;">​</a></h3><p>With QuickJS v2, you can now <strong>reuse the same sandboxed context multiple times</strong>, making execution more efficient.</p><h4 id="✅-example" tabindex="-1">✅ Example <a class="header-anchor" href="#✅-example" aria-label="Permalink to &quot;✅ Example&quot;">​</a></h4><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SandboxOptions, loadQuickJs } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;../../src/index.js&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SandboxOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // [...]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadQuickJs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> finalResult</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> firstResult</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;// [...code 1]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Step 1:&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, firstResult)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // Run second call</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;// [...code 2]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}, options)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(finalResult)</span></span></code></pre></div><p>Now, you can <strong>execute multiple pieces of code inside the same sandboxed context</strong> without needing to create a new instance each time.</p><hr><h3 id="🟦-typescript-support" tabindex="-1">🟦 TypeScript Support <a class="header-anchor" href="#🟦-typescript-support" aria-label="Permalink to &quot;🟦 TypeScript Support&quot;">​</a></h3><p><strong>TypeScript execution is now supported natively!</strong> 🎉</p><p>To enable it, just install the <code>typescript</code> package and set <code>transformTypescript: true</code> in the sandbox options.</p><p>🔹 <strong>Note:</strong> This does <strong>not</strong> perform type checking. It simply <strong>transpiles TypeScript to JavaScript</strong>, allowing TypeScript code to be executed in the sandbox.</p><hr><h3 id="⏳-full-async-support" tabindex="-1">⏳ Full Async Support <a class="header-anchor" href="#⏳-full-async-support" aria-label="Permalink to &quot;⏳ Full Async Support&quot;">​</a></h3><p>With <strong>QuickJS v2</strong>, you can now use <strong>asynchronous execution</strong> via the <strong>Emscripten async variant</strong>. This means:</p><p>✅ <strong>Dynamic imports at runtime</strong><br> ✅ <strong>Fetching dependencies from sources like <a href="https://esm.sh/" target="_blank" rel="noreferrer">esm.sh</a></strong></p><h4 id="🛠️-how-to-use-the-async-version" tabindex="-1">🛠️ How to Use the Async Version <a class="header-anchor" href="#🛠️-how-to-use-the-async-version" aria-label="Permalink to &quot;🛠️ How to Use the Async Version&quot;">​</a></h4><p>Simply replace:</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { loadQuickJs } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@sebastianwessel/quickjs&#39;</span></span></code></pre></div><p>with:</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { loadAsyncQuickJs } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@sebastianwessel/quickjs&#39;</span></span></code></pre></div><p>Now, your sandbox can dynamically load modules and dependencies at runtime! 🚀</p><hr><h3 id="⚙️-enhanced-configuration" tabindex="-1">⚙️ Enhanced Configuration <a class="header-anchor" href="#⚙️-enhanced-configuration" aria-label="Permalink to &quot;⚙️ Enhanced Configuration&quot;">​</a></h3><p>The sandbox is now <strong>more customizable than ever</strong>!</p><p>✅ <strong>Customizable module path resolver</strong><br> ✅ <strong>Custom module loader</strong><br> ✅ <strong>Fine-grained control over execution behavior</strong></p><p>These improvements allow developers to configure <strong>precisely how modules are loaded</strong> and how the sandbox interacts with the environment.</p><hr><h2 id="📌-use-cases" tabindex="-1">📌 Use Cases <a class="header-anchor" href="#📌-use-cases" aria-label="Permalink to &quot;📌 Use Cases&quot;">​</a></h2><p>To help users get started, <strong>three new use cases</strong> have been added to the website, with <strong>source code available in the <a href="https://github.com/sebastianwessel/quickjs" target="_blank" rel="noreferrer">GitHub repository</a></strong>.</p><h3 id="🤖-1-execute-ai-generated-code" tabindex="-1">🤖 1. Execute AI-Generated Code <a class="header-anchor" href="#🤖-1-execute-ai-generated-code" aria-label="Permalink to &quot;🤖 1. Execute AI-Generated Code&quot;">​</a></h3><p>A Large Language Model (LLM) generates JavaScript code to solve a given task. The <strong>QuickJS sandbox</strong> executes the AI-generated code, and the <strong>result is passed back</strong> to the LLM for further processing.</p><p>🔗 <strong>Try it here</strong>: <a href="./../use-cases/ai-generated-code.html">Execute AI-Generated Code</a></p><hr><h3 id="🛡️-2-secure-execution-of-user-generated-code" tabindex="-1">🛡️ 2. Secure Execution of User-Generated Code <a class="header-anchor" href="#🛡️-2-secure-execution-of-user-generated-code" aria-label="Permalink to &quot;🛡️ 2. Secure Execution of User-Generated Code&quot;">​</a></h3><p>Running user-created code <strong>safely</strong> is a challenge. With QuickJS, <strong>sandboxing JavaScript execution</strong> takes just a few lines of code!</p><p>🔗 <strong>Check it out</strong>: <a href="./../use-cases/user-generated-code.html">User Generated Code</a></p><hr><h3 id="🌍-3-server-side-rendering-ssr" tabindex="-1">🌍 <strong>3. Server-Side Rendering (SSR)</strong> <a class="header-anchor" href="#🌍-3-server-side-rendering-ssr" aria-label="Permalink to &quot;🌍 **3. Server-Side Rendering (SSR)**&quot;">​</a></h3><p>QuickJS can also be used for <strong>server-side rendering</strong> (SSR) in a <strong>secure, isolated environment</strong>.</p><p>🔗 <strong>See the example</strong>: <a href="./../use-cases/serverside-rendering.html">Serverside Rendering</a></p><hr><h2 id="🚀-migration-guide-quickjs-v1-→-v2" tabindex="-1">🚀 Migration Guide: QuickJS v1 → v2 <a class="header-anchor" href="#🚀-migration-guide-quickjs-v1-→-v2" aria-label="Permalink to &quot;🚀 Migration Guide: QuickJS v1 → v2&quot;">​</a></h2><p>QuickJS v2 <strong>introduces changes</strong> to improve the developer experience and expand capabilities. If you&#39;re upgrading from <strong>v1</strong>, here’s what you need to know:</p><h3 id="📦-new-dependency-management" tabindex="-1">📦 New Dependency Management <a class="header-anchor" href="#📦-new-dependency-management" aria-label="Permalink to &quot;📦 New Dependency Management&quot;">​</a></h3><p>Previously, QuickJS was shipped with:<br><code>@jitl/quickjs-ng-wasmfile-release-sync</code></p><p>Now, you must install <strong>your preferred QuickJS WebAssembly variant</strong> separately.</p><h4 id="📥-install-the-new-package" tabindex="-1">📥 Install the New Package <a class="header-anchor" href="#📥-install-the-new-package" aria-label="Permalink to &quot;📥 Install the New Package&quot;">​</a></h4><p>Use the package manager of your choice:</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># npm</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @jitl/quickjs-wasmfile-release-sync</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># bun</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bun</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @jitl/quickjs-wasmfile-release-sync</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># yarn</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @jitl/quickjs-wasmfile-release-sync</span></span></code></pre></div><p>This <strong>separates QuickJS from the runtime</strong>, allowing <strong>more flexibility</strong> in choosing the variant that best fits your needs.</p><hr><h3 id="🔄-updated-api-usage" tabindex="-1">🔄 Updated API Usage <a class="header-anchor" href="#🔄-updated-api-usage" aria-label="Permalink to &quot;🔄 Updated API Usage&quot;">​</a></h3><h4 id="" tabindex="-1"><a class="header-anchor" href="#" aria-label="Permalink to &quot;&quot;">​</a></h4><p>Before (QuickJS v1)</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { quickJS } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@sebastianwessel/quickjs&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">createRuntime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> quickJS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createRuntime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(options)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(code)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(result)</span></span></code></pre></div><h4 id="after-quickjs-v2" tabindex="-1">After (QuickJS v2) <a class="header-anchor" href="#after-quickjs-v2" aria-label="Permalink to &quot;After (QuickJS v2)&quot;">​</a></h4><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SandboxOptions, loadQuickJs } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@sebastianwessel/quickjs&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadQuickJs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> code</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">import { join } from &#39;path&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">const fn = async () =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  console.log(join(&#39;src&#39;, &#39;dist&#39;)) // Logs &quot;src/dist&quot; on the host system</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  console.log(env.MY_ENV_VAR) // Logs &quot;env var value&quot; on the host system</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  const url = new URL(&#39;https://example.com&#39;)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  const f = await fetch(url)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  return f.text()</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">export default await fn()</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SandboxOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  allowFetch: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Allow network requests</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  allowFs: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Enable virtual file system</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  env: { MY_ENV_VAR: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;env var value&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(code))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(result)</span></span></code></pre></div><p>💡 <strong>Key Differences:</strong></p><ul><li><code>loadQuickJs()</code> replaces <code>quickJS()</code></li><li><code>runSandboxed()</code> simplifies execution</li><li>Modular approach for <strong>better control &amp; flexibility</strong></li></ul><hr><h2 id="🎉-final-thoughts" tabindex="-1">🎉 Final Thoughts <a class="header-anchor" href="#🎉-final-thoughts" aria-label="Permalink to &quot;🎉 Final Thoughts&quot;">​</a></h2><p>QuickJS <strong>Version 2.0</strong> is a <strong>huge step forward</strong>, making it <strong>faster, safer, and more configurable</strong>.</p><h3 id="🔥-why-upgrade" tabindex="-1">🔥 Why Upgrade? <a class="header-anchor" href="#🔥-why-upgrade" aria-label="Permalink to &quot;🔥 Why Upgrade?&quot;">​</a></h3><p>✅ <strong>More powerful API</strong><br> ✅ <strong>Async execution</strong><br> ✅ <strong>Dynamic imports &amp; TypeScript support</strong><br> ✅ <strong>Better configuration &amp; modularity</strong><br> ✅ <strong>Improved security</strong></p><p>🚀 <strong>Upgrade today</strong> and experience the <strong>next generation</strong> of JavaScript sandboxing!</p><p>👉 <a href="https://github.com/sebastianwessel/quickjs" target="_blank" rel="noreferrer">Check out the QuickJS repository</a></p>`,72)]))}const c=i(t,[["render",h]]);export{g as __pageData,c as default};
