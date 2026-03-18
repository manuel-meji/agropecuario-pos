
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import RootLayout from "./components/layout/RootLayout";
import POSTerminal from "./pages/pos/POSTerminal";
import Dashboard from "./pages/dashboard/Dashboard";
import ReceivablesView from "./pages/receivables/ReceivablesView";
import PayablesView from "./pages/payables/PayablesView";
import SettingsView from "./pages/settings/SettingsView";
import InventoryView from "./pages/inventory/InventoryView";
import TaxesView from "./pages/taxes/TaxesView";
import ClientsView from "./pages/clients/ClientsView";
import SalesView from "./pages/sales/SalesView";
import SuppliersView from "./pages/suppliers/SuppliersView";
import LoginView from "./pages/auth/LoginView";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ExpensesView from "./pages/expenses/ExpensesView";
import DocumentosRecibidos from "./pages/receiveddocs/DocumentosRecibidos";
import ImportarFactura from "./pages/receiveddocs/ImportarFactura";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white' }} />
      <Routes>
        <Route path="/login" element={<LoginView />} />
        
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<RootLayout />}>
            <Route index element={<Navigate to="/pos" replace />} />
            <Route path="pos" element={<POSTerminal />} />
            <Route path="sales" element={<SalesView />} />
            <Route path="clients" element={<ClientsView />} />
            <Route path="suppliers" element={<SuppliersView />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="debug" element={<div className="p-8 text-2xl font-bold text-red-600">React montado — debug</div>} />
            <Route path="inventory" element={<InventoryView />} />
            <Route path="receivables" element={<ReceivablesView />} />
            <Route path="payables" element={<PayablesView />} />
            <Route path="taxes" element={<TaxesView />} />
            <Route path="expenses" element={<ExpensesView />} />
            <Route path="received-docs" element={<DocumentosRecibidos />} />
            <Route path="import-factura" element={<ImportarFactura />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
