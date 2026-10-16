import React, { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CustomersModule } from './components/CustomersModule';
import { LeadsModule } from './components/LeadsModule';
import { DashboardModule } from './components/DashboardModule';
import { TeamModule } from './components/TeamModule';
import { BulkUploadModal } from './components/BulkUploadModal';
import { ToastContainer } from './components/ToastContainer';

const MainLayout = () => {
  const { activeTab, setActiveTab } = useCrm();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenUpload = () => setIsUploadOpen(true);
  const handleCloseUpload = () => setIsUploadOpen(false);

  const handleUploadFinishGoToCustomers = () => {
    setIsUploadOpen(false);
    setActiveTab('customers');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* 1. Fixed Left Sidebar */}
      <Sidebar />

      {/* 2. Flexible Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header 
          onOpenUpload={handleOpenUpload}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardModule onOpenUpload={handleOpenUpload} />
            )}

            {activeTab === 'customers' && (
              <CustomersModule 
                onOpenUpload={handleOpenUpload}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {activeTab === 'leads' && (
              <LeadsModule 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {activeTab === 'team' && (
              <TeamModule />
            )}
          </div>
        </main>
      </div>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isUploadOpen}
        onClose={handleCloseUpload}
        onFinishGoToCustomers={handleUploadFinishGoToCustomers}
      />

      {/* Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <MainLayout />
    </CrmProvider>
  );
}
