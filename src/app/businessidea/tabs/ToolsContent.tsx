export default function ToolsContent() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-base">🔧</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tools</h2>
            <p className="text-xs text-gray-600">Essential resources</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow transition-shadow">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <span className="text-sm">📊</span>
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-1">Analytics</h3>
            <p className="text-xs text-gray-600">Track metrics</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow transition-shadow">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <span className="text-sm">📝</span>
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-1">Templates</h3>
            <p className="text-xs text-gray-600">Pre-built tools</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow transition-shadow">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <span className="text-sm">🔍</span>
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-1">Research</h3>
            <p className="text-xs text-gray-600">Market insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
