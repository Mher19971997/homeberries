import React from "react";
import { StarIcon, StarHalfIcon, StarEmptyIcon, ChevronDownIcon } from "@homeberris/assets/icons/reviews";
import { Paperclip, Send } from "lucide-react";
import styles from "./index.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "@homeberris/http/commentApi";
import { useCookies } from "react-cookie";
import { checkToken } from "@homeberris/utils/auth";
import { UUID } from "crypto";
import { useTranslation } from "react-i18next";

const INITIAL_COUNT = 3;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<StarIcon key={i} />);
    else if (rating >= i - 0.5) stars.push(<StarHalfIcon key={i} />);
    else stars.push(<StarEmptyIcon key={i} />);
  }
  return <div className={styles.stars}>{stars}</div>;
}

function CommentInput({ isAuth, rating, setRating, text, setText, image, setImage, isPending, onSend }: any) {
  const [focused, setFocused] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  if (!isAuth) return (
    <input type="text" className={styles.leaveCommentInput} placeholder="Leave Comment" readOnly style={{ cursor: "not-allowed", opacity: 0.6 }} />
  );

  return (
    <div style={{
      marginTop: 20, border: `1px solid ${focused ? "#242424" : "#d5d5d5"}`,
      borderRadius: 8, transition: "border-color 0.2s ease", background: "#fff",
    }}>
      <input
        type="text"
        placeholder="Leave Comment"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => !text && !image && setFocused(false)}
        style={{
          width: "100%", padding: "24px 16px", minHeight: 64, border: "none", outline: "none",
          fontSize: 14, fontFamily: "inherit", color: "#242424", borderRadius: 8,
          background: "transparent",
        }}
      />
      {focused && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderTop: "1px solid #f0f0f0" }}>
          {/* Star picker */}
          <div style={{ display: "flex", gap: 2, cursor: "pointer" }}>
            {[1,2,3,4,5].map((i) => (
              <span key={i} onClick={() => setRating(i)} style={{ fontSize: 18 }}>
                {rating >= i ? <StarIcon /> : <StarEmptyIcon />}
              </span>
            ))}
          </div>
          {/* Image */}
          <span onClick={() => fileRef.current?.click()} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#868695" }} title="Прикрепить файл">
            <Paperclip size={16} strokeWidth={1.8} />
            {!image && <span style={{ fontSize: 12 }}>Прикрепить файл</span>}
          </span>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setImage(e.target.files?.[0] || null)} />
          {image && <span style={{ fontSize: 12, color: "#868695" }}>{image.name}</span>}
          {/* Send */}
          <button
            onClick={onSend}
            disabled={isPending || !text.trim()}
            style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: isPending || !text.trim() ? 0.5 : 1 }}
          >
            <Send size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div style={{ display: "flex", gap: 2, cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(i)}>
          {(hovered || value) >= i ? <StarIcon /> : <StarEmptyIcon />}
        </span>
      ))}
    </div>
  );
}

interface Props {
  catalog?: any;
}

export default function ProductReviewsSection({ catalog }: Props) {
  const { t } = useTranslation('common');
  const [showAll, setShowAll] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [text, setText] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const [cookies] = useCookies(["token"]);
  const isAuth = checkToken();
  const queryClient = useQueryClient();

  const comments: any[] = catalog?.comments || [];

  const avgRating = comments.length > 0
    ? Math.round((comments.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / comments.length) * 10) / 10
    : 0;

  const bars = [
    { label: "Excellent", min: 5, max: 5 },
    { label: "Good", min: 4, max: 4 },
    { label: "Average", min: 3, max: 3 },
    { label: "Below Average", min: 2, max: 2 },
    { label: "Poor", min: 1, max: 1 },
  ].map((b) => ({ label: b.label, count: comments.filter((c: any) => c.rating >= b.min && c.rating <= b.max).length }));

  const maxBar = Math.max(...bars.map((b) => b.count), 1);
  const visibleComments = showAll ? comments : comments.slice(0, INITIAL_COUNT);

  const { mutate, isPending } = useMutation({
    mutationFn: () => createComment({ text, catalogUuid: catalog?.uuid as UUID, rating, image: image || undefined }, cookies.token),
    onSuccess: () => {
      setText(""); setRating(5); setImage(null);
      queryClient.invalidateQueries({ queryKey: ["getCatalogByUud", catalog?.uuid] });
    },
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <section className={styles.section}>
      {/* Рейтинг */}
      <div className={styles.ratingBlock}>
        <h2 className={styles.title}>{t('reviews.title')}</h2>
        <div className={styles.ratingInner}>
          <div className={styles.ratingLeft}>
            <div className={styles.ordinaryClass}>
              <span className={styles.ratingNumber}>{avgRating || "—"}</span>
              <br />
              <span className={styles.ratingTotal}>of {comments.length} reviews</span>
            </div>
            {avgRating > 0 && <StarRating rating={avgRating} />}
          </div>
          <div className={styles.ratingBars}>
            {bars.map((bar) => (
              <div key={bar.label} className={styles.barRow}>
                <span className={styles.barLabel}>{bar.label}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${(bar.count / maxBar) * 100}%` }} />
                </div>
                <span className={styles.barCount}>{bar.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Comment */}
        <CommentInput
          isAuth={!!isAuth}
          rating={rating}
          setRating={setRating}
          text={text}
          setText={setText}
          image={image}
          setImage={setImage}
          isPending={isPending}
          onSend={() => text.trim() && mutate()}
        />
      </div>

      {/* Отзывы */}
      {comments.length > 0 && (
        <div className={styles.reviewsBlock}>
          {visibleComments.map((comment: any, idx: number) => {
            const name = comment.user?.name || comment.user?.email || "User";
            const imgSrc = comment.image ? (comment.image.startsWith("/") ? baseUrl + comment.image : baseUrl + "/" + comment.image) : null;
            return (
              <div key={comment.uuid} className={`${styles.reviewItem} ${idx < visibleComments.length - 1 ? styles.reviewItemBorder : ""}`}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewAuthor}>
                    <div className={styles.avatar}>
                      <span>{name[0]?.toUpperCase()}</span>
                    </div>
                    <div className={styles.authorInfo}>
                      <span className={styles.authorName}>{name}</span>
                      {comment.rating > 0 && <StarRating rating={comment.rating} />}
                    </div>
                  </div>
                  <span className={styles.reviewDate}>{formatDate(comment.createdAt)}</span>
                </div>
                <p className={styles.reviewText}>{comment.text}</p>
                {imgSrc && (
                  <div className={styles.reviewImages}>
                    <img src={imgSrc} alt="review" className={styles.reviewImage} />
                  </div>
                )}
              </div>
            );
          })}

          {comments.length > INITIAL_COUNT && (
            <button className={styles.viewMoreBtn} onClick={() => setShowAll((p) => !p)}>
              {showAll ? "View Less" : "View More"}
              <ChevronDownIcon style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
