
import React from 'react';
import { AppTab } from '../types';
import { SYSTEM_NAME, BRAND_COLORS } from '../constants';

interface LayoutProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, onTabChange, children, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="border-b border-gray-800 p-4 sticky top-0 bg-black z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#87CEEB] rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-black text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold tracking-tighter" style={{ color: BRAND_COLORS.SUB_WHITE }}>
              {SYSTEM_NAME}
            </h1>
          </div>
          
          <nav className="flex flex-wrap justify-center bg-gray-900 rounded-full p-1 border border-gray-800">
            <button 
              onClick={() => onTabChange(AppTab.SCRIPT_GENERATOR)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === AppTab.SCRIPT_GENERATOR ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              뷰티 대본 제작기
            </button>
            <button 
              onClick={() => onTabChange(AppTab.SCENE_PLAN_MAKER)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === AppTab.SCENE_PLAN_MAKER ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              촬영 구도안 제작
            </button>
            <button 
              onClick={() => onTabChange(AppTab.META_CALCULATOR)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === AppTab.META_CALCULATOR ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              메타 최적값 계산기
            </button>
            <button 
              onClick={() => onTabChange(AppTab.PROPOSAL_GENERATOR)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === AppTab.PROPOSAL_GENERATOR ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              제안서 생성기
            </button>
            <button 
              onClick={() => onTabChange(AppTab.ADMIN_PAGE)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === AppTab.ADMIN_PAGE ? 'bg-[#87CEEB] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              관리자 페이지
            </button>
          </nav>
          
          <button 
            onClick={onLogout}
            className="text-gray-500 hover:text-red-500 text-sm transition-colors"
          >
            로그아웃 <i className="fas fa-sign-out-alt ml-1"></i>
          </button>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
      
      <footer className="p-6 border-t border-gray-800 text-center text-gray-600 text-xs">
        &copy; 2024 EDEN MARKETING. Powered by Viral Engineering Database.
      </footer>
    </div>
  );
};

export default Layout;
