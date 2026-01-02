
import React, { useState, useEffect } from 'react';
import { AppTab, Shot } from './types';
import { db } from './services/databaseService';
import Layout from './components/Layout';
import ScriptGenerator from './components/ScriptGenerator';
import ScenePlanMaker from './components/ScenePlanMaker';
import MetaCalculator from './components/MetaCalculator';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  // Login inputs
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminPw, setAdminPw] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCRIPT_GENERATOR);
  const [transferredScript, setTransferredScript] = useState('');

  // Data state (Managed by DB Service)
  const [shotDb, setShotDb] = useState<Shot[]>([]);
  const [staffAccounts, setStaffAccounts] = useState<Array<{id: string, pw: string}>>([]);

  // Initialize DB on mount
  useEffect(() => {
    db.init();
    setShotDb(db.getShots());
    setStaffAccounts(db.getStaff());
  }, []);

  // API Key Check
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-900 border border-red-500/50 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1 className="text-2xl font-bold text-red-500">API 설정 오류 (Configuration Error)</h1>
          </div>

          <p className="mb-8 text-gray-300 text-lg leading-relaxed">
            Vercel 환경 변수 설정이 잘못되어 앱이 API Key를 찾지 못하고 있습니다.<br/>
            <strong>Key(이름)</strong> 칸에 API Key 값을 넣으신 경우일 확률이 높습니다.
          </p>
          
          <div className="bg-black p-8 rounded-2xl border border-gray-800 mb-8">
            <h2 className="font-bold text-[#87CEEB] mb-6 text-lg">✅ Vercel 올바른 설정 방법</h2>
            <div className="grid grid-cols-[100px_1fr] gap-y-6 gap-x-4 items-center">
              <div className="text-gray-500 font-medium">Key (이름)</div>
              <div className="font-mono font-bold text-green-400 text-lg bg-green-400/10 px-3 py-1 rounded w-fit">API_KEY</div>
              
              <div className="text-gray-500 font-medium">Value (값)</div>
              <div className="font-mono text-white break-all bg-gray-800 px-3 py-2 rounded text-sm">
                AIzaSy... (복사한 긴 코드를 여기에 붙여넣기)
              </div>
            </div>
          </div>

          <div className="bg-red-900/10 p-6 rounded-xl border border-red-500/20 text-red-200 text-sm leading-relaxed mb-8">
            <strong>💡 흔한 실수:</strong><br/>
            혹시 <strong>Key</strong> 칸에 <code className="bg-red-900/50 px-1 rounded">AIza...</code> 로 시작하는 긴 코드를 넣으셨나요?<br/>
            Key 칸에는 반드시 영어로 <strong>API_KEY</strong> 라고 적어주셔야 컴퓨터가 인식합니다.
          </div>
          
          <div className="text-center">
              <p className="text-gray-500 mb-4 text-sm">설정을 수정하고 <strong>Redeploy</strong> 하신 후 아래 버튼을 눌러주세요.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <i className="fas fa-sync-alt"></i> 새로고침
              </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Fetch latest staff data directly from DB for login check to ensure security
    const currentStaff = db.getStaff();
    const found = currentStaff.find(acc => acc.id === loginId && acc.pw === loginPw);
    
    if (found) {
      setIsAuthenticated(true);
      setLoginId('');
      setLoginPw('');
    } else {
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === 'jihan' && adminPw === '1234') {
      setIsAdminAuthenticated(true);
      // Refresh data when admin logs in
      setShotDb(db.getShots());
      setStaffAccounts(db.getStaff());
    } else {
      alert('관리자 정보가 일치하지 않습니다.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    setActiveTab(AppTab.SCRIPT_GENERATOR);
  };

  const transferToScenePlan = (script: string) => {
    setTransferredScript(script);
    setActiveTab(AppTab.SCENE_PLAN_MAKER);
  };

  // 1. Initial Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#87CEEB] rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-[#87CEEB]/20">
              <i className="fas fa-robot text-black text-4xl"></i>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">EDEN BEAUTY 자비스</h1>
            <p className="text-gray-500 text-sm">시스템 이용을 위해 ID와 PW를 입력해주세요.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input 
                value={loginId} onChange={e => setLoginId(e.target.value)}
                placeholder="ID"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 focus:border-[#87CEEB] outline-none transition-all"
              />
            </div>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input 
                type="password"
                value={loginPw} onChange={e => setLoginPw(e.target.value)}
                placeholder="PW"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 focus:border-[#87CEEB] outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-[#87CEEB] transition-all shadow-lg"
            >
              접속하기
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-gray-700">
            Authorized Personnel Only. Eden Viral Engineering Lab.
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Application UI
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {activeTab === AppTab.SCRIPT_GENERATOR && (
        <ScriptGenerator onTransferToScene={transferToScenePlan} />
      )}
      
      {activeTab === AppTab.SCENE_PLAN_MAKER && (
        <ScenePlanMaker initialScript={transferredScript} shotDb={shotDb} />
      )}

      {activeTab === AppTab.META_CALCULATOR && (
        <MetaCalculator />
      )}
      
      {activeTab === AppTab.ADMIN_PAGE && (
        <div className="max-w-4xl mx-auto">
          {!isAdminAuthenticated ? (
            <div className="bg-gray-950 border border-gray-800 rounded-3xl p-10 text-center animate-fade-in">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-shield-alt text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold mb-2">관리자 권한 인증</h2>
              <p className="text-gray-500 mb-8 text-sm">이 영역은 관리자만 접근할 수 있습니다.</p>
              
              <form onSubmit={handleAdminLogin} className="max-w-xs mx-auto space-y-4">
                <input 
                  value={adminId} onChange={e => setAdminId(e.target.value)}
                  placeholder="Admin ID"
                  className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm focus:border-[#87CEEB] outline-none"
                />
                <input 
                  type="password"
                  value={adminPw} onChange={e => setAdminPw(e.target.value)}
                  placeholder="Admin PW"
                  className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm focus:border-[#87CEEB] outline-none"
                />
                <button type="submit" className="w-full bg-[#87CEEB] text-black font-bold py-4 rounded-xl">
                  관리자 로그인
                </button>
              </form>
              
              {/* Admin Hint */}
              <div className="mt-6 text-xs text-gray-700">
                 Hint: jihan / 1234
              </div>
            </div>
          ) : (
            <AdminDashboard 
              shotDb={shotDb} 
              setShotDb={setShotDb}
              staffAccounts={staffAccounts}
              setStaffAccounts={setStaffAccounts}
            />
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
