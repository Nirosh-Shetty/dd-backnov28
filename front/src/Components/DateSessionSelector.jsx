import React, { useRef, useMemo, useEffect, useState } from "react";
import "../Styles/DateSessionSelector.css";

/*
  Changes:
  - Use UTC-based YYYY-MM-DD keys for both menu items and date list
  - Add a fallback ISO-key mapping and a debug log for availability
*/

const getNextSevenDays = () => {
  const result = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    // create date at UTC midnight for stability across timezones
    const dUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i));
    result.push({
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : null,
      date: dUtc.getUTCDate(),
      month: dUtc.toLocaleString("default", { month: "short" }),
      weekday: dUtc.toLocaleString("default", { weekday: "long" }),
      dateObj: dUtc,
    });
  }
  return result;
};

// create YYYY-MM-DD from a Date using UTC components (stable)
const dateToKeyUTC = (date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const DateSessionSelector = ({ onChange, currentDate, currentSession, menuData = [] }) => {
  const dates = getNextSevenDays();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Build availability map YYYY-MM-DD (UTC) -> Set(session)
  const availability = useMemo(() => {
    const map = {};
    (menuData || []).forEach((item) => {
      if (!item?.deliveryDate || !item?.session) return;
      const d = new Date(item.deliveryDate);
      const keyUtc = dateToKeyUTC(d);
      if (!map[keyUtc]) map[keyUtc] = new Set();
      map[keyUtc].add(item.session);

      // fallback: also map ISO slice key if backend or other parts use that
      const isoKey = new Date(item.deliveryDate).toISOString().slice(0, 10);
      if (!map[isoKey]) map[isoKey] = new Set();
      map[isoKey].add(item.session);
    });

    // debug: inspect availability during dev
    // eslint-disable-next-line no-console
    console.debug("DateSessionSelector availability map:", map);
    return map;
  }, [menuData]);

  const now = () => new Date();

  const isSessionTimeBlocked = (dateObj, session) => {
    // Only block for today's date based on local time cutoffs
    const todayUtcKey = dateToKeyUTC(now());
    const key = dateToKeyUTC(dateObj);
    if (key !== todayUtcKey) return false;
    const hr = now().getHours();
    if (session === "Lunch" && hr >= 12) return true; // block Lunch after 12:00 local
    if (session === "Dinner" && hr >= 19) return true; // block Dinner after 19:00 local
    return false;
  };

  const sessionsForDate = (dateObj) => {
    if (!dateObj) return new Set();
    const key = dateToKeyUTC(dateObj);
    const base = availability[key] || new Set();
    const result = new Set(base);
    if (isSessionTimeBlocked(dateObj, "Lunch") && result.has("Lunch")) result.delete("Lunch");
    if (isSessionTimeBlocked(dateObj, "Dinner") && result.has("Dinner")) result.delete("Dinner");
    return result;
  };

  // Find nearest available session/date starting from given date (inclusive)
  const findNextAvailable = (startDateObj, preferredSession = null) => {
    const startKey = dateToKeyUTC(startDateObj);
    const startIndex = dates.findIndex((d) => dateToKeyUTC(d.dateObj) === startKey);
    const from = startIndex >= 0 ? startIndex : 0;
    for (let offset = 0; offset < dates.length; offset++) {
      const idx = from + offset;
      if (idx >= dates.length) break;
      const dobj = dates[idx].dateObj;
      const sessions = sessionsForDate(dobj);
      if (sessions.size === 0) continue;
      if (preferredSession && sessions.has(preferredSession)) return { dateObj: dobj, session: preferredSession };
      if (sessions.has("Lunch")) return { dateObj: dobj, session: "Lunch" };
      if (sessions.has("Dinner")) return { dateObj: dobj, session: "Dinner" };
    }
    return null;
  };

  // Auto-switch when current session becomes unavailable - pick nearest available slot (today..+6)
  useEffect(() => {
    if (!currentDate || !currentSession) return;
    const available = sessionsForDate(currentDate);
    if (available.size === 0 || !available.has(currentSession)) {
      const next = findNextAvailable(currentDate);
      if (next) onChange(next.dateObj, next.session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, currentSession, menuData]);

  const handleDateClick = (dateObj) => {
    const sessions = sessionsForDate(dateObj);
    if (!sessions || sessions.size === 0) return;
    const sessionToUse = currentSession && sessions.has(currentSession) ? currentSession : sessions.has("Lunch") ? "Lunch" : "Dinner";
    onChange(dateObj, sessionToUse);
  };

  const handleSessionClick = (session) => {
    if (!currentDate) return;
    const sessions = sessionsForDate(currentDate);
    if (!sessions.has(session)) return;
    onChange(currentDate, session);
  };

  // --- scroll state handling
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [menuData, dates.length]);

  const scrollLeft = () => {
    if (!canScrollLeft) return;
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
    setTimeout(updateScrollState, 220);
  };
  const scrollRight = () => {
    if (!canScrollRight) return;
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
    setTimeout(updateScrollState, 220);
  };

  const handleReset = () => {
    const next = getNextSevenDays();
    onChange(next[0].dateObj, "Lunch");
  };

  return (
    <div className="date-session-wrapper">
      <div className="reset-line">
        <span className="reset-btn" onClick={handleReset}>
          Reset to now ↻
        </span>
      </div>

      <div className="date-header">
        <button
          className={`nav-btn ${!canScrollLeft ? "disabled" : ""}`}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="scroll-left"
        >
          <img src="/Assets/arrowCircleBrown.svg" style={{ transform: "rotate(180deg)" }} alt="prev" />
        </button>

        <div className="date-strip" ref={scrollRef}>
          {dates.map((d, i) => {
            const sessions = sessionsForDate(d.dateObj);
            const isDisabled = sessions.size === 0;
            const active = currentDate && dateToKeyUTC(d.dateObj) === dateToKeyUTC(currentDate);
            return (
              <div
                key={i}
                className={`date-card ${active ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
                onClick={() => !isDisabled && handleDateClick(d.dateObj)}
              >
                <div className="day">{d.label}</div>
                <div className="date">{`${d.date} ${d.month}`}</div>
                <div className="weekday">{d.weekday}</div>
              </div>
            );
          })}
        </div>

        <button
          className={`nav-btn ${!canScrollRight ? "disabled" : ""}`}
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="scroll-right"
        >
          <img src="/Assets/arrowCircleBrown.svg" alt="next" />
        </button>
      </div>

      <div className="session-container">
        <div className={`session-btn-wrapper ${currentSession === "Lunch" ? "active" : ""} ${currentDate && !sessionsForDate(currentDate).has("Lunch") ? "disabled" : ""}`}>
          <button
            className={`session ${currentSession === "Lunch" ? "active" : ""} ${currentDate && !sessionsForDate(currentDate).has("Lunch") ? "disabled" : ""}`}
            onClick={() => handleSessionClick("Lunch")}
            disabled={currentDate && !sessionsForDate(currentDate).has("Lunch")}
          >
            <div className="title">Lunch</div>
            <div className="subtext">Order before 12:00 PM</div>
          </button>
        </div>

        <div className={`session-btn-wrapper ${currentSession === "Dinner" ? "active" : ""} ${currentDate && !sessionsForDate(currentDate).has("Dinner") ? "disabled" : ""}`}>
          <button
            className={`session ${currentSession === "Dinner" ? "active" : ""} ${currentDate && !sessionsForDate(currentDate).has("Dinner") ? "disabled" : ""}`}
            onClick={() => handleSessionClick("Dinner")}
            disabled={currentDate && !sessionsForDate(currentDate).has("Dinner")}
          >
            <div className="title">Dinner</div>
            <div className="subtext">Order before 07:00 PM</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSessionSelector;