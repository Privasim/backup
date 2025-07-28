export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-2">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          AI took my job
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-49px)]">
        {/* Left Section - 15% width */}
        <div className="w-[15%] border-r border-gray-200 dark:border-gray-800 flex flex-col">
          {/* Top buttons */}
          <div className="p-3 space-y-2">
            <button className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-left">
              Threat Feed
            </button>
            <button className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors">
              Backup Plan
            </button>
          </div>

          {/* Chat sections at bottom */}
          <div className="flex-1 flex flex-col justify-end p-3">
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-medium text-gray-900 dark:text-white">
                      Chat {i}
                    </h3>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      2m
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                    Last message preview...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-16">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  backup v0.02
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select a chat or start a new conversation
                </p>
              </div>
            </div>
          </div>
          
          {/* Chat Input */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}