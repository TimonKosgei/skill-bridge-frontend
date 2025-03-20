const ReviewList = ({ reviews }) => {
    return (
      <ul>
        {reviews.map((review) => (
          <li key={review.id} className="mb-4">
            <div className="flex items-center">
              <span className="text-yellow-500">⭐ {review.rating}</span>
              <span className="ml-2 font-semibold">{review.user}</span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </li>
        ))}
      </ul>
    );
  };
  
  export default ReviewList;