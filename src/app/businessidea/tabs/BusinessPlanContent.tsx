export default function BusinessPlanContent() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-base">📋</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Business Plan</h2>
            <p className="text-xs text-gray-600">Strategic planning</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
          {/* Option A */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-blue-600">A</span>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-3">Option A</h3>
            <div className="flex-grow space-y-4">
              <p className="text-gray-600">Detailed description for Option A. This section can include more content about what this option entails, its benefits, and any other relevant information that helps the user understand this choice better.</p>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Additional details or features can go here</p>
              </div>
            </div>
          </div>

          {/* Option B */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-blue-600">B</span>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-3">Option B</h3>
            <div className="flex-grow space-y-4">
              <p className="text-gray-600">Detailed description for Option B. This section can include more content about what this option entails, its benefits, and any other relevant information that helps the user understand this choice better.</p>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Additional details or features can go here</p>
              </div>
            </div>
          </div>

          {/* Option C */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-blue-600">C</span>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-3">Option C</h3>
            <div className="flex-grow space-y-4">
              <p className="text-gray-600">Detailed description for Option C. This section can include more content about what this option entails, its benefits, and any other relevant information that helps the user understand this choice better.</p>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Additional details or features can go here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
