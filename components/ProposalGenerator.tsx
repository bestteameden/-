
import React, { useState } from 'react';
import { ProposalInputs } from '../types';
import { generateProposal } from '../services/geminiService';

const ProposalGenerator: React.FC = () => {
  const [inputs, setInputs] = useState<ProposalInputs>({
    clientName: '',
    searchVolume: ['0', '0', '0', '0'],
    mainProduct: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [viewMode, setViewMode] = useState<'PREVIEW' | 'CODE'>('PREVIEW');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'searchVolume') {
       // handled separately by index
       return;
    }
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchVolumeChange = (index: number, value: string) => {
    const newVolumes = [...inputs.searchVolume] as [string, string, string, string];
    newVolumes[index] = value;
    setInputs(prev => ({ ...prev, searchVolume: newVolumes }));
  };

  const handleGenerate = async () => {
    if (!inputs.clientName || !inputs.mainProduct) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const html = await generateProposal(inputs);
      setGeneratedHtml(html);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedHtml).then(() => {
      alert('HTML 코드가 클립보드에 복사되었습니다!');
    });
  };

  const handlePrintPdf = () => {
    if (!generatedHtml) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedHtml);
      printWindow.document.close();
      // Wait for resources to load then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 1000);
    } else {
        alert("팝업 차단이 설정되어 있어 인쇄 창을 열 수 없습니다.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
      {/* Input Section */}
      <section className="bg-gray-950 border border-gray-800 rounded-2xl p-6 h-fit overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <i className="fas fa-file-contract text-[#87CEEB]"></i> 제안서 데이터 입력
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">고객사 명 (광고주) *</label>
            <input 
              name="clientName" value={inputs.clientName} onChange={handleInputChange}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
              placeholder="예: 에덴 코스메틱"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">주력 판매 상품 *</label>
            <input 
              name="mainProduct" value={inputs.mainProduct} onChange={handleInputChange}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
              placeholder="예: PDRN 모공 앰플"
            />
          </div>

          <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800">
             <label className="block text-xs text-[#87CEEB] font-bold mb-3">최근 4개월 브랜드 키워드 검색량 *</label>
             <div className="grid grid-cols-4 gap-2">
               {[0, 1, 2, 3].map((idx) => (
                 <div key={idx}>
                   <div className="text-[10px] text-gray-500 mb-1 text-center">M-{4-idx}</div>
                   <input 
                     type="number"
                     value={inputs.searchVolume[idx]}
                     onChange={(e) => handleSearchVolumeChange(idx, e.target.value)}
                     className="w-full bg-black border border-gray-800 rounded-lg p-2 text-center text-sm focus:border-[#87CEEB] outline-none font-mono"
                   />
                 </div>
               ))}
             </div>
             <p className="text-[10px] text-gray-500 mt-2 text-center">좌측부터 과거 → 최신 순으로 입력하세요.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="text-xs text-gray-400 mb-4">
                <p className="mb-1">💡 <strong>EDEN HTML 제안서 엔진 V3</strong></p>
                <p>입력된 데이터를 기반으로 '시장 진단'과 '에덴 맞춤 솔루션(가격 정책)'이 포함된 완벽한 웹페이지 코드를 생성합니다.</p>
            </div>
            <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-[#87CEEB] transition-all flex items-center justify-center gap-2"
            >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-code"></i>}
            HTML 제안서 코드 생성하기
            </button>
        </div>
      </section>

      {/* Result Section */}
      <section className="bg-gray-950 border border-gray-800 rounded-2xl flex flex-col overflow-hidden h-full relative">
        {!generatedHtml ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-600">
            <i className="fas fa-laptop-code text-6xl mb-4 opacity-20"></i>
            <p>제안서 코드가 생성되면<br/>이곳에서 미리보기 및 복사가 가능합니다.</p>
          </div>
        ) : (
          <>
             <div className="flex bg-gray-900 border-b border-gray-800">
                <button
                  onClick={() => setViewMode('PREVIEW')}
                  className={`flex-1 py-3 text-xs font-bold transition-all ${viewMode === 'PREVIEW' ? 'bg-black text-[#87CEEB] border-b-2 border-[#87CEEB]' : 'text-gray-500 hover:text-white'}`}
                >
                  <i className="fas fa-eye mr-1"></i> 미리보기
                </button>
                <button
                  onClick={() => setViewMode('CODE')}
                  className={`flex-1 py-3 text-xs font-bold transition-all ${viewMode === 'CODE' ? 'bg-black text-[#87CEEB] border-b-2 border-[#87CEEB]' : 'text-gray-500 hover:text-white'}`}
                >
                  <i className="fas fa-code mr-1"></i> HTML 코드
                </button>
             </div>

             <div className="flex-1 relative overflow-hidden bg-white">
                {viewMode === 'PREVIEW' ? (
                    <iframe 
                        srcDoc={generatedHtml}
                        className="w-full h-full border-none"
                        title="Proposal Preview"
                    />
                ) : (
                    <textarea 
                        value={generatedHtml}
                        readOnly
                        className="w-full h-full bg-[#1e1e1e] text-gray-300 font-mono text-xs p-4 outline-none resize-none"
                    />
                )}
             </div>

             <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-3">
                <button 
                    onClick={handlePrintPdf}
                    className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
                >
                    <i className="fas fa-print"></i> PDF 저장 / 인쇄
                </button>
                <button 
                    onClick={copyToClipboard}
                    className="px-6 py-2 bg-[#87CEEB] text-black font-bold rounded-lg hover:bg-white transition-colors text-sm flex items-center gap-2"
                >
                    <i className="fas fa-copy"></i> 전체 코드 복사
                </button>
             </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ProposalGenerator;
