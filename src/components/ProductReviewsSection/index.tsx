import React from "react";
import { StarIcon, StarHalfIcon, StarEmptyIcon, ChevronDownIcon } from "@homeberris/assets/icons/reviews";
import styles from "./index.module.css";

const staticRating = {
  average: 4.8,
  total: 125,
  bars: [
    { label: "Excellent", count: 100 },
    { label: "Good", count: 11 },
    { label: "Average", count: 3 },
    { label: "Below Average", count: 8 },
    { label: "Poor", count: 1 },
  ],
};

const staticReviews = [
  {
    id: 1,
    name: "Grace Carey",
    date: "24 January 2023",
    rating: 4,
    text: "I was a bit nervous to be buying a secondhand phone from Amazon, but I couldn't be happier with my purchase!! I have a pre-paid data plan so I was worried that this phone wouldn't connect with my data plan, since the new phones don't have the physical Sim tray anymore, but couldn't have been easier! I bought an Unlocked black iPhone 14 Pro Max in excellent condition and everything is PERFECT. It was super easy to set up and the phone works and looks great. It truly was in excellent condition. Highly recommend!!!❤",
    images: [],
    avatar: null,
  },
  {
    id: 2,
    name: "Ronald Richards",
    date: "24 January 2023",
    rating: 5,
    text: "This phone has 1T storage and is durable. Plus all the new iPhones have a C port! Apple is phasing out the current ones! (All about the Benjamins) So if you want a phone that's going to last grab an iPhone 14 pro max and get several cords and plugs.",
    images: [],
    avatar: null,
  },
  {
    id: 3,
    name: "Darcy King",
    date: "24 January 2023",
    rating: 3.5,
    text: "I might be the only one to say this but the camera is a little funky. Hoping it will change with a software update; otherwise, love this phone! Came in great condition",
    images: ["/static/review1.jpg", "/static/review2.jpg"],
    avatar: null,
  },
];

const INITIAL_COUNT = 3;

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<StarIcon key={i} />);
    } else if (rating >= i - 0.5) {
      stars.push(<StarHalfIcon key={i} />);
    } else {
      stars.push(<StarEmptyIcon key={i} />);
    }
  }
  return <div className={styles.stars}>{stars}</div>;
}

export default function ProductReviewsSection() {
  const [showAll, setShowAll] = React.useState(false);
  const maxBar = Math.max(...staticRating.bars.map((b) => b.count));
  const visibleReviews = showAll ? staticReviews : staticReviews.slice(0, INITIAL_COUNT);

  return (
    <section className={styles.section}>
      {/* Блок 1: Рейтинг */}
      <div className={styles.ratingBlock}>
        <h2 className={styles.title}>Reviews</h2>
        <div className={styles.ratingInner}>
          <div className={styles.ratingLeft}>
            <div className={styles.ordinaryClass}>
            <span className={styles.ratingNumber}>{staticRating.average}</span>
            <br />
            <span className={styles.ratingTotal}>of {staticRating.total} reviews</span>
            </div>
            <StarRating rating={staticRating.average} />
          </div>
          <div className={styles.ratingBars}>
            {staticRating.bars.map((bar) => (
              <div key={bar.label} className={styles.barRow}>
                <span className={styles.barLabel}>{bar.label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(bar.count / maxBar) * 100}%` }}
                  />
                </div>
                <span className={styles.barCount}>{bar.count}</span>
              </div>
            ))}
          </div>
        </div>
        <input
          type="text"
          className={styles.leaveCommentInput}
          placeholder="Leave Comment"
        />
      </div>

      {/* Блок 2: Отзывы */}
      <div className={styles.reviewsBlock}>
        {visibleReviews.map((review, idx) => (
          <div
            key={review.id}
            className={`${styles.reviewItem} ${idx < visibleReviews.length - 1 ? styles.reviewItemBorder : ""}`}
          >
            <div className={styles.reviewHeader}>
              <div className={styles.reviewAuthor}>
                <div className={styles.avatar}>
                  {review.avatar ? (
                    <img src={review.avatar} alt={review.name} />
                  ) : (
                    <span>{review.name[0]}</span>
                  )}
                </div>
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{review.name}</span>
                  <StarRating rating={review.rating} />
                </div>
              </div>
              <span className={styles.reviewDate}>{review.date}</span>
            </div>
            <p className={styles.reviewText}>{review.text}</p>
            {review.images.length > 0 && (
              <div className={styles.reviewImages}>
                {review.images.map((src, i) => (
                  <img key={i} src={src} alt={`review-img-${i}`} className={styles.reviewImage} />
                ))}
              </div>
            )}
          </div>
        ))}

        <button className={styles.viewMoreBtn} onClick={() => setShowAll((p) => !p)}>
          {showAll ? "View Less" : "View More"}
          <ChevronDownIcon
            style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
          />
        </button>
      </div>
    </section>
  );
}
