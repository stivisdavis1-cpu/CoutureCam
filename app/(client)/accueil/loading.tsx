export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Header Sticky Mobile Skeleton */}
      <header className="sticky top-0 z-50 bg-gray-50 px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-1 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 px-6 pt-6 w-full max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6 w-full">
          <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          </div>
          
          <div className="pt-4 space-y-4">
            <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
            <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
            <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
          </div>
        </div>
      </main>
      
    </div>
  )
}
