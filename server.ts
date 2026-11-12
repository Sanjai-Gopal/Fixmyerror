import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const isGeminiKeyConfigured = () =>
  Boolean(process.env.GEMINI_API_KEY) &&
  process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
  (process.env.GEMINI_API_KEY as string).length > 10;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for heuristic fallback when API key is missing or offline
function getMockAgentDiagnosis(language: string, code: string, errorText: string) {
  const combined = `${code} ${errorText}`.toLowerCase();

  if (language === 'react' || combined.includes('useeffect') || combined.includes('props')) {
    return {
      agentTrace: [
        {
          stage: 'AST & Component Lifecycle Triage',
          thought: 'Detected React component render phase accessing nested properties on an asynchronous prop without an invariant check.',
          verdict: 'confirmed',
        },
        {
          stage: 'Root Cause Discovery',
          thought: "Child property is read before initial data resolve; 'profile' or 'bio' evaluates to undefined.",
          verdict: 'confirmed',
        },
        {
          stage: 'Non-Destructive Patch Generation',
          thought: 'Synthesized optional chaining (?.) with nullish coalescing (??) fallback to prevent unhandled TypeError without breaking state.',
          verdict: 'verified',
        },
        {
          stage: 'Regression Invariant Validation',
          thought: 'Simulated empty object and pending fetch states. Invariants hold; no render crashes detected.',
          verdict: 'verified',
        },
      ],
      errorName: "TypeError: Cannot read properties of undefined in component render",
      errorCategory: "Lifecycle / Asynchronous State Access",
      likelyCause: "Your component is attempting to read nested properties (such as 'bio.summary') before the data is ready. In React, components render synchronously before network requests complete.",
      relevantLineNumber: 5,
      relevantSnippet: "<p>{profile.bio.summary}</p>",
      codeBefore: `<div className="card">\n  <h3>{profile.name}</h3>\n  <p>{profile.bio.summary}</p>\n</div>`,
      codeAfter: `<div className="card">\n  <h3>{profile?.name}</h3>\n  <p>{profile?.bio?.summary ?? "No bio available yet."}</p>\n</div>`,
      fixSnippetOnly: `<p>{profile?.bio?.summary ?? "No bio available yet."}</p>`,
      whyThisWorks: "Optional chaining (?.) immediately short-circuits to undefined instead of crashing the app when the parent object is missing. The nullish coalescing operator (??) ensures a friendly UI message is displayed until real data arrives.",
      verificationSteps: [
        {
          id: 'step-1',
          instruction: 'Add a loading conditional check at the top of the component:',
          codeHint: 'if (!profile) return <div>Loading user profile...</div>;',
        },
        {
          id: 'step-2',
          instruction: 'Verify component rendering with an empty user object to ensure no unhandled crashes occur.',
        },
      ],
      edgeCasesToWatch: "Watch out for deep nested object mutation and remember that optional chaining does not provide a default value on its own.",
      docSources: [
        {
          title: 'Conditional Rendering in React',
          source: 'React Documentation (Official Guide)',
          summary: 'Best practices for handling asynchronous props and state transitions.',
          urlLabel: 'react.dev/learn/conditional-rendering',
        },
        {
          title: 'Optional Chaining (?.) Operator',
          source: 'MDN Web Docs',
          summary: 'Permits reading the value of a property located deep within a chain of connected objects without validation.',
          urlLabel: 'developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
        },
      ],
      suggestedQuestions: [
        "How can I handle this with React Suspense?",
        "Should I add a TypeScript interface to catch this at compile-time?",
        "How do I write a Vitest component test for the loading state?",
      ],
    };
  }

  if (language === 'css' || combined.includes('z-index') || combined.includes('stacking')) {
    return {
      agentTrace: [
        {
          stage: 'Box Model & Stacking Tree Inspection',
          thought: 'Audited computed layout properties. Found z-index declared without explicit positioning context.',
          verdict: 'confirmed',
        },
        {
          stage: 'Root Cause Discovery',
          thought: 'Elements with position: static default layout ignore z-index completely according to CSS 2.1 specification.',
          verdict: 'confirmed',
        },
        {
          stage: 'Patch Synthesis',
          thought: 'Introduced position: relative / fixed along with inset coordinates to activate local stacking context.',
          verdict: 'verified',
        },
        {
          stage: 'Stacking Invariant Verification',
          thought: 'Verified layer precedence relative to adjacent sibling containers.',
          verdict: 'verified',
        },
      ],
      errorName: "CSS Stacking Context: z-index ignored on static element",
      errorCategory: "CSS Positioning / Stacking Context",
      likelyCause: "The element has default 'position: static', which causes the browser to ignore 'z-index: 9999'. Z-index only takes effect on positioned elements (relative, absolute, fixed, or sticky).",
      relevantLineNumber: 2,
      relevantSnippet: "z-index: 9999;",
      codeBefore: `.modal-overlay {\n  z-index: 9999;\n  background: rgba(0, 0, 0, 0.5);\n  width: 100%;\n  height: 100%;\n}`,
      codeAfter: `.modal-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 9999;\n  background: rgba(0, 0, 0, 0.5);\n}`,
      fixSnippetOnly: `position: fixed;\ninset: 0;\nz-index: 9999;`,
      whyThisWorks: "By declaring 'position: fixed' (or relative), you tell the rendering engine to allocate a dedicated layer in the stacking context, allowing z-index ordering to control visual depth.",
      verificationSteps: [
        {
          id: 'step-1',
          instruction: 'Open Chrome or Firefox DevTools Elements inspector and verify computed position is not static.',
        },
        {
          id: 'step-2',
          instruction: 'Check that no ancestor has an isolation or filter property inadvertently creating an unexpected stacking context.',
        },
      ],
      edgeCasesToWatch: "CSS properties like transform, filter, and opacity < 1 create a new stacking context on parent elements and can trap nested z-indexes.",
      docSources: [
        {
          title: 'Understanding CSS z-index and Stacking Contexts',
          source: 'MDN Web Docs',
          summary: 'The rules governing browser layering and three-dimensional axis rendering.',
          urlLabel: 'developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index',
        },
      ],
      suggestedQuestions: [
        "What causes a parent element to trap child z-indexes?",
        "When should I use isolation: isolate instead?",
        "How does position: fixed interact with mobile viewport scaling?",
      ],
    };
  }

  // Canonical JavaScript items.map bug default
  return {
    agentTrace: [
      {
        stage: 'Stack Trace & Call Frame Inspection',
        thought: "Parsed error trace: 'TypeError: Cannot read properties of undefined (reading map)'. Pinpointed dereference at renderUserTags.",
        verdict: 'confirmed',
      },
      {
        stage: 'Invariance & Data Contract Triage',
        thought: "Object parameter 'user' is missing the 'tags' array property, leaving 'items' strictly undefined.",
        verdict: 'confirmed',
      },
      {
        stage: 'Defensive Code Surgery',
        thought: 'Constructed non-breaking fallback (user.tags || []) guaranteeing an Array instance before invoking .map().',
        verdict: 'verified',
      },
      {
        stage: 'Automated Sanity Verification',
        thought: 'Tested edge inputs: null, undefined, empty array, and populated strings. Invariant holds with zero runtime exceptions.',
        verdict: 'verified',
      },
    ],
    errorName: "TypeError: Cannot read properties of undefined (reading 'map')",
    errorCategory: "Null / Undefined Pointer Dereference",
    likelyCause: "You are attempting to call '.map()' on a variable that evaluates to undefined. In JavaScript, array methods only exist on Arrays. Because 'user.tags' was never provided, 'items' is undefined.",
    relevantLineNumber: 6,
    relevantSnippet: "return items.map((tag) => {",
    codeBefore: `// items is undefined when user.tags is missing\nconst items = user.tags;\nreturn items.map((tag) => {\n  return \`<span class="badge">\${tag}</span>\`;\n});`,
    codeAfter: `// Default to an empty array so .map() always executes safely\nconst items = user.tags || [];\nreturn items.map((tag) => {\n  return \`<span class="badge">\${tag}</span>\`;\n});`,
    fixSnippetOnly: `const items = user.tags || [];`,
    whyThisWorks: "The logical OR (||) operator provides an empty array [] whenever 'user.tags' is falsy or undefined. Since [].map() produces an empty array without throwing, your function executes smoothly without halting the application.",
    verificationSteps: [
      {
        id: 'step-1',
        instruction: 'Log input arguments before the operation to verify data shape:',
        codeHint: "console.log('Received user payload:', user);",
      },
      {
        id: 'step-2',
        instruction: 'Test with an incomplete object missing tags:',
        codeHint: "renderUserTags({ id: 1, name: 'Alex' }); // Returns [] cleanly",
      },
      {
        id: 'step-3',
        instruction: 'Test with populated tags to confirm HTML markup renders as expected:',
        codeHint: "renderUserTags({ name: 'Alex', tags: ['JavaScript', 'React'] });",
      },
    ],
    edgeCasesToWatch: "If user.tags is false or 0, || will replace it with []. If tags could be non-array types (like a string), use Array.isArray(user.tags) ? user.tags : [].",
    docSources: [
      {
        title: 'Array.prototype.map()',
        source: 'MDN Web Docs (Reference)',
        summary: 'Official ECMAScript specification for array mapping operations.',
        urlLabel: 'developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map',
      },
      {
        title: 'TypeError: Cannot read properties of undefined',
        source: 'MDN Web Docs (Troubleshooting)',
        summary: 'Root causes and remediation for undefined property dereferences.',
        urlLabel: 'developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_property',
      },
    ],
    suggestedQuestions: [
      "How can I use optional chaining (user.tags?.map) instead?",
      "How would I enforce this with TypeScript or Zod validation?",
      "What is the difference between nullish coalescing (??) and logical OR (||)?",
    ],
  };
}

// Route 1: Autonomous Agent Diagnosis
app.post('/api/agent/diagnose', async (req: Request, res: Response) => {
  const { language = 'javascript', code = '', errorText = '', goal = 'Fix bug and explain clearly' } = req.body;

  if (!code && !errorText) {
    return res.status(400).json({ error: 'Please provide either a code snippet or an error message.' });
  }

  // If Gemini API Key is available, invoke Gemini 3.8 Flash with structured schema
  if (isGeminiKeyConfigured()) {
    try {
      const prompt = `You are FixMyError AI Agent, an expert senior software engineer and mentor specializing in web development (JavaScript, React, CSS, TypeScript).
Analyze the following developer bug report and formulate an autonomous, step-by-step healing plan.

Context:
- Language/Framework: ${language}
- User Goal: ${goal}
- Code Snippet:
\`\`\`${language}
${code}
\`\`\`
- Error / Console Output:
\`\`\`
${errorText}
\`\`\`

Requirements:
1. Provide an agent reasoning trace with 3-4 stages ('Triage & Parse', 'Root Cause Discovery', 'Patch Synthesis', 'Regression Invariant Check').
2. Identify the likely cause in plain, beginner-friendly terms.
3. Determine the exact relevant 1-indexed line number in the snippet and problematic line.
4. Provide a minimal code patch before and after.
5. Explain the underlying mental model ("Why this works").
6. Provide concrete, actionable "Try this" verification steps with quick test code.
7. Outline subtle edge cases to watch.
8. Suggest 3 high-value follow-up questions the developer could ask the agent.`;

      // Set timeout promise so user never hangs
      const apiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are FixMyError AI Agent. Always return strict, valid JSON matching the requested responseSchema. Never output markdown wraps outside JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              agentTrace: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stage: { type: Type.STRING },
                    thought: { type: Type.STRING },
                    verdict: { type: Type.STRING },
                  },
                  required: ['stage', 'thought', 'verdict'],
                },
              },
              errorName: { type: Type.STRING },
              errorCategory: { type: Type.STRING },
              likelyCause: { type: Type.STRING },
              relevantLineNumber: { type: Type.INTEGER },
              relevantSnippet: { type: Type.STRING },
              codeBefore: { type: Type.STRING },
              codeAfter: { type: Type.STRING },
              fixSnippetOnly: { type: Type.STRING },
              whyThisWorks: { type: Type.STRING },
              verificationSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    instruction: { type: Type.STRING },
                    codeHint: { type: Type.STRING },
                  },
                  required: ['id', 'instruction'],
                },
              },
              edgeCasesToWatch: { type: Type.STRING },
              docSources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    source: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    urlLabel: { type: Type.STRING },
                  },
                  required: ['title', 'source', 'summary', 'urlLabel'],
                },
              },
              suggestedQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'agentTrace',
              'errorName',
              'likelyCause',
              'codeBefore',
              'codeAfter',
              'fixSnippetOnly',
              'whyThisWorks',
              'verificationSteps',
              'docSources',
            ],
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI Agent diagnosis timed out')), 25000)
      );

      const response: any = await Promise.race([apiPromise, timeoutPromise]);
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, isLiveAgent: true, ...parsed });
    } catch (apiErr: any) {
      console.warn('Gemini API call failed, falling back to heuristic engine:', apiErr?.message);
      const fallback = getMockAgentDiagnosis(language, code, errorText);
      return res.json({ success: true, isLiveAgent: false, fallbackReason: apiErr?.message, ...fallback });
    }
  }

  // Fallback when no API key is in environment
  const fallback = getMockAgentDiagnosis(language, code, errorText);
  return res.json({ success: true, isLiveAgent: false, ...fallback });
});

// Route 2: Multi-turn Conversational Debugging Agent Chat
app.post('/api/agent/chat', async (req: Request, res: Response) => {
  const { messages = [], context = {} } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided.' });
  }

  const lastMessage = messages[messages.length - 1]?.content || '';

  if (isGeminiKeyConfigured()) {
    try {
      const systemInstruction = `You are FixMyError AI Agent, an encouraging, practical, and highly skilled debugging copilot for web developers.
Context regarding current session:
- Language: ${context.language || 'web'}
- User's Code Snippet:
${context.code || '(None provided)'}
- Console Error:
${context.errorText || '(None provided)'}
- Suggested Fix:
${context.fixSnippet || '(None)'}

Guidelines:
- Give concise, empowering, code-grounded explanations.
- Use markdown for short code examples.
- Keep tone approachable, professional, and educational.`;

      // Sanitize messages for Gemini:
      // 1. Omit any initial greeting turn that has role: 'model' (Gemini requires first content to be 'user')
      // 2. Ensure non-empty text parts
      const cleanMessages = messages.filter((m: any, idx: number) => {
        if (idx === 0 && m.role === 'model') return false;
        return Boolean(m.content && m.content.trim());
      });

      // If no user messages remain, formulate one from the last message
      const apiContents = (cleanMessages.length > 0
        ? cleanMessages
        : [{ role: 'user', content: lastMessage || 'Please explain this error and how to fix it.' }]
      ).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const chatPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: apiContents,
        config: {
          systemInstruction,
        },
      });

      // 25 second timeout gives the model ample time to reason without premature aborts
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI Agent chat timed out')), 25000)
      );

      const response: any = await Promise.race([chatPromise, timeoutPromise]);

      if (response && response.text) {
        return res.json({ success: true, reply: response.text });
      }
    } catch (err: any) {
      console.warn('Gemini chat failed, fallback response used:', err?.message);
    }
  }

  // Smart fallback chat responses for hackathon demos
  let reply = "Here's the key concept: In modern web development, defensiveness around asynchronous state and null safety saves countless debugging hours. If you'd like, you can use optional chaining (e.g. `obj?.prop`) or provide a default fallback (`data || []`).";
  if (lastMessage.toLowerCase().includes('optional chaining')) {
    reply = "Optional chaining (`user.tags?.map(...)`) is a great choice! If `user.tags` is undefined, it immediately returns `undefined` instead of throwing an error. However, if you need an array back for React JSX rendering, you should combine it with nullish coalescing: `(user.tags ?? []).map(...)`.";
  } else if (lastMessage.toLowerCase().includes('typescript') || lastMessage.toLowerCase().includes('type')) {
    reply = "In TypeScript, defining a strict interface like:\n```ts\ninterface UserProfile {\n  name: string;\n  tags?: string[]; // Optional property\n}\n```\nwill cause the TypeScript compiler to alert you with `Object is possibly 'undefined'` right in your IDE before you even run the code!";
  } else if (lastMessage.toLowerCase().includes('test') || lastMessage.toLowerCase().includes('vitest')) {
    reply = "Here is a quick unit test with Vitest/Jest:\n```js\ntest('renderUserTags handles missing tags safely', () => {\n  const result = renderUserTags({ name: 'Alex' });\n  expect(result).toEqual([]);\n});\n```";
  }

  return res.json({ success: true, reply });
});

// Setup Vite middlewares in development or static serve in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FixMyError Agent Server running on http://localhost:${PORT}`);
  });
}

startServer();
