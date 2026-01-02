import { GoogleGenAI, Type } from "@google/genai";
import { AdvertiserInfo, ScriptResult, ScenePlanItem, Shot } from "../types";

// Helper to clean markdown code blocks from response
const cleanJsonText = (text: string): string => {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    // Remove opening ```json or ``` and closing ```
    clean = clean.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
  }
  return clean;
};

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

# [Rule 1-A: 부정형 타격 및 손실 회피 화법 (Negative Power Phrasing)]

## 1. 3대 금기 사항 (Zero Tolerance)
- "~~하신가요?" 같은 친절한 질문 금지 -> "~~하는 사람? 다 틀렸음!!" (공격적 확정형)
- "~~하면 좋아요" 같은 권유 금지 -> "~~안 하면 무조건 손해임" (손실 강조형)
- "이 제품 어떠세요?" 같은 광고적 멘트 금지 -> "이거 모르면 평생 고생함" (위기 조성형)

## 2. 부정형 어미 강제 매칭 테이블 (Sentence Ending Logic)
원고의 흐름에 따라 아래 어미를 강제로 매칭하여 사용한다.
- [경고 구간]: ~하지 마세요(X) -> [~하지 마], [~지 마라], [~면 피부 망가짐], [~면 썩음]
- [상식 파괴]: ~가 아닙니다(X) -> [~아냐], [~다 틀렸어], [~순 뻥이야], [~다 거짓말임]
- [결과 강조]: ~가 좋아집니다(X) -> [~면 전멸함], [~면 삭제됨], [~로 종결임], [~면 끝남]
- [행동 촉구]: ~해 보세요(X) -> [~당장 바꿔], [~쟁여둬], [~안 하면 손해], [~짤없음]

## 3. 상황별 부정형 후킹 템플릿 (98개 영상 분석 기반)
다음 패턴 중 하나를 반드시 첫 문장에 배치한다.
- [습관 부정]: "아직도 ~~해? 돈 바닥에 버리는 중임!!"
- [지식 부정]: "네가 아는 ~~? 그거 사실 다 거짓말이야!!"
- [결과 부정]: "비싼 ~~ 발라봤자 효과 1도 없는 이유 알려줌!!"
- [행동 금지]: "피부과 가기 전 이 영상 안 보면 무조건 후회함!!"

## 4. 언어 정화(Purification) 금지
- AI가 문장을 정중하게 순화하려는 시도를 차단한다. 
- "떡칠", "박멸", "똥손", "뒤집어짐", "전멸", "삭제"와 같은 날것의 단어를 의도적으로 유지한다.

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
    // Reverted to gemini-3-pro-preview for highest quality analysis
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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