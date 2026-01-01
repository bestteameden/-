
export enum AppTab {
  SCRIPT_GENERATOR = 'SCRIPT_GENERATOR',
  SCENE_PLAN_MAKER = 'SCENE_PLAN_MAKER',
  ADMIN_PAGE = 'ADMIN_PAGE'
}

export interface Shot {
  id: string;
  category: string;
  name: string;
  action: string;
  description: string;
  link: string;
}

export interface AdvertiserInfo {
  clientName: string;
  purpose: string;
  targetAudience: string;
  keyMessage: string;
  usp: string;
  promotion: string;
  constraints: string;
  requests: string;
  specialStory: string;
}

export interface ScriptResult {
  intentAnalysis: string;
  strategyAnalysis: string;
  hookType: string;
  flowType: string;
  charCount: number;
  fullScript: string;
  successPoints: string;
}

export interface ScenePlanItem {
  sentenceId: number;
  sentence: string;
  recommendations: Array<{
    shotName: string;
    description: string;
    link: string;
  }>;
}
