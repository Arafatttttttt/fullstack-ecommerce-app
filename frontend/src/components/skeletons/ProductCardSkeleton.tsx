interface ProductCardSkeletonProps {
  count?: number;
}

const ProductCardSkeleton = ({ count = 1 }: ProductCardSkeletonProps) => {
  if (count === 1) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        {/* Image Skeleton */}
        <div className="aspect-square bg-gray-200"></div>
        
        {/* Content Skeleton */}
        <div className="p-5 space-y-3">
          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Rating Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          
          {/* Price Skeleton */}
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          
          {/* Stock Badge Skeleton */}
          <div className="h-5 bg-gray-200 rounded-full w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} count={1} />
      ))}
    </>
  );
};

export default ProductCardSkeleton;
