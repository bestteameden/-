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

export const generateScript = async (info: AdvertiserInfo): Promise<ScriptResult> => {
  const ai = getAiClient();
  const prompt = `
    당신은 대한민국 상위 1% 뷰티 바이럴 전문 PD이자 대본 작가입니다. 
    에덴 마케팅의 성공 영상 98개를 전수 분석한 데이터 기반의 '백만 뷰 필승 공식'만을 사용하여 대본을 작성하세요.

    [광고주 정보]
    - 고객사: ${info.clientName}
    - 목적: ${info.purpose}
    - 타겟: ${info.targetAudience}
    - 핵심 메시지/카피라이트: ${info.keyMessage}
    - 특장점: ${info.usp}
    - 프로모션: ${info.promotion}
    - 제한사항: ${info.constraints}
    - 요청사항: ${info.requests}
    - 특별한 스토리: ${info.specialStory}

    [작성 규칙]
    1. 모든 문장은 공백 제외 18~20자 이내 (극도로 짧게)
    2. 전체 원고는 공백 포함 270~320자 이내 (밀도 극대화)
    3. 추상적 형용사(너무, 정말, 진짜) 절대 금지 -> 구체적 수치(1억, 350원, 3일)로 치환
    4. 30대 여성의 말투로 진행
    5. 도입부 3문장까지 제품명을 숨기고 '이것', '괴물템' 등으로 지칭
    6. "~~하시나요?" 같은 질문 대신 [부정/공포/폭로]형 후킹 사용
    7.설명조가 아닌 날것의 구어체 사용

    [결과물 구성]
    - intentAnalysis: 기획 의도 분석
    - strategyAnalysis: 전략 분석 (금기어 대체 등)
    - hookType: 선택된 18가지 후킹 전략 중 하나
    - flowType: 선택된 10가지 문맥 흐름 중 하나
    - charCount: 최종 원고 글자 수
    - fullScript: 최종 영상 원고 스크립트 (문단 구분 필수)
    - successPoints: 성공 포인트 3가지
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intentAnalysis: { type: Type.STRING },
            strategyAnalysis: { type: Type.STRING },
            hookType: { type: Type.STRING },
            flowType: { type: Type.STRING },
            charCount: { type: Type.INTEGER },
            fullScript: { type: Type.STRING },
            successPoints: { type: Type.STRING },
          },
          required: ["intentAnalysis", "strategyAnalysis", "hookType", "flowType", "charCount", "fullScript", "successPoints"]
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
    console.error("Gemini API Error (Script):", error);
    throw error;
  }
};

export const generateScenePlan = async (script: string, shotDb: Shot[]): Promise<ScenePlanItem[]> => {
  const ai = getAiClient();
  const shotDbString = JSON.stringify(shotDb);
  
  const prompt = `
    당신은 시각적 바이럴 공학 전문가입니다. 제공된 대본의 각 문장을 분석하여 시청자의 뇌가 반응하는 최적의 촬영 구도안을 매칭하세요.

    [대본]
    ${script}

    [가용 구도 DB]
    ${shotDbString}

    [규칙]
    1. 대본을 문장별로 분해하세요.
    2. 각 문장에 어울리는 구도를 DB에서 2개씩 골라 매칭하세요.
    3. 편집 기술이 아닌 모델의 신체 동작과 카메라 무빙만 기술하세요.
    4. 문장별로 sentenceId(1부터 시작), sentence(문장내용), recommendations(추천구도 2개) 정보를 포함하세요.
    5. 추천구도 안에는 shotName, description(상세 동작), link(DB의 원본 링크)를 포함하세요.
  `;

  try {
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
    console.error("Gemini API Error (Scene):", error);
    throw error;
  }
};