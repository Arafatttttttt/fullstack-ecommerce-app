const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-9 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              {/* Avatar Skeleton */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                <div className="h-5 bg-gray-200 rounded-full w-24 mx-auto"></div>
              </div>

              {/* Navigation Skeleton */}
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>

              {/* Member Since Skeleton */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
            </div>
          </div>

          {/* Right Content Skeleton */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              {/* Header Skeleton */}
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-5">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mt-1"></div>
              </div>

              {/* Fields Skeleton */}
              <div className="p-6 space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-b-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-5 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons Skeleton */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-36"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-28"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
