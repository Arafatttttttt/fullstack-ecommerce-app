const OrderCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Skeleton */}
      <div className="p-6 border-b border-gray-100">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Skeleton */}
      <div className="bg-gray-50 p-6 border-t border-gray-100">
        <div className="flex flex-wrap gap-3 justify-end">
          <div className="h-9 bg-gray-200 rounded-lg w-24"></div>
          <div className="h-9 bg-gray-200 rounded-lg w-28"></div>
        </div>
      </div>
    </div>
  );
};

export default OrderCardSkeleton;
