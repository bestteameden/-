
import React, { useState } from 'react';
import { Shot } from '../types';
import { db } from '../services/databaseService';

interface Props {
  shotDb: Shot[];
  setShotDb: (db: Shot[]) => void;
  staffAccounts: Array<{id: string, pw: string}>;
  setStaffAccounts: (accounts: Array<{id: string, pw: string}>) => void;
}

const AdminDashboard: React.FC<Props> = ({ shotDb, setShotDb, staffAccounts, setStaffAccounts }) => {
  const [activeTab, setActiveTab] = useState<'shots' | 'staff'>('shots');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Shot Form
  const [newShot, setNewShot] = useState<Omit<Shot, 'id'>>({
    category: '도입부 (3초 후킹)',
    name: '',
    action: '',
    description: '',
    link: ''
  });

  // New Staff Form
  const [newStaff, setNewStaff] = useState({ id: '', pw: '' });

  const handleSaveShot = async () => {
    if (!newShot.name || !newShot.description) return;
    setIsProcessing(true);
    try {
      if (editingId) {
        // Update existing shot
        const shot: Shot = {
          ...newShot,
          id: editingId
        };
        const updatedShots = await db.updateShot(shot);
        setShotDb(updatedShots);
        alert('성공적으로 수정되었습니다.');
      } else {
        // Add new shot
        const shot: Shot = {
          ...newShot,
          id: Date.now().toString()
        };
        const updatedShots = await db.addShot(shot);
        setShotDb(updatedShots);
        alert('성공적으로 DB에 저장되었습니다.');
      }
      
      // Reset form
      setNewShot({ category: '도입부 (3초 후킹)', name: '', action: '', description: '', link: '' });
      setEditingId(null);
    } catch (e) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClick = (shot: Shot) => {
    setNewShot({
      category: shot.category,
      name: shot.name,
      action: shot.action,
      description: shot.description,
      link: shot.link
    });
    setEditingId(shot.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setNewShot({ category: '도입부 (3초 후킹)', name: '', action: '', description: '', link: '' });
    setEditingId(null);
  };

  const handleDeleteShot = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setIsProcessing(true);
    try {
      const updatedShots = await db.deleteShot(id);
      setShotDb(updatedShots);
      // If we deleted the item currently being edited, reset form
      if (editingId === id) {
        handleCancelEdit();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.id || !newStaff.pw) return;
    setIsProcessing(true);
    try {
      const updatedStaff = await db.addStaff(newStaff);
      setStaffAccounts(updatedStaff);
      setNewStaff({ id: '', pw: '' });
      alert('직원이 등록되었습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (id === 'bestteameden') {
      alert('마스터 계정은 삭제할 수 없습니다.');
      return;
    }
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setIsProcessing(true);
    try {
      const updatedStaff = await db.deleteStaff(id);
      setStaffAccounts(updatedStaff);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden">
      <div className="flex bg-gray-900">
        <button 
          onClick={() => setActiveTab('shots')}
          className={`px-8 py-5 font-bold transition-all ${activeTab === 'shots' ? 'bg-black text-[#87CEEB]' : 'text-gray-500'}`}
        >
          AI 촬영 구도 DB 설정
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          className={`px-8 py-5 font-bold transition-all ${activeTab === 'staff' ? 'bg-black text-[#87CEEB]' : 'text-gray-500'}`}
        >
          직원 계정 DB 관리
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'shots' ? (
          <div className="space-y-12">
            {/* Shot Form */}
            <div className={`bg-black border rounded-2xl p-6 transition-colors ${editingId ? 'border-[#87CEEB]' : 'border-gray-800'}`}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <i className={`fas ${editingId ? 'fa-pen-to-square' : 'fa-database'} text-[#87CEEB]`}></i> 
                {editingId ? '구도 DB 수정 모드' : '신규 구도 DB 등록'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">구도 분류</label>
                  <select 
                    value={newShot.category}
                    onChange={e => setNewShot({...newShot, category: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                  >
                    <option>도입부 (3초 후킹)</option>
                    <option>전개부 (증거/과정)</option>
                    <option>클라이맥스 (결과)</option>
                    <option>만능 브릿지 (연결)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">구도명</label>
                  <input 
                    value={newShot.name}
                    onChange={e => setNewShot({...newShot, name: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                    placeholder="예: 모공 돌진"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">동작 요약</label>
                  <input 
                    value={newShot.action}
                    onChange={e => setNewShot({...newShot, action: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                    placeholder="예: 초밀착 확대"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">레퍼런스 링크 (URL)</label>
                  <input 
                    value={newShot.link}
                    onChange={e => setNewShot({...newShot, link: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">행동 상세 설명</label>
                  <textarea 
                    value={newShot.description}
                    onChange={e => setNewShot({...newShot, description: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm h-24 focus:border-[#87CEEB] outline-none"
                    placeholder="모델이 수행할 행동을 상세히 입력하세요."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleSaveShot}
                  disabled={isProcessing}
                  className={`px-8 py-3 font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2 ${editingId ? 'bg-orange-500 text-white hover:text-black' : 'bg-[#87CEEB] text-black'}`}
                >
                  {isProcessing && <i className="fas fa-spinner fa-spin"></i>}
                  {editingId ? '수정사항 저장' : '데이터베이스에 저장'}
                </button>
                {editingId && (
                  <button 
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700 transition-all"
                  >
                    취소
                  </button>
                )}
              </div>
            </div>

            {/* Shot List */}
            <div>
              <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                <span>데이터베이스 현황 ({shotDb.length} records)</span>
                <span className="text-xs text-gray-500">삭제 시 영구적으로 반영됩니다</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shotDb.map(shot => (
                  <div key={shot.id} className={`bg-black border rounded-xl p-4 flex flex-col group transition-all ${editingId === shot.id ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-gray-800 hover:border-[#87CEEB]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400 group-hover:text-white transition-colors">{shot.category}</span>
                      <div className="flex gap-2 opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(shot)} className="text-gray-600 hover:text-[#87CEEB] transition-colors" title="수정">
                          <i className="fas fa-pen"></i>
                        </button>
                        <button onClick={() => handleDeleteShot(shot.id)} className="text-gray-600 hover:text-red-500 transition-colors" title="삭제">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold mb-1">{shot.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 flex-1">{shot.description}</p>
                    {editingId === shot.id && (
                        <div className="mt-2 text-xs text-orange-500 font-bold">
                            <i className="fas fa-edit mr-1"></i> 수정 중...
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-black border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-6">신규 직원 계정 추가</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  value={newStaff.id}
                  onChange={e => setNewStaff({...newStaff, id: e.target.value})}
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                  placeholder="아이디"
                />
                <input 
                  value={newStaff.pw}
                  onChange={e => setNewStaff({...newStaff, pw: e.target.value})}
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm focus:border-[#87CEEB] outline-none"
                  placeholder="비밀번호"
                />
                <button 
                  onClick={handleAddStaff}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-[#87CEEB] transition-all disabled:opacity-50"
                >
                  {isProcessing ? '처리중...' : '직원 등록'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6">등록된 직원 DB</h3>
              <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="p-4 font-bold border-b border-gray-800">아이디</th>
                      <th className="p-4 font-bold border-b border-gray-800">패스워드(암호화)</th>
                      <th className="p-4 font-bold border-b border-gray-800 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffAccounts.map(account => (
                      <tr key={account.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                        <td className="p-4">{account.id}</td>
                        <td className="p-4 font-mono">••••</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteStaff(account.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                            <i className="fas fa-user-minus"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;