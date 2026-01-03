
export enum AppTab {
  SCRIPT_GENERATOR = 'SCRIPT_GENERATOR',
  SCENE_PLAN_MAKER = 'SCENE_PLAN_MAKER',
  META_CALCULATOR = 'META_CALCULATOR',
  PROPOSAL_GENERATOR = 'PROPOSAL_GENERATOR',
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

export interface MetaInputs {
  price: number;       // S (판매가)
  margin: number;      // M (개당 순마진)
  cpm: number;         // CPM
  ctr: number;         // CTR (%)
  cvr: number;         // CVR (%)
}

export interface MetaAnalysisResult {
  mode: 'ANALYSIS' | 'SIMULATION';
  
  // Fields for Full Analysis (mode === 'ANALYSIS')
  tableData?: {
    marginRate: string;
    endRoas: string;
    optRoas: string;
    mcvr: string;
    optCpc: string;
    currentRoi: string;
  };
  verdict?: {
    possible: boolean;
    reason: string;
  };
  recommendation?: {
    targetRoas: string;
    targetCpc: string;
    adjustment: string;
  };
  strategy?: {
    actionItems: string[];
  };

  // Fields for Simulation (mode === 'SIMULATION')
  simulation?: {
    survivalRoas: string;
    avgCpc: string;
    requiredCvr: string;
    scenarios: Array<{
      cpc: string;
      breakEvenCvr: string;
      profitableCvr: string;
    }>;
    advice: string;
  };
}

export interface ProposalInputs {
  clientName: string;
  searchVolume: [string, string, string, string]; // 4 months data
  mainProduct: string; // 주력 판매 상품
}
