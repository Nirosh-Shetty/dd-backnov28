import React, { useRef, useState, useEffect, useMemo } from "react";
import "../Styles/CheckoutDateStrip.css"; // Import the new CSS

const getNextSevenDays = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i)
    );

    const label =
      i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[date.getUTCDay()];

    result.push({
      label,
      displayDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dateKey: date.toISOString(), // The full UTC date string, e.g., "2025-11-09T00:00:00.000Z"
    });
  }
  return result;
};


// Simple SVG for arrows
const ArrowLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const CheckoutDateStrip = ({
  cartDates, // This is a Set of date strings
  activeDateKey,
  onDateSelect,
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Generate the 7 days to display
  const displayDates = useMemo(() => getNextSevenDays(), []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      }
    };
  }, [displayDates]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="checkout-date-strip-container">
      <button
        // className="checkout-date-nav-btn"
        className={`nav-btn ${!canScrollLeft ? "disabled" : ""}`}

        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
      >
        {/* <ArrowLeft /> */}
        <img src="/Assets/arrowCircleBrown.svg" style={{ transform: "rotate(180deg)" }} alt="prev" />

      </button>

      <div className="date-strip-scroller" ref={scrollRef}>
        {displayDates.map((d) => {
          // Check if this date exists in the cart
          const hasCartItems = cartDates.has(d.dateKey);

          return (
            <div
              key={d.dateKey}
              className={`date-card-checkout ${d.dateKey === activeDateKey ? "active" : ""
                } ${!hasCartItems ? "disabled" : ""}`}
              onClick={() => {
                // Only allow selection if it's not disabled
                if (hasCartItems) {
                  onDateSelect(d.dateKey);
                }
              }}
            >
              <div className="date">{d.displayDate}</div>
              <div className="day">{d.label}</div>
            </div>
          );
        })}
      </div>

      <button
        // className="checkout-date-nav-btn"
        className={`nav-btn ${!canScrollRight ? "disabled" : ""}`}
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
      >
        {/* <ArrowRight /> */}
        <img src="/Assets/arrowCircleBrown.svg" alt="next" />
      </button>
    </div>
  );
};

export default CheckoutDateStrip;