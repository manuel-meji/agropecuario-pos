import RootLayout from "./components/layout/RootLayout";
import POSTerminal from "./pages/pos/POSTerminal";
import Dashboard from "./pages/dashboard/Dashboard";
import ReceivablesView from "./pages/receivables/ReceivablesView";
import PayablesView from "./pages/payables/PayablesView";
import SettingsView from "./pages/settings/SettingsView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Navigate to="/pos" replace />} />
          <Route path="pos" element={<POSTerminal />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<div className="p-8 text-2xl font-bold dark:text-white">Inventario de Agronomía</div>} />
          <Route path="receivables" element={<ReceivablesView />} />
          <Route path="payables" element={<PayablesView />} />
          <Route path="taxes" element={<div className="p-8 text-2xl font-bold dark:text-white">Módulo Tributario CR Version 4.4</div>} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
