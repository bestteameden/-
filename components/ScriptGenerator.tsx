
import React, { useState } from 'react';
import { AdvertiserInfo, ScriptResult } from '../types';
import { generateScript, tuneScript } from '../services/geminiService';

interface Props {
  onTransferToScene: (script: string) => void;
}

const ScriptGenerator: React.FC<Props> = ({ onTransferToScene }) => {
  const [mode, setMode] = useState<'CREATE' | 'TUNE'>('CREATE');

  // CREATE Mode State
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

  // TUNE Mode State
  const [tuningScript, setTuningScript] = useState('');

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

  const handleTune = async () => {
    if (!tuningScript.trim()) {
      alert('분석할 원본 대본을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await tuneScript(tuningScript);
      setResult(data);
      setActiveResultTab(0);
    } catch (error: any) {
       console.error(error);
       const msg = error.message || "알 수 없는 오류";
       alert(`대본 튜닝 실패: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <section className="bg-gray-950 border border-gray-800 rounded-2xl p-6 h-fit">
        <div className="flex bg-gray-900 rounded-xl p-1 mb-6">
            <button 
                onClick={() => setMode('CREATE')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'CREATE' ? 'bg-black text-[#87CEEB] shadow-md' : 'text-gray-500 hover:text-white'}`}
            >
                <i className="fas fa-magic mr-1"></i> 신규 대본 생성
            </button>
            <button 
                onClick={() => setMode('TUNE')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'TUNE' ? 'bg-black text-[#87CEEB] shadow-md' : 'text-gray-500 hover:text-white'}`}
            >
                <i className="fas fa-stethoscope mr-1"></i> 범용 대본 튜닝
            </button>
        </div>

        {mode === 'CREATE' ? (
            <div className="animate-fade-in">
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
            </div>
        ) : (
            <div className="animate-fade-in">
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <i className="fas fa-user-md text-[#87CEEB]"></i> EDEN 범용 대본 튜닝
                    </h2>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        뷰티, 건기식, 서비스 등 모든 산업군의 대본을 입력하세요.<br/>
                        '돈 벌어주는 숏폼' 공식에 맞춰 냉정하게 진단하고 튜닝합니다.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">기존 대본 입력 *</label>
                        <textarea 
                            value={tuningScript}
                            onChange={(e) => setTuningScript(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded-lg p-4 text-sm h-80 focus:border-[#87CEEB] outline-none font-mono leading-relaxed"
                            placeholder={`[예시 원고]
안녕하세요, 오늘 소개할 제품은...
(이런 지루한 대본을 넣어주세요)`}
                        />
                    </div>
                </div>

                <button 
                onClick={handleTune}
                disabled={loading}
                className="w-full bg-white text-black font-bold py-4 rounded-xl mt-8 hover:bg-[#87CEEB] transition-all flex items-center justify-center gap-2"
                >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-hammer"></i>}
                대본 심폐소생 튜닝하기
                </button>
            </div>
        )}
      </section>

      {/* Result Section */}
      <section className="bg-gray-950 border border-gray-800 rounded-2xl flex flex-col min-h-[600px] overflow-hidden">
        {!result ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-600">
            <i className="fas fa-file-alt text-6xl mb-4 opacity-20"></i>
            <p>정보를 입력하거나 대본을 넣으면<br/>바이럴 공학 기반 결과가 출력됩니다.</p>
          </div>
        ) : (
          <>
            <div className="flex bg-gray-900 border-b border-gray-800">
              {['기획/진단', '구성요소', '최종 원고', '성공포인트'].map((tab, idx) => (
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
                      <i className="fas fa-clipboard-check"></i> {mode === 'CREATE' ? '기획 의도 및 후킹 전략' : 'EDEN 진단 보고서 (점수표)'}
                    </h3>
                    <p className="bg-black p-5 border border-gray-800 rounded-xl text-sm leading-loose text-gray-300 whitespace-pre-wrap">
                      {result.hookStrategy}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[#87CEEB] font-bold mb-2 flex items-center gap-2">
                      <i className="fas fa-shield-alt"></i> {mode === 'CREATE' ? '금기어 대체 및 전문성' : '튜닝/피드백 요약'}
                    </h3>
                    <p className="bg-black p-5 border border-gray-800 rounded-xl text-sm leading-loose text-gray-300 whitespace-pre-wrap">
                      {result.keywordStrategy}
                    </p>
                  </div>
                </div>
              )}
              {activeResultTab === 1 && (
                <div className="animate-fade-in space-y-6">
                  <div className="bg-black p-6 border border-gray-800 rounded-xl">
                    <div className="text-gray-500 text-xs mb-1">첫문장 기법 (Hook)</div>
                    <div className="font-bold text-[#87CEEB] text-xl">{result.hookType}</div>
                  </div>
                  <div className="bg-black p-6 border border-gray-800 rounded-xl">
                    <div className="text-gray-500 text-xs mb-1">문맥 흐름 (Flow)</div>
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
                   <h3 className="text-[#87CEEB] font-bold mb-2 flex items-center gap-2">
                      <i className="fas fa-camera"></i> {mode === 'CREATE' ? '성공 포인트 3가지' : '시각적 바이럴 구도안'}
                   </h3>
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
