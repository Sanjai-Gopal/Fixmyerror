import { SampleScenario, AnalysisResult, FrameworkLanguage } from '../types';

export const JAVASCRIPT_SAMPLE_SCENARIO: SampleScenario = {
  id: 'js-items-map-undefined',
  label: 'JavaScript: items.map is not a function / undefined',
  language: 'javascript',
  code: `function renderUserTags(user) {
  // Grab the tags list from the user profile
  const items = user.tags;

  // Render each tag into an HTML badge
  return items.map((tag) => {
    return \`<span class="badge">\${tag}</span>\`;
  });
}

// Simulated usage:
const activeUser = { id: 104, name: "Alex Chen" };
const html = renderUserTags(activeUser);
console.log(html);`,
  error: `TypeError: Cannot read properties of undefined (reading 'map')
    at renderUserTags (profile.js:6:16)
    at Object.<anonymous> (profile.js:13:14)`,
  analysis: {
    language: 'javascript',
    errorName: "TypeError: Cannot read properties of undefined (reading 'map')",
    likelyCause:
      "You are trying to call the .map() method on 'items', but 'items' evaluates to undefined. This happens because the 'user' object passed into renderUserTags does not have a 'tags' property.",
    relevantLineNumber: 6,
    relevantSnippet: "return items.map((tag) => {",
    codeBefore: `// When user.tags is missing, items is undefined
const items = user.tags;
return items.map((tag) => {
  return \`<span class="badge">\${tag}</span>\`;
});`,
    codeAfter: `// Default to an empty array [] so .map() always runs safely
const items = user.tags || [];
return items.map((tag) => {
  return \`<span class="badge">\${tag}</span>\`;
});`,
    fixSnippetOnly: `const items = user.tags || [];`,
    whyThisWorks:
      "In JavaScript, array methods like .map(), .filter(), and .forEach() only exist on Array instances. When an object property is omitted or undefined, JavaScript cannot look up '.map' and throws a TypeError. Adding a logical OR fallback (user.tags || []) or optional chaining (user.tags?.map(...)) guarantees you always operate on a safe array without crashing your script.",
    verificationSteps: [
      {
        id: 'step-1',
        instruction: "Inspect the input object right before calling .map to see what tags contains:",
        codeHint: "console.log('User profile received:', user);",
      },
      {
        id: 'step-2',
        instruction: "Test the safe fallback with a user who has no tags property:",
        codeHint: "renderUserTags({ name: 'Alex' }); // Returns [] without throwing",
      },
      {
        id: 'step-3',
        instruction: "Verify with populated tags to ensure normal rendering remains unchanged:",
        codeHint: "renderUserTags({ name: 'Alex', tags: ['React', 'CSS'] });",
      },
    ],
    docSources: [
      {
        title: 'Array.prototype.map()',
        source: 'MDN Web Docs (Reference Documentation)',
        summary: 'Standard ECMAScript specification for transforming each element in an Array instance.',
        urlLabel: 'developer.mozilla.org / Array / map',
      },
      {
        title: 'TypeError: Cannot read properties of undefined',
        source: 'MDN Web Docs (Troubleshooting Guide)',
        summary: 'Common JavaScript runtime error when attempting property access or method invocation on null or undefined values.',
        urlLabel: 'developer.mozilla.org / Errors / Type_error_undefined',
      },
      {
        title: 'Optional chaining (?.) and Nullish coalescing (??)',
        source: 'MDN Web Docs (Language Feature)',
        summary: 'Modern operators designed specifically to guard against deeply nested undefined access.',
        urlLabel: 'developer.mozilla.org / Operators / Optional_chaining',
      },
    ],
  },
};

export const REACT_SAMPLE_SCENARIO: SampleScenario = {
  id: 'react-undefined-props',
  label: 'React: Cannot read properties of undefined in component render',
  language: 'react',
  code: `export default function UserCard({ profile }) {
  return (
    <div className="card">
      <h3>{profile.name}</h3>
      <p>{profile.bio.summary}</p>
    </div>
  );
}`,
  error: `Uncaught TypeError: Cannot read properties of undefined (reading 'summary')
    at UserCard (UserCard.jsx:5:22)
    at renderWithHooks (react-dom.development.js:16305)`,
  analysis: {
    language: 'react',
    errorName: "TypeError: Cannot read properties of undefined (reading 'summary')",
    likelyCause:
      "Your component is trying to read profile.bio.summary before 'bio' is populated (common during asynchronous data fetching, or when a user has not filled out their bio yet).",
    relevantLineNumber: 5,
    relevantSnippet: "<p>{profile.bio.summary}</p>",
    codeBefore: `<div className="card">
  <h3>{profile.name}</h3>
  <p>{profile.bio.summary}</p>
</div>`,
    codeAfter: `<div className="card">
  <h3>{profile?.name}</h3>
  <p>{profile?.bio?.summary ?? "No bio available yet."}</p>
</div>`,
    fixSnippetOnly: `<p>{profile?.bio?.summary ?? "No bio available yet."}</p>`,
    whyThisWorks:
      "React components render immediately before network calls return. Optional chaining (?.) stops evaluation and returns undefined instead of throwing when 'profile' or 'bio' is not yet loaded, while the nullish coalescing operator (??) provides a clean beginner-friendly fallback message.",
    verificationSteps: [
      {
        id: 'react-step-1',
        instruction: "Add a quick conditional guard or skeleton loading state if profile is fetched via useEffect or SWR.",
        codeHint: "if (!profile) return <div>Loading profile...</div>;",
      },
      {
        id: 'react-step-2',
        instruction: "Test rendering UserCard with an incomplete user object to ensure no crash occurs:",
        codeHint: "<UserCard profile={{ name: 'Jordan' }} />",
      },
    ],
    docSources: [
      {
        title: 'Conditional Rendering in React',
        source: 'React Documentation (Official Guide)',
        summary: 'Techniques for rendering elements conditionally based on props, state, or loading states.',
        urlLabel: 'react.dev / learn / conditional-rendering',
      },
      {
        title: 'Handling Async Props & State',
        source: 'React Documentation (Reference)',
        summary: 'Best practices for managing component lifecycles while waiting for data.',
        urlLabel: 'react.dev / reference / react / useEffect',
      },
    ],
  },
};

export const CSS_SAMPLE_SCENARIO: SampleScenario = {
  id: 'css-zindex-stacking',
  label: 'CSS: z-index is not working / element stuck behind sibling',
  language: 'css',
  code: `.modal-overlay {
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
}

.header-banner {
  position: relative;
  z-index: 10;
}`,
  error: `Style Issue: .modal-overlay with z-index: 9999 is rendering underneath .header-banner`,
  analysis: {
    language: 'css',
    errorName: "CSS Stacking Context: z-index ignored on static element",
    likelyCause:
      "z-index only takes effect on positioned elements. The selector .modal-overlay has default position: static, so the browser ignores z-index: 9999 completely.",
    relevantLineNumber: 2,
    relevantSnippet: "z-index: 9999;",
    codeBefore: `.modal-overlay {
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
}`,
    codeAfter: `.modal-overlay {
  /* Position must be declared for z-index to create a stacking layer */
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
}`,
    fixSnippetOnly: `position: fixed; /* or position: relative / absolute */
z-index: 9999;`,
    whyThisWorks:
      "In CSS, the default positioning is 'static'. An element with position: static is laid out in the normal document flow and will not create a stacking context for z-index. Setting position: relative, absolute, fixed, or sticky activates the z-index property so the browser can calculate which element appears on top.",
    verificationSteps: [
      {
        id: 'css-step-1',
        instruction: "Inspect the element in DevTools and confirm computed position is no longer 'static'.",
      },
      {
        id: 'css-step-2',
        instruction: "Check if any parent container has 'overflow: hidden' or its own stacking context with lower z-index.",
      },
    ],
    docSources: [
      {
        title: 'z-index and Stacking Contexts',
        source: 'MDN Web Docs (CSS Guide)',
        summary: 'How browsers build 3D rendering layers along the z-axis based on position and isolation properties.',
        urlLabel: 'developer.mozilla.org / CSS / z-index',
      },
      {
        title: 'Understanding CSS Positioning',
        source: 'MDN Web Docs (Reference)',
        summary: 'Detailed explanation of static, relative, absolute, fixed, and sticky coordinate systems.',
        urlLabel: 'developer.mozilla.org / CSS / position',
      },
    ],
  },
};

export const ALL_SCENARIOS = [
  JAVASCRIPT_SAMPLE_SCENARIO,
  REACT_SAMPLE_SCENARIO,
  CSS_SAMPLE_SCENARIO,
];

/**
 * Returns the best matching analysis result. If the user modified the fields,
 * checks keywords, otherwise defaults reliably to the canonical JavaScript items.map analysis.
 */
export function getAnalysisForInput(
  language: FrameworkLanguage,
  code: string,
  errorText: string
): AnalysisResult {
  const combined = `${code} ${errorText}`.toLowerCase();

  // If user selected react or the code has JSX/React keywords
  if (language === 'react' || combined.includes('useeffect') || combined.includes('props') || combined.includes('jsx')) {
    if (combined.includes('summary') || combined.includes('profile')) {
      return REACT_SAMPLE_SCENARIO.analysis;
    }
  }

  // If user selected CSS
  if (language === 'css' || combined.includes('z-index') || combined.includes('position') || combined.includes('display: flex')) {
    return CSS_SAMPLE_SCENARIO.analysis;
  }

  // If user wrote custom javascript or left default
  if (combined.includes('map') || combined.includes('items') || combined.includes('undefined')) {
    return JAVASCRIPT_SAMPLE_SCENARIO.analysis;
  }

  // Dynamic fallback constructed cleanly around the user's input language
  return {
    ...JAVASCRIPT_SAMPLE_SCENARIO.analysis,
    language,
    errorName: errorText.trim().split('\n')[0] || "TypeError: Cannot read properties of undefined (reading 'map')",
  };
}
