import{_ as i,c as a,o as n,ag as t}from"./chunks/framework.DDIS5Pnb.js";const g=JSON.parse('{"title":"User-Generated Code","description":"Use QuickJS to run code which is provided by unknown users","frontmatter":{"title":"User-Generated Code","description":"Use QuickJS to run code which is provided by unknown users","image":"/use-case-user.jpg","order":20},"headers":[],"relativePath":"use-cases/user-generated-code.md","filePath":"use-cases/user-generated-code.md","lastUpdated":1740691858000}'),e={name:"use-cases/user-generated-code.md"};function l(h,s,p,k,r,o){return n(),a("div",null,s[0]||(s[0]=[t(`<h1 id="executing-user-generated-code-safely" tabindex="-1">Executing User-Generated Code Safely <a class="header-anchor" href="#executing-user-generated-code-safely" aria-label="Permalink to &quot;Executing User-Generated Code Safely&quot;">​</a></h1><p>Allowing users to create and execute JavaScript code inside your application can unlock powerful customization and automation capabilities. However, it also introduces <strong>security risks</strong>, <strong>performance concerns</strong>, and <strong>sandboxing challenges</strong>.</p><p>The <strong>wrong approach</strong> (such as using JavaScript’s built-in <code>eval</code>) can <strong>expose your system to serious vulnerabilities</strong>, including infinite loops, crashes, and unauthorized access to sensitive data.</p><p>In this article, we&#39;ll walk through a <strong>safe and efficient way</strong> to execute user-generated JavaScript code using <strong>QuickJS</strong>, a lightweight JavaScript engine that enables sandboxed execution.</p><h2 id="🚨-why-not-use-eval" tabindex="-1">🚨 Why Not Use <code>eval</code>? <a class="header-anchor" href="#🚨-why-not-use-eval" aria-label="Permalink to &quot;🚨 Why Not Use \`eval\`?&quot;">​</a></h2><p>Using <code>eval</code> for user-generated code may seem like the easiest solution, but it&#39;s also the <strong>most dangerous</strong>:</p><p>❌ <strong>Security Risks</strong> – Users could execute malicious code, access system resources, or modify global variables.<br> ❌ <strong>Performance Issues</strong> – JavaScript is <strong>single-threaded</strong>; if a user writes an infinite loop, it will block execution entirely.<br> ❌ <strong>Lack of Isolation</strong> – <code>eval</code> runs <strong>inside your main thread</strong>, meaning <strong>any bug or infinite loop can crash your entire application</strong>.</p><p>A <strong>better solution</strong> is to run user-generated code inside a <strong>secure, sandboxed environment</strong> where it cannot interfere with the host system.</p><h2 id="📌-use-case-json-log-processing" tabindex="-1">📌 Use Case: JSON Log Processing <a class="header-anchor" href="#📌-use-case-json-log-processing" aria-label="Permalink to &quot;📌 Use Case: JSON Log Processing&quot;">​</a></h2><p>Let’s consider a <strong>real-world scenario</strong>:</p><p>✅ We have a <strong>JSON log file</strong> that records system events.<br> ✅ Users should be able to <strong>write their own logic</strong> to decide whether an <strong>alert should be triggered</strong>.<br> ✅ The code should be <strong>executed safely</strong>, without the risk of interfering with the host system.<br> ✅ Users should be able to <strong>write TypeScript</strong>, benefiting from <strong>autocomplete, type checking, and code suggestions</strong>.</p><p>We&#39;ll use <strong>QuickJS</strong> to sandbox and safely execute the user’s logic.</p><h2 id="🔧-setting-up-the-sandbox" tabindex="-1">🔧 Setting Up the Sandbox <a class="header-anchor" href="#🔧-setting-up-the-sandbox" aria-label="Permalink to &quot;🔧 Setting Up the Sandbox&quot;">​</a></h2><h3 id="_1️⃣-project-structure" tabindex="-1">1️⃣ <strong>Project Structure</strong> <a class="header-anchor" href="#_1️⃣-project-structure" aria-label="Permalink to &quot;1️⃣ **Project Structure**&quot;">​</a></h3><p>We&#39;ll structure our project as follows:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> log.jsonl</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       # JSON logs (one entry per line)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> src</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> custom.ts</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   # User-created code</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> types.ts</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # Type definitions</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> index.ts</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # Main execution file</span></span></code></pre></div><h3 id="_2️⃣-example-data-log-file-type-definitions" tabindex="-1">2️⃣ <strong>Example Data (Log File &amp; Type Definitions)</strong> <a class="header-anchor" href="#_2️⃣-example-data-log-file-type-definitions" aria-label="Permalink to &quot;2️⃣ **Example Data (Log File &amp; Type Definitions)**&quot;">​</a></h3><h4 id="📝-log-jsonl" tabindex="-1">📝 <code>log.jsonl</code> <a class="header-anchor" href="#📝-log-jsonl" aria-label="Permalink to &quot;📝 \`log.jsonl\`&quot;">​</a></h4><div class="language-jsonl vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsonl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;message&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;some log message&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;errorCode&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;dateTime&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;2025-02-26T07:35:10Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;message&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;an error message&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;errorCode&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;dateTime&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;2025-02-26T07:40:00Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="📌-src-types-ts-defining-log-format-alert-function" tabindex="-1">📌 <code>src/types.ts</code> (Defining Log Format &amp; Alert Function) <a class="header-anchor" href="#📌-src-types-ts-defining-log-format-alert-function" aria-label="Permalink to &quot;📌 \`src/types.ts\` (Defining Log Format &amp; Alert Function)&quot;">​</a></h4><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> LogRow</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  errorCode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  dateTime</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AlertDecisionFn</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> LogRow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span></code></pre></div><h4 id="📝-src-index-ts-main-execution" tabindex="-1">📝 <code>src/index.ts</code> (Main Execution) <a class="header-anchor" href="#📝-src-index-ts-main-execution" aria-label="Permalink to &quot;📝 \`src/index.ts\` (Main Execution)&quot;">​</a></h4><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { readFileSync } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;node:fs&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { shouldAlert } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;./custom.js&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { LogRow } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;./types.js&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> logFileContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> readFileSync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;log.jsonl&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;utf-8&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> logs</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> LogRow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> logFileContent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">split</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">line</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> JSON</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(line))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shouldAlert</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(logs)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> default</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span></code></pre></div><h4 id="🎨-src-custom-ts-user-written-code" tabindex="-1">🎨 <code>src/custom.ts</code> (User-Written Code) <a class="header-anchor" href="#🎨-src-custom-ts-user-written-code" aria-label="Permalink to &quot;🎨 \`src/custom.ts\` (User-Written Code)&quot;">​</a></h4><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { AlertDecisionFn } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;./types.js&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shouldAlert</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AlertDecisionFn</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // User-defined logic</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // return booleanResult</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="⚙️-mounting-files-in-the-sandbox" tabindex="-1">⚙️ Mounting Files in the Sandbox <a class="header-anchor" href="#⚙️-mounting-files-in-the-sandbox" aria-label="Permalink to &quot;⚙️ Mounting Files in the Sandbox&quot;">​</a></h2><p>We&#39;ll map these files into a <strong>QuickJS sandbox</strong>, allowing users to edit only <code>custom.ts</code>, while keeping the rest of the logic <strong>untouched</strong>.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SandboxOptions } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;../../src/index.js&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> userGeneratedCode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;return true&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // Example user input</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> logFileContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`{&quot;message&quot;:&quot;some log message&quot;,&quot;errorCode&quot;:0,&quot;dateTime&quot;:&quot;2025-02-26T07:35:10Z&quot;}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">{&quot;message&quot;:&quot;an error message&quot;,&quot;errorCode&quot;:1,&quot;dateTime&quot;:&quot;2025-02-26T07:40:00Z&quot;}\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SandboxOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  allowFetch: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  allowFs: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  transformTypescript: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mountFs: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;log.jsonl&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: logFileContent,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    src: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &#39;types.ts&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`export type LogRow = {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                    message: string</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                    errorCode: number</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                    dateTime: string</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                  }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                  </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                  export type AlertDecisionFn = ( input: LogRow[] ) =&gt; boolean\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &#39;custom.ts&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`import type { AlertDecisionFn } from &#39;./types.js&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      export const shouldAlert: AlertDecisionFn = (input) =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">userGeneratedCode</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      }\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>🔹 This setup <strong>mounts the JSON log data and the user’s code</strong> while keeping the <strong>execution logic intact</strong>.</p><h2 id="🚀-running-the-user-s-code" tabindex="-1">🚀 Running the User&#39;s Code <a class="header-anchor" href="#🚀-running-the-user-s-code" aria-label="Permalink to &quot;🚀 Running the User&#39;s Code&quot;">​</a></h2><p>Here’s how the <strong>sandboxed execution</strong> works:</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SandboxOptions, loadQuickJs } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;../../src/index.js&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadQuickJs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> executionCode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`import { readFileSync } from &#39;node:fs&#39;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">import { shouldAlert } from &#39;./custom.js&#39;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">import type { LogRow } from &#39;./types.js&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">const main = () =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  const logFileContent = readFileSync(&#39;log.jsonl&#39;, &#39;utf-8&#39;)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  const logs: LogRow[] = logFileContent.split(&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\\\</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">n&#39;).map(line =&gt; JSON.parse(line))</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  return shouldAlert(logs)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">export default main()</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> resultSandbox</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> runSandboxed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> evalCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(executionCode, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}, options)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(resultSandbox)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Output:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// { ok: true, data: true }</span></span></code></pre></div><p>✅ <strong>The user’s logic is executed safely</strong>, and their function determines whether an alert should be triggered.</p><h2 id="🏗️-adding-memory-state-management" tabindex="-1">🏗️ Adding Memory (State Management) <a class="header-anchor" href="#🏗️-adding-memory-state-management" aria-label="Permalink to &quot;🏗️ Adding Memory (State Management)&quot;">​</a></h2><p>To improve functionality, we can <strong>add persistent memory</strong>. This allows the function to track <strong>previous alerts</strong>, implementing <strong>debouncing</strong> or <strong>rate limiting</strong>.</p><p>Since <strong>QuickJS functions are stateless</strong>, the <strong>host system</strong> should manage state.</p><h3 id="💾-storing-state-in-memory" tabindex="-1">💾 Storing State in Memory <a class="header-anchor" href="#💾-storing-state-in-memory" aria-label="Permalink to &quot;💾 Storing State in Memory&quot;">​</a></h3><p>We’ll store the <strong>last alert time</strong> in the host and expose functions for <strong>reading and updating</strong> it.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> memory</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Date</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Store last alert timestamp</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SandboxOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  allowFetch: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  allowFs: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  transformTypescript: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  env: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    setLastAlert</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Setting last alert:&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, input)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      memory </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> input </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    getLastAlert</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> memory,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="🛠️-accessing-state-from-the-guest" tabindex="-1">🛠️ Accessing State from the Guest <a class="header-anchor" href="#🛠️-accessing-state-from-the-guest" aria-label="Permalink to &quot;🛠️ Accessing State from the Guest&quot;">​</a></h3><p>Inside the sandbox, the user can now call <code>env.getLastAlert()</code> and <code>env.setLastAlert(new Date())</code> to manage state.</p><h2 id="🎯-key-takeaways" tabindex="-1">🎯 Key Takeaways <a class="header-anchor" href="#🎯-key-takeaways" aria-label="Permalink to &quot;🎯 Key Takeaways&quot;">​</a></h2><p>✅ <strong>QuickJS provides a safe, isolated sandbox</strong> for executing user-generated JavaScript code.<br> ✅ <strong>No risk of crashes, infinite loops, or unauthorized system access.</strong><br> ✅ <strong>TypeScript support</strong> allows users to write code with better tooling (autocomplete, suggestions).<br> ✅ <strong>Custom memory handling</strong> can be used for debouncing or rate limiting logic.</p><p>With this setup, <strong>user-generated JavaScript execution becomes secure, efficient, and highly customizable</strong> — without compromising system stability. 🚀</p><h2 id="🔗-next-steps" tabindex="-1">🔗 Next Steps <a class="header-anchor" href="#🔗-next-steps" aria-label="Permalink to &quot;🔗 Next Steps&quot;">​</a></h2><p>👉 <strong>Try it out:</strong> Implement QuickJS in your own project.<br> 👉 <strong>Enhance security:</strong> Add execution timeouts and memory limits.<br> 👉 <strong>Expand functionality:</strong> Allow users to fetch external data securely.</p><p>QuickJS makes <strong>sandboxing user-generated code easy and secure</strong> — without the headaches of <code>eval</code>. 🎯</p>`,48)]))}const c=i(e,[["render",l]]);export{g as __pageData,c as default};
