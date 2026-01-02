
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
  hookStrategy: string;    // 탭 1-1. 후킹전략
  keywordStrategy: string; // 탭 1-2. 금기어 대체 및 전문성
  hookType: string;        // 탭 2. 첫문장 기법
  flowType: string;        // 탭 2. 문맥 흐름
  charCount: number;       // 탭 2. 글자수
  fullScript: string;      // 탭 3. 영상 통 대본
  successPoints: string;   // 탭 4. 성공 포인트
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