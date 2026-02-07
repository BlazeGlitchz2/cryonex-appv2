export function Home() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back to your Cryonex workspace.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats / Cards */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">
            System Status
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-green-400">Good</span>
            <span className="text-sm text-gray-400 mb-1">Optimized</span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">
            AI Assistant
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-400">Ready</span>
            <span className="text-sm text-gray-400 mb-1">v2.0 Connected</span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">
            Pending Updates
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-yellow-400">2</span>
            <span className="text-sm text-gray-400 mb-1">Apps available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
