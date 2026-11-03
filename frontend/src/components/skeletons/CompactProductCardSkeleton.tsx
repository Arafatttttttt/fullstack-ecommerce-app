const CompactProductCardSkeleton = () => {
  return (
    <div className="flex-shrink-0 w-32 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Compact Image Skeleton */}
      <div className="aspect-square bg-gray-200"></div>
      
      {/* Compact Content Skeleton */}
      <div className="p-2.5 space-y-2">
        {/* Title Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        
        {/* Rating Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        
        {/* Price Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-14"></div>
      </div>
    </div>
  );
};

export default CompactProductCardSkeleton;
