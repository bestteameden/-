import React, { useState } from 'react';
import { AdvertiserInfo, ScriptResult } from '../types';
import { generateScript } from '../services/geminiService';

interface Props {
  onTransferToScene: (script: string) => void;
}

const ScriptGenerator: React.FC<Props> = ({ onTransferToScene }) => {
  const [info, setInfo] = useState<AdvertiserInfo>({
    clientName: '',
    purpose: '',
    targetAudience: '',
    keyMessage: '',
    usp: '',
    promotion: '',
    constraints: '',
    requests: '',
    specialStory: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!info.clientName || !info.purpose) {
      alert('필수 정보를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await generateScript(info);
      setResult(data);
      setActiveResultTab(0);
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "알 수 없는 오류";
      alert(`대본 생성 실패: ${msg}\n(콘솔 로그를 확인해주세요)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <section className="bg-gray-950 border border-gray-800 rounded-2xl p-6 h-fit">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <i className="fas fa-edit text-[#87CEEB]"></i> 광고주 정보 입력
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">고객사 정보 *</label>
            <input 
              name="clientName" value={info.clientName} onChange={handleInputChange}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
              placeholder="예: 에덴 화장품 PDRN 앰플"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">제작 목적 *</label>
              <input 
                name="purpose" value={info.purpose} onChange={handleInputChange}
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                placeholder="예: 신규 고객 확보"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">타겟 오디언스</label>
              <input 
                name="targetAudience" value={info.targetAudience} onChange={handleInputChange}
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                placeholder="예: 30대 모공 고민녀"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">핵심 메시지/카피라이트</label>
            <textarea 
              name="keyMessage" value={info.keyMessage} onChange={handleInputChange}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm h-20 focus:border-[#87CEEB] outline-none"
              placeholder="광고주가 기재한 카피 (재구성해 드립니다)"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">서비스 특장점 (USP)</label>
            <textarea 
              name="usp" value={info.usp} onChange={handleInputChange}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm h-20 focus:border-[#87CEEB] outline-none"
              placeholder="경쟁사보다 우위에 있는 특징"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">프로모션 정보</label>
              <input 
                name="promotion" value={info.promotion} onChange={handleInputChange}
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                placeholder="예: 1+1 행사, 50% 할인"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">제한 사항</label>
              <input 
                name="constraints" value={info.constraints} onChange={handleInputChange}
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                placeholder="예: 시술 단어 사용 금지"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">바라는 점 / 특별 스토리</label>
            <textarea 
              name="specialStory" value={info.specialStory} onChange={handleInputChange}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm h-20 focus:border-[#87CEEB] outline-none"
              placeholder="서비스를 알릴만한 특별한 배경"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-4 rounded-xl mt-8 hover:bg-[#87CEEB] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
          AI 대본 생성하기
        </button>
      </section>

      {/* Result Section */}
      <section className="bg-gray-950 border border-gray-800 rounded-2xl flex flex-col min-h-[600px] overflow-hidden">
        {!result ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-600">
            <i className="fas fa-file-alt text-6xl mb-4 opacity-20"></i>
            <p>정보를 입력하고 생성 버튼을 누르면<br/>바이럴 공학 기반 대본이 출력됩니다.</p>
          </div>
        ) : (
          <>
            <div className="flex bg-gray-900 border-b border-gray-800">
              {['기획/전략', '구성요소', '원고', '성공포인트'].map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveResultTab(idx)}
                  className={`flex-1 py-4 text-xs font-bold transition-all ${activeResultTab === idx ? 'bg-black text-[#87CEEB] border-b-2 border-[#87CEEB]' : 'text-gray-500 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {activeResultTab === 0 && (
                <div className="animate-fade-in space-y-6">
                  <div>
                    <h3 className="text-[#87CEEB] font-bold mb-2 flex items-center gap-2">
                      <i className="fas fa-lightbulb"></i> 탭 1-1. 기획 의도 및 후킹 전략
                    </h3>
                    <p className="bg-black p-5 border border-gray-800 rounded-xl text-sm leading-loose text-gray-300">
                      {result.hookStrategy}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[#87CEEB] font-bold mb-2 flex items-center gap-2">
                      <i className="fas fa-shield-alt"></i> 탭 1-2. 금기어 대체 및 전문성
                    </h3>
                    <p className="bg-black p-5 border border-gray-800 rounded-xl text-sm leading-loose text-gray-300">
                      {result.keywordStrategy}
                    </p>
                  </div>
                </div>
              )}
              {activeResultTab === 1 && (
                <div className="animate-fade-in space-y-6">
                  <div className="bg-black p-6 border border-gray-800 rounded-xl">
                    <div className="text-gray-500 text-xs mb-1">첫문장 기법 (18 Hooks)</div>
                    <div className="font-bold text-[#87CEEB] text-xl">{result.hookType}</div>
                  </div>
                  <div className="bg-black p-6 border border-gray-800 rounded-xl">
                    <div className="text-gray-500 text-xs mb-1">문맥 흐름 (10 Flow Paths)</div>
                    <div className="font-bold text-[#87CEEB] text-xl">{result.flowType}</div>
                  </div>
                  <div className="bg-black p-6 border border-gray-800 rounded-xl">
                    <div className="text-gray-500 text-xs mb-1">공백 포함 글자수</div>
                    <div className="font-bold text-white text-xl">{result.charCount}자</div>
                  </div>
                </div>
              )}
              {activeResultTab === 2 && (
                <div className="animate-fade-in h-full">
                  <div className="bg-black p-6 border border-gray-800 rounded-xl font-medium text-lg leading-loose whitespace-pre-wrap font-mono h-full overflow-y-auto text-gray-200">
                    {result.fullScript}
                  </div>
                </div>
              )}
              {activeResultTab === 3 && (
                <div className="animate-fade-in">
                   <div className="bg-black p-6 border border-gray-800 rounded-xl text-sm leading-loose whitespace-pre-wrap text-gray-300">
                    {result.successPoints}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-950">
              <button 
                onClick={() => onTransferToScene(result.fullScript)}
                className="w-full bg-[#87CEEB] text-black font-bold py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#87CEEB]/10"
              >
                <i className="fas fa-video"></i> 이 대본으로 촬영 구도안 만들기
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ScriptGenerator;