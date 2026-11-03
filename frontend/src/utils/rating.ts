/**
 * Renders star rating display based on average rating
 * Returns a string of filled stars (★) - the number corresponds to rounded rating
 * @param rating - Average rating (0-5)
 * @returns String of filled stars
 */
export const renderFilledStars = (rating: number): string => {
  const roundedRating = Math.round(rating);
  return '★'.repeat(roundedRating);
};
