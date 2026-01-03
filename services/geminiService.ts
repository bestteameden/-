import { GoogleGenAI, Type } from "@google/genai";
import { AdvertiserInfo, ScriptResult, ScenePlanItem, Shot, MetaInputs, MetaAnalysisResult, ProposalInputs } from "../types";

// Helper to clean markdown code blocks from response
const cleanJsonText = (text: string): string => {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    // Remove opening ```json or ``` and closing ```
    clean = clean.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
  }
  return clean;
};

// Helper to clean HTML code blocks
const cleanHtmlText = (text: string): string => {
  let clean = text.trim();
  // Match code blocks like ```html ... ``` or just ``` ... ```
  if (clean.startsWith("```")) {
     clean = clean.replace(/^```(html)?\n?/, "").replace(/\n?```$/, "");
  }
  return clean;
}

// Validate API Key before usage
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error(
      "API Key가 없습니다.\n\n" +
      "1. Vercel Settings > Environment Variables 메뉴로 이동하세요.\n" +
      "2. 'API_KEY' (또는 'VITE_API_KEY') 이름으로 Gemini API 키를 추가하세요.\n" +
      "3. 'Redeploy'를 눌러 사이트를 다시 배포해주세요."
    );
  }
  return new GoogleGenAI({ apiKey });
};

// Common error handler
const handleApiError = (error: any, context: string) => {
  console.error(`Gemini API Error (${context}):`, error);
  const errStr = error.toString();
  
  if (errStr.includes("429") || errStr.includes("Quota exceeded") || errStr.includes("RESOURCE_EXHAUSTED")) {
    throw new Error(
      "⚠️ 구글 API 사용 한도가 초과되었습니다.\n" +
      "(Quota Exceeded / 429 Error)\n\n" +
      "현재 무료 버전을 사용 중이시라면 한도에 도달했습니다.\n" +
      "Google AI Studio에서 결제(Billing)를 등록하여 유료 계정으로 전환하면 해결됩니다."
    );
  }
  
  if (errStr.includes("API key not valid")) {
     throw new Error("API Key가 올바르지 않습니다. Vercel 설정을 확인해주세요.");
  }

  throw error;
};

export const generateScript = async (info: AdvertiserInfo): Promise<ScriptResult> => {
  const ai = getAiClient();
  const prompt = `
# 원고가이드 [Role]
당신은 대한민국 상위 1% 뷰티 바이럴 전문 PD이자 대본 작가입니다. 
에덴 마케팅의 성공 영상 98개를 전수 분석한 데이터 기반의 '백만 뷰 필승 공식'만을 사용하여 대본을 작성합니다.

[광고주 정보]
- 고객사: ${info.clientName}
- 목적: ${info.purpose}
- 타겟: ${info.targetAudience}
- 핵심 메시지: ${info.keyMessage}
- 특장점(USP): ${info.usp}
- 프로모션: ${info.promotion}
- 제한사항: ${info.constraints}
- 요청사항: ${info.requests}
- 특별한 스토리: ${info.specialStory}

# [Knowledge Base: 98개 영상 분석 요약]
1. 시청자는 '정보'가 아닌 '시각적 쾌감'과 '가치 전도(가성비)'에 반응한다.
2. 3초 이내에 타겟의 페르소나를 호명하거나 공포/이득을 제시해야 이탈하지 않는다.
3. 숫자는 형용사보다 강력하다. (예: '정말 싸다' 대신 '350원')
4. 문장이 길어지면 뇌는 읽기를 포기한다. 호흡은 최대한 짧게 가져간다.

# [Rule 1: 대본 생성 절대 공식 (The Eden Rules)]
1. 문장 길이: 모든 문장은 공백 제외 18~20자 이내로 작성한다. (호흡을 극도로 짧게 유지)
2. 원고 분량: 전체 원고는 공백 포함 270-320자 이내로 제한한다. (정보 밀도 극대화)
3. 언어 선택: '너무', '정말', '진짜', '대박' 같은 추상적 형용사를 절대 금지한다.
   - 대체제: 반드시 '1억', '350원', '3일', '8년 차', '1위' 등 구체적인 [수치]와 [명사]로 정보를 치환한다.
4. 감정 표현: !!, !?, ..., ?? 등의 기호를 적절하게 활용하여 내레이션의 강약과 감정선을 텍스트에 투영한다. 너무 많은 사용은 지양한다.
5. 구조 분리: 문맥이 전환될 때마다(도입-증명-결말) 반드시 문단을 나누어 가독성을 확보한다.
6. Rule 2의 후킹 전략 중 하나를 선택해서 진행한다. 그 외는 쓰지 않는다. 
7. Rule 3의 문맥의 흐름 중 하나를 선택 해서 진행한다. 그 외는 쓰지 않는다. 
8. 말투는 30대 여성의 말투로 진행한다.

# [Rule 1-A: 부정형 타격 및 가치 전도]
1. 착한 질문 금지: "~~하시나요?" -> "~~하는 사람? 돈 바닥에 버리는 중임!!" (행동 제어)
2. 내부자 밀고: "이 제품은 ~가 좋습니다" -> "이거 샵 원장님들만 몰래 쓰던 치트키임!!" (비밀 폭로)
3. 가치 전도: "20% 할인해요" -> "십만 원대 시술 효과를 단돈 이만 원대에!!" (이득 극대화)
4. 단어 필터: '정리/개선'이 보이면 즉시 '삭제/전멸/박멸'로 교체한다.

# [Rule 2: 첫 문장 필승 후킹 (18 Hooks)]
광고주 정보를 분석하여 아래 18가지 중 가장 적합한 기법 하나를 선택해 시작한다.
(상식파괴, 손실회피, 결과선공개, 금지/비밀, 논쟁/반박, 경험/권위, 내부자증언, 대비효과, 실험/검증, 긴급성, 타겟저격, 시각적질문, 오해깨기, 구조공식, 사회적증명, 가격충격, 약속/보장, 캐릭터훅)

# [Rule 3: 문맥의 흐름 (10 Flow Paths)]
후킹 이후의 흐름은 분석 데이터 기반의 다음 경로 중 하나를 따른다.
(가성비전도, 시각카타르시스, 내부자밀고, 제3자증명, 상식재구성, 고통-구원, 전문기술, 시계열신뢰, TPO밀착, 상징적투자)

# [Step-by-Step Task]
1. 광고주 정보를 분석하여 타겟의 '가장 아픈 결핍'을 파악한다.
2. [Rule 2] 후킹 작성 시, "~~하시나요?" 같은 착한 질문이 나오면 즉시 [부정/공포/폭로]형으로 재작성한다. [Rule 3]의 경로로 문맥을 짠다.
3. [Rule 1]의 '20자/300~400자/형용사 3% 제한' 규격을 엄격히 검수한다.
4. 모든 형용사적 표현을 최대한 [수치] 데이터로 치환하여 최종 원고를 낸다.
5. 문장에서 어려운 말은 최대한 지양한다. 중학생이 봐도 이해할 수 있게 쉬운 단어로 대체한다.
6. 광고주 정보에서 원하는 니즈를 파악하고 원고를 쓰되, 에덴의 데이터 베이스의 정보를 우선해서 제작한다.
7. rule 2, Rule 3 안의 정보로만 활동했는지 체크 하고, 아닌 경우 다시 rule 2, rule3의 정보로만 입력한다.
8. "효과가 없으니 바꿔보세요" 같은 정중한 권유는 절대 하지 않는다.
9. 공포와 폭로: "돈 바닥에 버리는 중임!!", "원장님만 아는 비결 폭로함"처럼 시청자의 방어기제를 즉시 무너뜨리는 '독한 워딩'을 사용한다.
10. 제품명 은닉: 도입부 3문장까지 제품명을 숨기고 '이것', '괴물템', '그 비결'로 지칭하여 호기심을 극대화한다.
11. [Rule 3] 흐름에 따라 작성하되, 설명조의 문장이 있으면 '날것의 구어체'로 바꾼다.

[결과물 JSON 필드 가이드]
- hookStrategy: 탭 1-1. 후킹전략 (예: "손실회피 : 기존 화장품에 실망했던 심리를 자극...")
- keywordStrategy: 탭 1-2. 금기어 대체 및 전문성 (예: "침투 니들을 '흡수길'로 치환하여...")
- hookType: 탭 2. 선택된 첫문장 기법 (예: "상식파괴")
- flowType: 탭 2. 선택된 문맥 흐름 (예: "가성비전도")
- charCount: 탭 2. 공백 포함 글자수 (숫자만)
- fullScript: 탭 3. 영상 통 대본 (문단 구분 필수, 오직 스크립트 내용만)
- successPoints: 탭 4. 성공 포인트 3가지
  `;

  try {
    // Reverted to gemini-3-pro-preview for highest quality analysis
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hookStrategy: { type: Type.STRING, description: "탭 1-1. 후킹전략 분석 내용" },
            keywordStrategy: { type: Type.STRING, description: "탭 1-2. 금기어 대체 및 전문성 전략 내용" },
            hookType: { type: Type.STRING, description: "선택된 첫문장 후킹 기법 이름" },
            flowType: { type: Type.STRING, description: "선택된 문맥 흐름 이름" },
            charCount: { type: Type.INTEGER, description: "공백 포함 총 글자 수" },
            fullScript: { type: Type.STRING, description: "최종 영상 대본 본문" },
            successPoints: { type: Type.STRING, description: "성공 포인트 분석" },
          },
          required: ["hookStrategy", "keywordStrategy", "hookType", "flowType", "charCount", "fullScript", "successPoints"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned empty response");
    }

    console.log("Raw Script Response:", text); // Debugging

    try {
      const cleanText = cleanJsonText(text);
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Text content:", text);
      throw new Error("AI 응답을 분석하는 중 오류가 발생했습니다. (JSON Parsing Error)");
    }

  } catch (error) {
    handleApiError(error, "Script");
    throw error; 
  }
};

export const generateScenePlan = async (script: string, shotDb: Shot[]): Promise<ScenePlanItem[]> => {
  const ai = getAiClient();
  const shotDbString = JSON.stringify(shotDb);
  
  const prompt = `
# [Role]
당신은 에덴 마케팅의 성공 영상 98개를 전수 분석한 데이터를 보유한 '시각적 바이럴 공학 전문가'입니다. 
제공된 대본의 각 문장을 분석하여 시청자의 뇌가 반응하는 최적의 촬영 구도안을 매칭합니다.

[대본]
${script}

[가용 구도 DB (Knowledge Base)]
${shotDbString}

# [Section 1: 구도 매칭 절대 가이드]
1. 문장별 분해: 대본을 한 문장씩 뜯어서 각 문장에 가장 어울리는 구도를 [2개씩] 제안한다.
2. 직관적 액션: 모델이 즉각 이해할 수 있는 단순하고 강렬한 동작 위주로 전달한다.
3. 편집 배제: "줌인 효과", "자막 넣기" 등 편집 기술이 아닌, 촬영 현장에서의 [카메라 무빙]과 [모델의 신체 동작]만 기술한다.
4. 예시 링크: 추천 구도 정보에 DB의 원본 링크를 반드시 포함한다.
5. 흐름 검수: 촬영 구도안 작성이 완료되면 영상 흐름상 어색함이 없는지 다시 한번 체크한다.

# [System Logic: 상세 분석 예시]
원고: 피부과 원장님이 다시는 오지 말래요..!
AI 추천 영상 구도 Logic:
1. [거절 손짓] - 카메라를 향해 단호하게 손바닥을 내밀며 고개를 젓는 동작.
2. [충격 리액션] - 원장님의 말을 듣고 억울해하며 카메라 앞에서 뒤로 움찔 물러나는 동작.

[Output Format]
Provide the result strictly in JSON format matching the schema below, but following the logic above.
  `;

  try {
    // Switched to gemini-3-flash-preview for faster processing of large JSON responses
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sentenceId: { type: Type.INTEGER },
              sentence: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    shotName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    link: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned empty response");
    }

    console.log("Raw Scene Response:", text); // Debugging

    try {
      const cleanText = cleanJsonText(text);
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Text content:", text);
      throw new Error("AI 응답을 분석하는 중 오류가 발생했습니다. (JSON Parsing Error)");
    }

  } catch (error) {
    handleApiError(error, "Scene");
    throw error;
  }
};

export const generateMetaAnalysis = async (inputs: MetaInputs): Promise<MetaAnalysisResult> => {
  const ai = getAiClient();
  const prompt = `
# [Role]
당신은 메타(Meta) 퍼포먼스 마케팅 데이터 분석 전문가입니다. 
감이나 추측이 아닌 "수식 → 계산 → 논리 → 결론"의 과정을 통해 광고주의 상품이 광고 가능한 구조인지 진단하고, 최적의 비딩 값과 운영 전략을 제안합니다.

[Input Data]
- S (Price, 판매가): ${inputs.price}원
- M (Margin, 개당 순마진): ${inputs.margin}원
- CPM (노출당 비용): ${inputs.cpm}원 (0 indicates missing data)
- CTR (클릭률): ${inputs.ctr}% (0 indicates missing data)
- CVR (전환율): ${inputs.cvr}% (0 indicates missing data)

# [Section 1: 핵심 변수 및 수식 정의 (The Meta Math)]
1. CPC (Click Cost): CPM / (1000 * (CTR/100))
2. MCVR (Max CPC Capacity): M * (CVR/100) (손해 안 보는 클릭당 최대 비용 한계치)
3. EndROAS (Breakeven ROAS): S / M (손익분기점 ROAS)
4. OptROAS (Optimal ROAS): 2 * EndROAS (순이익 최대화를 위한 목표치)
5. OptCPC: MCVR / 2 (이론상 순이익이 극대화되는 CPC)
6. MaxROI_ad: MCVR / ActualCPC (1보다 낮으면 구조적 적자)

# [Section 2: 광고 적합성 진단 로직]
(Perform this ONLY if CPM/CTR/CVR are provided)
1. [구조적 진단]: MCVR(MaxCPC)이 현재 매체 평균 CPC보다 낮은가?
   - YES: 광고를 돌릴수록 손해인 구조.
   - NO: 광고 집행 가능. 최적화 구간 탐색 시작.
2. [ROAS 구간 판단]:
   - 목표 ROAS < EndROAS: 시장 점유 및 데이터 확보를 위한 '공격형 손해' 구간.
   - 목표 ROAS = EndROAS: 수익 없이 매출 볼륨만 키우는 '규모 확장' 구간.
   - 목표 ROAS = OptROAS: 기업의 순수익이 가장 많이 남는 '알짜 경영' 구간.

# [Section 3: 메타 특화 전략 수립 (CTR/CVR 기준)]
(Perform this ONLY if CPM/CTR/CVR are provided)
1. [CTR 높음 / CVR 낮음]: 콘텐츠 후킹은 성공했으나, 상세페이지나 랜딩페이지에서 이탈.
   - 전략: 상세페이지 UI/UX 개선, 이벤트/혜택 강조, 리마케팅(DABA) 비중 확대.
2. [CTR 낮음 / CVR 높음]: 상품성은 검증됐으나, 광고 소재(Creative)가 매력이 없음.
   - 전략: 에덴 98개 영상 분석 로직 적용, 후킹(Hook) 교체, 소재 다각화(이미지 vs 영상).
3. [둘 다 낮음]: 상품성 부재 또는 타겟팅 완전 오류. 
   - 전략: 광고 즉시 중단 및 상품 기획 재검토.

# [Section 5: 광고 집행 전 시뮬레이션 (Pre-Ad Simulation)]
(Perform this ONLY if CPM/CTR/CVR are missing or zero. User provided only S and M)

1. [생존 하한선 계산]:
   - EndROAS (S / M)를 계산하여 "절대 넘지 말아야 할 광고비 비중"을 경고한다.
   
2. [필수 KPI 역산]:
   - 메타 뷰티 평균 CPC(600원)를 가성 데이터로 대입하여 [필요 CVR]을 역산한다.
   - 수식: Required CVR = 600 / M
   - 결론 도출: "상세페이지에서 최소 00%의 전환율을 뽑아낼 자신이 없다면 광고 집행을 재고해야 합니다."

3. [광고비 효율 시뮬레이션 표 출력]:
   - CPC가 400원, 700원, 1000원일 때 각각 필요한 [손익분기 CVR]과 [수익 발생 CVR]을 표로 보여준다.
   - Breakeven CVR = CPC / M
   - Profitable CVR = (CPC * 2) / M (Assuming OptROAS goal)

4. [전략적 조언]:
   - 집행 전이라면 광고 소재(에덴 98개 로직)로 CTR을 높여 CPC를 낮출 것인지, 
   - 아니면 상세페이지 개선으로 CVR을 높여 MaxCPC 한계치를 높일 것인지 우선순위를 제안한다.

# [Section 4: 응답 프로세스 및 출력 양식]
Analyze the provided input data.
IF CPM, CTR, and CVR are provided (> 0), set 'mode' to 'ANALYSIS' and fill 'tableData', 'verdict', 'recommendation', 'strategy'. Leave 'simulation' null.
IF CPM, CTR, or CVR are missing (0), set 'mode' to 'SIMULATION' and fill 'simulation'. Leave other fields null.

[Output Format]
Provide the result strictly in JSON format matching the schema below.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mode: { type: Type.STRING, enum: ["ANALYSIS", "SIMULATION"] },
            
            // Full Analysis Fields
            tableData: {
              type: Type.OBJECT,
              properties: {
                marginRate: { type: Type.STRING },
                endRoas: { type: Type.STRING },
                optRoas: { type: Type.STRING },
                mcvr: { type: Type.STRING },
                optCpc: { type: Type.STRING },
                currentRoi: { type: Type.STRING }
              },
              nullable: true
            },
            verdict: {
              type: Type.OBJECT,
              properties: {
                possible: { type: Type.BOOLEAN },
                reason: { type: Type.STRING }
              },
              nullable: true
            },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                targetRoas: { type: Type.STRING },
                targetCpc: { type: Type.STRING },
                adjustment: { type: Type.STRING }
              },
              nullable: true
            },
            strategy: {
              type: Type.OBJECT,
              properties: {
                actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              nullable: true
            },

            // Simulation Fields
            simulation: {
              type: Type.OBJECT,
              properties: {
                survivalRoas: { type: Type.STRING, description: "생존 하한선 ROAS (EndROAS)" },
                avgCpc: { type: Type.STRING, description: "기준 평균 CPC (600원)" },
                requiredCvr: { type: Type.STRING, description: "필요 전환율 (600원 기준)" },
                scenarios: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      cpc: { type: Type.STRING },
                      breakEvenCvr: { type: Type.STRING },
                      profitableCvr: { type: Type.STRING }
                    }
                  }
                },
                advice: { type: Type.STRING, description: "전략적 조언" }
              },
              nullable: true
            }
          },
          required: ["mode"]
        },
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned empty response");
    }

    try {
      const cleanText = cleanJsonText(text);
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("AI 응답을 분석하는 중 오류가 발생했습니다.");
    }

  } catch (error) {
    handleApiError(error, "Meta Analysis");
    throw error;
  }
};

export const generateProposal = async (inputs: ProposalInputs): Promise<string> => {
    const ai = getAiClient();

    // Prepare variables
    const searchDataStr = JSON.stringify(inputs.searchVolume.map(v => Number(v)));
    const dateStr = new Date().toLocaleDateString();

    const prompt = `
  # [Role]
  You are an Expert Web Developer. Generate a **complete, standalone HTML5 file** that serves as a high-end marketing proposal.
  The user wants to **PRINT this HTML as a PDF (A4 size)**.
  
  # [Input Data]
  - Client Name: ${inputs.clientName}
  - Main Product: ${inputs.mainProduct}
  - Search Volume Data: ${searchDataStr}
  - Date: ${dateStr}

  # [Mandatory Content Narrative]
  1. **Language**: Use **Korean** for 90% of the content (descriptions, diagnosis). Use **English** for 10% (Headlines, Keywords, Status) to look professional.
  2. **Section 1 (Cover)**: Client Name, Date.
  3. **Section 2 (Awareness)**: Analyze the search volume trend of "${inputs.mainProduct}" or the brand. 
     - If trend is up: "Interest is rising, but sales are not exploding? Diagnosis: Conversion Deficiency."
     - If trend is down: "Brand awareness is fading. Diagnosis: Need new viral injection."
  4. **Section 3 (Market Context - The Logic)**: 
     - **"RED OCEAN"**: State that the current beauty market is saturated.
     - **"MCN BUBBLE"**: Existing MCNs have high costs, low ROI, and bubble prices. They focus on influencers who don't convert.
     - **"EDEN SOLUTION"**: We use 100 Million+ View Data & Viral Engineering. We focus on "Visual Dopamine" and "Cost-Effectiveness".
  5. **Section 4 (EDEN Service Packages)**: **MUST** include this exact pricing table (Do not change prices):
     - **Option 1**: Nano Influencers (3 people) + Planning/Shooting/Editing (3 Shorts) = **600,000 KRW**
     - **Option 2**: Nano Influencers (5 people) + Planning/Shooting/Editing (5 Shorts) = **1,000,000 KRW**
     - **Option 3**: Nano Influencers (10 people) + Planning/Shooting/Editing (10 Shorts) = **2,000,000 KRW**
     - *Key Selling Point*: "EDEN handles EVERYTHING (Planning, Recruiting, Shooting, Editing)."
  6. **Section 5 (Contact)**:
     - **Agency**: EDEN MARKETING
     - **Email**: bestteameden@gmail.com
     - **Contact**: 010-4036-0525

  # [CRITICAL Technical Requirement: A4 Print & Dark Mode]
  The user is complaining that **the background turns WHITE** and **layout breaks** when printing.
  YOU MUST FIX THIS by enforcing STRICT print styles.
  
  1. **@media print**:
     - \`@page { size: A4; margin: 0; }\`
     - \`html, body { width: 210mm; height: 297mm; background-color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; }\`
     - \`section { width: 210mm !important; height: 297mm !important; max-height: 297mm !important; page-break-after: always; background-color: #000000 !important; color: #ffffff !important; display: flex !important; flex-direction: column !important; justify-content: center !important; overflow: hidden !important; border: none !important; }\`
     - **Fix Overlapping Prices**: Use \`display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 10px !important;\` for the pricing container. Ensure font size is reduced for price cards (\`font-size: 10pt !important\`). If 3 columns are too tight, stack them? No, user prefers the table. Just ensure small font and no padding overflow.
     - **Typography**: Force font sizes to fit A4. \`h1 { font-size: 32pt !important; margin-bottom: 10mm !important; } h2 { font-size: 24pt !important; margin-bottom: 5mm !important; } p { font-size: 11pt !important; color: #ccc !important; }\`
     - **Hide Elements**: \`button, .no-print, nav, header, footer, .fa-chevron-down { display: none !important; }\`
     - **Canvas**: \`canvas { max-width: 100% !important; max-height: 80mm !important; }\`

  2. **Structure**: Single HTML string. No external markdown.
  3. **Theme**: Dark Mode (#000000) with Neon Green (#00FF41) accents.

  # [HTML Structure Template]
  \`\`\`html
  <!DOCTYPE html>
  <html lang="ko">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EDEN REPORT | ${inputs.clientName}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/variable/pretendardvariable.css" />
      <style>
          body { font-family: 'Pretendard Variable', sans-serif; background-color: #000; color: #fff; margin: 0; }
          section { min-height: 100vh; padding: 40px; border-bottom: 1px solid #111; display: flex; flex-direction: column; justify-content: center; position: relative; }
          .glass { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 20px; }
          .accent { color: #00FF41; }
          .bg-accent { background-color: #00FF41; color: #000; }
          table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
          th, td { padding: 15px; text-align: left; }
          th { color: #888; border-bottom: 1px solid #333; }
          td { background: rgba(255,255,255,0.03); }
          .price-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; text-align: center; }
          .price-tag { font-size: 1.5rem; font-weight: bold; color: #00FF41; margin-top: 10px; }
          
          /* STRICT PRINT STYLES */
          @media print {
              @page { size: A4; margin: 0; }
              html, body {
                  width: 210mm; height: 297mm;
                  background-color: #000000 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  margin: 0 !important; padding: 0 !important;
              }
              section { 
                  width: 210mm !important; height: 297mm !important;
                  max-height: 297mm !important;
                  page-break-after: always; 
                  page-break-inside: avoid;
                  background-color: #000000 !important;
                  color: #ffffff !important;
                  padding: 15mm !important;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: center !important;
                  overflow: hidden !important;
                  border: none !important;
              }
              .no-print, .animate-bounce, button, .fa-chevron-down { display: none !important; }
              canvas { max-height: 300px !important; width: 100% !important; }
              h1 { font-size: 32pt !important; margin-bottom: 10mm !important; }
              h2 { font-size: 24pt !important; margin-bottom: 5mm !important; }
              p, li, td { font-size: 11pt !important; color: #e5e5e5 !important; }
              .price-card { background-color: #111 !important; border: 1px solid #333 !important; font-size: 10pt !important; padding: 10px !important; }
              .price-tag { font-size: 14pt !important; }
              .grid-cols-3 { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 10px !important; }
          }
      </style>
  </head>
  <body>
      <!-- Section 1: Cover -->
      <section>
          <!-- Title, Client Name, Date -->
      </section>
      
      <!-- Section 2: Awareness (Search Volume) -->
      <section>
          <!-- Chart -->
          <!-- Diagnosis: Saturated Market, Red Ocean -->
      </section>

      <!-- Section 3: The Logic (Red Ocean -> MCN Problems -> Eden Solution) -->
      <section>
           <!-- Content about MCN Bubble and Eden's 100M Views -->
      </section>
      
      <!-- Section 4: Service Packages (Pricing Table) -->
      <section>
          <h2 class="text-4xl font-bold mb-10 text-center italic">EDEN <span class="accent">SERVICE PLANS</span></h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 grid-cols-3">
              <!-- Option 1: 3 People / 600k -->
              <!-- Option 2: 5 People / 1m -->
              <!-- Option 3: 10 People / 2m -->
          </div>
      </section>

      <!-- Section 5: Contact -->
      <section>
           <!-- Updated Contact Info: EDEN MARKETING, bestteameden@gmail.com, 010-4036-0525 -->
      </section>

      <script>/* Chart.js logic */</script>
  </body>
  </html>
  \`\`\`
  `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
  
      const text = response.text;
      if (!text) {
        throw new Error("AI returned empty response");
      }
      return cleanHtmlText(text);
  
    } catch (error) {
      handleApiError(error, "Proposal Generation");
      throw error;
    }
  };
