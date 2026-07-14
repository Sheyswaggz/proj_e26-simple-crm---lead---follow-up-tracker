import { Routes, Route } from 'react-router-dom';

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
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Simple CRM</h1>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LeadList />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
