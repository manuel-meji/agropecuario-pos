
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import POSTerminal from "./pages/pos/POSTerminal";
import Dashboard from "./pages/dashboard/Dashboard";
import ReceivablesView from "./pages/receivables/ReceivablesView";
import PayablesView from "./pages/payables/PayablesView";
import SettingsView from "./pages/settings/SettingsView";

import InventoryView from "./pages/inventory/InventoryView";
import TaxesView from "./pages/taxes/TaxesView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Navigate to="/pos" replace />} />
          <Route path="pos" element={<POSTerminal />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="debug" element={<div className="p-8 text-2xl font-bold text-red-600">React montado — debug</div>} />
          <Route path="inventory" element={<InventoryView />} />
          <Route path="receivables" element={<ReceivablesView />} />
          <Route path="payables" element={<PayablesView />} />
          <Route path="taxes" element={<TaxesView />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
