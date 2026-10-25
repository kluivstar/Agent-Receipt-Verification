import React, { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { TaskListPage } from './pages/TaskListPage.jsx';
import { CreateTaskPage } from './pages/CreateTaskPage.jsx';
import { TaskDetailPage } from './pages/TaskDetailPage.jsx';
import { SubmitDeliverablePage } from './pages/SubmitDeliverablePage.jsx';
import { ReceiptListPage } from './pages/ReceiptListPage.jsx';
import { ReceiptDetailPage } from './pages/ReceiptDetailPage.jsx';
import { ContractInspector } from './components/ContractInspector.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

function AppLayout({ walletState, setWalletState }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar walletState={walletState} setWalletState={setWalletState} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet context={{ walletState, setWalletState }} />
        </main>
      </div>
    </div>
  );
}

function LandingLayout({ walletState, setWalletState }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar walletState={walletState} setWalletState={setWalletState} />
      <main className="flex-1">
        <Outlet context={{ walletState, setWalletState }} />
      </main>
    </div>
  );
}

export function App() {
  const [walletState, setWalletState] = useState({
    address: null,
    chainId: null,
    isSimulated: false
  });

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route element={<LandingLayout walletState={walletState} setWalletState={setWalletState} />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Main App Dashboard & Subroutes */}
      <Route path="/app" element={<AppLayout walletState={walletState} setWalletState={setWalletState} />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TaskListPage />} />
        <Route path="tasks/new" element={<CreateTaskPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="tasks/:id/submit" element={<SubmitDeliverablePage />} />
        <Route path="receipts" element={<ReceiptListPage />} />
        <Route path="receipts/:id" element={<ReceiptDetailPage />} />
        <Route path="contract" element={<ContractInspector />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
