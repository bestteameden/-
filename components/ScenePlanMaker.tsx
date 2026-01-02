import React, { useState, useEffect } from 'react';
import { ScenePlanItem, Shot } from '../types';
import { generateScenePlan } from '../services/geminiService';

interface Props {
  initialScript?: string;
  shotDb: Shot[];
}

const ScenePlanMaker: React.FC<Props> = ({ initialScript = '', shotDb }) => {
  const [script, setScript] = useState(initialScript);
  const [loading, setLoading] = useState(false);
  const [scenePlan, setScenePlan] = useState<ScenePlanItem[] | null>(null);

  useEffect(() => {
    if (initialScript) setScript(initialScript);
  }, [initialScript]);

  const handleGenerate = async () => {
    if (!script.trim()) {
      alert('분석할 대본을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await generateScenePlan(script, shotDb);
      setScenePlan(data);
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "알 수 없는 오류";
      alert(`구도안 생성 실패: ${msg}\n(콘솔 로그를 확인해주세요)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-video text-[#87CEEB]"></i> AI 촬영 구도 매칭
        </h2>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="문장별로 분석할 대본 스크립트를 입력하세요."
          className="w-full bg-black border border-gray-800 rounded-xl p-6 text-lg font-mono focus:border-[#87CEEB] outline-none min-h-[200px]"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-4 rounded-xl mt-6 hover:bg-[#87CEEB] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-project-diagram"></i>}
          구도안 분석 및 매칭 시작
        </button>
      </section>

      {scenePlan && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">영상 구성안 분석 결과</h3>
            <span className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              Total {scenePlan.length} Sequences
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {scenePlan.map((item, idx) => (
              <div key={idx} className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="p-4 border-b border-gray-800 flex items-center gap-4 bg-gray-900/50">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#87CEEB] text-black font-bold rounded-full text-xs">
                    {item.sentenceId}
                  </span>
                  <p className="font-bold flex-1">{item.sentence}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {item.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className={`p-6 ${rIdx === 0 ? 'border-r border-gray-800' : ''} hover:bg-black transition-colors group`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#87CEEB] font-bold text-sm">추천 구도 {rIdx + 1}</span>
                        <a 
                          href={rec.link} target="_blank" rel="noreferrer"
                          className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                        >
                          예시 보기 <i className="fas fa-external-link-alt"></i>
                        </a>
                      </div>
                      <h4 className="text-xl font-black mb-2 group-hover:text-[#87CEEB] transition-colors">
                        [{rec.shotName}]
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ScenePlanMaker;