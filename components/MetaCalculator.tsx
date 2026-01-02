
import React, { useState } from 'react';
import { MetaInputs, MetaAnalysisResult } from '../types';
import { generateMetaAnalysis } from '../services/geminiService';

const MetaCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<MetaInputs>({
    price: 0,
    margin: 0,
    cpm: 0,
    ctr: 0,
    cvr: 0
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MetaAnalysisResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleAnalyze = async () => {
    if (!inputs.price || !inputs.margin) {
      alert('판매가(S)와 마진(M)은 필수 입력값입니다.');
      return;
    }
    setLoading(true);
    try {
      const data = await generateMetaAnalysis(inputs);
      setResult(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <section className="bg-gray-950 border border-gray-800 rounded-2xl p-6 h-fit">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <i className="fas fa-calculator text-[#87CEEB]"></i> 메타 핵심 변수 입력
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">S: 판매가 (원) *</label>
              <input 
                type="number" name="price" value={inputs.price || ''} onChange={handleInputChange}
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none font-mono"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">M: 개당 순마진 (원) *</label>
              <input 
                type="number" name="margin" value={inputs.margin || ''} onChange={handleInputChange}
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none font-mono"
                placeholder="0"
              />
            </div>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">
             <h3 className="text-xs text-[#87CEEB] font-bold mb-3">현재 광고 성과 (선택 사항)</h3>
             <p className="text-[10px] text-gray-400 mb-3">
                * 입력하지 않으면 '집행 전 시뮬레이션 모드'로 작동합니다.
             </p>
             <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CPM (노출당 비용, 원)</label>
                  <input 
                    type="number" name="cpm" value={inputs.cpm || ''} onChange={handleInputChange}
                    className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none font-mono"
                    placeholder="미입력 시 시뮬레이션 전환"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CTR (클릭률, %)</label>
                      <input 
                        type="number" step="0.01" name="ctr" value={inputs.ctr || ''} onChange={handleInputChange}
                        className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none font-mono"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CVR (전환율, %)</label>
                      <input 
                        type="number" step="0.01" name="cvr" value={inputs.cvr || ''} onChange={handleInputChange}
                        className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none font-mono"
                        placeholder="0.00"
                      />
                    </div>
                </div>
             </div>
          </div>
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-4 rounded-xl mt-8 hover:bg-[#87CEEB] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search-dollar"></i>}
          {(!inputs.cpm || !inputs.ctr || !inputs.cvr) ? '광고 집행 전 시뮬레이션 돌리기' : '최적값 진단 및 전략 도출'}
        </button>
      </section>

      {/* Result Section */}
      <section className="bg-gray-950 border border-gray-800 rounded-2xl flex flex-col min-h-[600px] overflow-hidden">
        {!result ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-600">
            <i className="fas fa-chart-line text-6xl mb-4 opacity-20"></i>
            <p>데이터를 입력하면 '퍼포먼스 마케팅 전문가'가<br/>최적의 운영 전략을 계산해 드립니다.</p>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto space-y-8 animate-fade-in">
            
            {/* Mode 1: Full Analysis */}
            {result.mode === 'ANALYSIS' && result.tableData && result.verdict && result.recommendation && result.strategy && (
              <>
                {/* 1. Verdict */}
                <div className={`p-4 rounded-xl border flex items-start gap-4 ${result.verdict.possible ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                    <div className={`mt-1 text-xl ${result.verdict.possible ? 'text-green-500' : 'text-red-500'}`}>
                        <i className={`fas ${result.verdict.possible ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg mb-1 ${result.verdict.possible ? 'text-green-400' : 'text-red-400'}`}>
                            {result.verdict.possible ? '광고 집행 가능 (Green Light)' : '광고 집행 위험 (Red Light)'}
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed">{result.verdict.reason}</p>
                    </div>
                </div>

                {/* 2. Calculated Table */}
                <div>
                    <h3 className="text-[#87CEEB] font-bold mb-3 flex items-center gap-2 text-sm">
                      <i className="fas fa-table"></i> 1단계: 정밀 데이터 분석
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-black p-4 rounded-lg border border-gray-800 text-center">
                            <div className="text-gray-500 text-xs mb-1">마진율</div>
                            <div className="font-mono font-bold text-white">{result.tableData.marginRate}</div>
                        </div>
                        <div className="bg-black p-4 rounded-lg border border-gray-800 text-center">
                            <div className="text-gray-500 text-xs mb-1">손익분기 ROAS</div>
                            <div className="font-mono font-bold text-orange-400">{result.tableData.endRoas}</div>
                        </div>
                        <div className="bg-black p-4 rounded-lg border border-gray-800 text-center">
                            <div className="text-gray-500 text-xs mb-1">최적 목표 ROAS</div>
                            <div className="font-mono font-bold text-green-400">{result.tableData.optRoas}</div>
                        </div>
                        <div className="bg-black p-4 rounded-lg border border-gray-800 text-center">
                            <div className="text-gray-500 text-xs mb-1">Max CPC (MCVR)</div>
                            <div className="font-mono font-bold text-orange-400">{result.tableData.mcvr}</div>
                        </div>
                        <div className="bg-black p-4 rounded-lg border border-gray-800 text-center">
                            <div className="text-gray-500 text-xs mb-1">적정 CPC</div>
                            <div className="font-mono font-bold text-green-400">{result.tableData.optCpc}</div>
                        </div>
                        <div className="bg-black p-4 rounded-lg border border-gray-800 text-center">
                            <div className="text-gray-500 text-xs mb-1">현재 ROI 효율</div>
                            <div className="font-mono font-bold text-white">{result.tableData.currentRoi}</div>
                        </div>
                    </div>
                </div>

                {/* 3. Targets */}
                <div>
                    <h3 className="text-[#87CEEB] font-bold mb-3 flex items-center gap-2 text-sm">
                      <i className="fas fa-crosshairs"></i> 2단계: 목표 세팅 추천
                    </h3>
                    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                            <span className="text-gray-400 text-sm">추천 목표 ROAS</span>
                            <span className="font-bold text-white font-mono">{result.recommendation.targetRoas}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                            <span className="text-gray-400 text-sm">추천 목표 CPC</span>
                            <span className="font-bold text-white font-mono">{result.recommendation.targetCpc}</span>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg text-sm text-center text-[#87CEEB]">
                            💡 {result.recommendation.adjustment}
                        </div>
                    </div>
                </div>

                {/* 4. Strategy */}
                <div>
                    <h3 className="text-[#87CEEB] font-bold mb-3 flex items-center gap-2 text-sm">
                      <i className="fas fa-chess-knight"></i> 3단계: 퍼포먼스 전략 제안
                    </h3>
                    <div className="bg-black border border-gray-800 rounded-xl p-5">
                        <ul className="space-y-4">
                            {result.strategy.actionItems.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                                    <span className="w-5 h-5 bg-[#87CEEB] text-black rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">{idx + 1}</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
              </>
            )}

            {/* Mode 2: Simulation */}
            {result.mode === 'SIMULATION' && result.simulation && (
              <>
                 <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-xl flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center text-xl shrink-0">
                        <i className="fas fa-flask"></i>
                    </div>
                    <div>
                        <h3 className="text-orange-400 font-bold text-lg">광고 집행 전 시뮬레이션 모드</h3>
                        <p className="text-gray-400 text-sm">제공된 S(가격)와 M(마진)을 기반으로 예상 효율을 계산했습니다.</p>
                    </div>
                 </div>

                 {/* 1. Survival Line */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black p-5 rounded-xl border border-gray-800 text-center">
                        <div className="text-gray-500 text-xs mb-2">생존 하한선 (EndROAS)</div>
                        <div className="text-2xl font-black text-red-500 font-mono">{result.simulation.survivalRoas}</div>
                        <div className="text-[10px] text-gray-500 mt-2">이 밑으로 떨어지면 적자</div>
                    </div>
                    <div className="bg-black p-5 rounded-xl border border-gray-800 text-center">
                        <div className="text-gray-500 text-xs mb-2">필요 전환율 (CPC {result.simulation.avgCpc} 기준)</div>
                        <div className="text-2xl font-black text-[#87CEEB] font-mono">{result.simulation.requiredCvr}</div>
                        <div className="text-[10px] text-gray-500 mt-2">이 정도는 팔려야 본전</div>
                    </div>
                 </div>

                 {/* 2. Scenarios */}
                 <div>
                    <h3 className="text-[#87CEEB] font-bold mb-3 flex items-center gap-2 text-sm">
                      <i className="fas fa-table"></i> CPC별 효율 시나리오
                    </h3>
                    <div className="bg-black border border-gray-800 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-center">
                            <thead className="bg-gray-900 text-gray-400">
                                <tr>
                                    <th className="p-3 border-r border-gray-800">CPC</th>
                                    <th className="p-3 border-r border-gray-800">손익분기 CVR</th>
                                    <th className="p-3">수익발생 CVR (권장)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.simulation.scenarios.map((scenario, idx) => (
                                    <tr key={idx} className="border-t border-gray-800">
                                        <td className="p-3 border-r border-gray-800 font-bold">{scenario.cpc}</td>
                                        <td className="p-3 border-r border-gray-800 text-orange-400">{scenario.breakEvenCvr}</td>
                                        <td className="p-3 text-green-400">{scenario.profitableCvr}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>

                 {/* 3. Advice */}
                 <div>
                    <h3 className="text-[#87CEEB] font-bold mb-3 flex items-center gap-2 text-sm">
                      <i className="fas fa-comment-dollar"></i> 전략적 조언
                    </h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-gray-300 text-sm leading-relaxed">
                        {result.simulation.advice}
                    </div>
                 </div>
              </>
            )}

          </div>
        )}
      </section>
    </div>
  );
};

export default MetaCalculator;