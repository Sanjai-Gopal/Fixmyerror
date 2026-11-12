export type FrameworkLanguage = 'javascript' | 'react' | 'css';

export interface DocSource {
  title: string;
  source: string;
  summary: string;
  urlLabel: string;
}

export interface VerificationStep {
  id: string;
  instruction: string;
  codeHint?: string;
}

export interface AgentTraceStep {
  stage: string;
  thought: string;
  verdict: string;
}

export interface AnalysisResult {
  language: FrameworkLanguage;
  errorName: string;
  errorCategory?: string;
  likelyCause: string;
  relevantLineNumber?: number;
  relevantSnippet: string;
  codeBefore: string;
  codeAfter: string;
  fixSnippetOnly: string;
  whyThisWorks: string;
  verificationSteps: VerificationStep[];
  edgeCasesToWatch?: string;
  docSources: DocSource[];
  agentTrace?: AgentTraceStep[];
  suggestedQuestions?: string[];
  isLiveAgent?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  attachedCode?: string;
  attachedError?: string;
  language?: FrameworkLanguage;
  diagnosis?: AnalysisResult;
}

export interface SampleScenario {
  id: string;
  label: string;
  language: FrameworkLanguage;
  code: string;
  error: string;
  analysis: AnalysisResult;
}

export interface HistorySession {
  id: string;
  createdAt: number;
  formattedTime: string;
  language: FrameworkLanguage;
  code: string;
  errorText: string;
  errorTitle: string;
  analysisResult?: AnalysisResult | null;
}

