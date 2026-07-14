import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';

function LeadList() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800">Lead List</h2>
      <p className="mt-4 text-gray-600">Placeholder for Lead List page</p>
    </div>
  );
}

function LeadDetail() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800">Lead Detail</h2>
      <p className="mt-4 text-gray-600">Placeholder for Lead Detail page</p>
    </div>
  );
}

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LeadList />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
