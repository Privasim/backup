'use client';

export default function MobileTab() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mobile App View</h2>
        <div className="space-y-6">
          <div className="relative mx-auto w-64 h-[500px] bg-gray-900 rounded-3xl p-1 shadow-2xl overflow-hidden">
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
            
            {/* Phone screen */}
            <div className="relative h-full bg-gray-100 rounded-2xl overflow-hidden flex flex-col">
              {/* Status bar */}
              <div className="bg-indigo-600 text-white p-2 text-xs flex justify-between items-center">
                <span>9:41</span>
                <div className="flex space-x-1">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>
              
              {/* App content */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-center mb-6">
                  <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Mobile App</h3>
                  <p className="text-sm text-gray-500">Preview Mode</p>
                </div>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-indigo-600 text-sm">{item}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Item {item}</p>
                          <p className="text-xs text-gray-500">Tap to view details</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bottom navigation */}
              <div className="bg-white border-t border-gray-200 p-2 flex justify-around">
                {['🏠', '🔍', '➕', '💬', '👤'].map((icon, i) => (
                  <button key={i} className="p-2 text-xl">
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>This is a mobile app preview. The actual mobile app will be available soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
