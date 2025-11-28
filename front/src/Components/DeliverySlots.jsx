import React, { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";

import { Modal } from "react-bootstrap";

import { PiWarningCircleBold } from "react-icons/pi";

// import { IoCloseCircleOutline } from 'react-icons/io5';
import { Check } from "lucide-react";

import moment from "moment";

const DeliverySlots = ({
  availableSlots,
  setAvailableSlots,
  address,
  setSlotdata,
  deliveryMethod,
  setDeliveryMethod,
}) => {
  console.log(address, "address in slots");
  const [selectedSlot, setSelectedSlot] = useState("");

  const [showFAQModal, setShowFAQModal] = useState(false);

  const SloteType = moment().hour() < 14 ? "lunch" : "dinner";

  const [showNotAvailableModal, setShowNotAvailableModal] = useState(false);

  const [showWhySlotsModal, setShowWhySlotsModal] = useState(false);

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isExpressAvailable, setIsExpressAvailable] = useState(false);
  const [showExpressDelPausedModal, setShowExpressDelPausedModal] =
    useState(false);
  const lunchSlots = address?.lunchSlots
    ? address?.lunchSlots?.map((slot) => {
        const [start, end] = slot.time.split("-");

        const [startHour, startMinute] = start.split(":");

        const [endHour, endMinute] = end.split(":");

        return {
          start:
            (startHour < 10 ? 12 + Number(startHour) : startHour) +
            ":" +
            startMinute,

          end:
            (endHour < 10 ? 12 + Number(endHour) : endHour) +
            ":" +
            endMinute?.slice(0, 2),

          available: slot.active,
        };
      })
    : [];

  const dinnerSlots = address?.dinnerSlots
    ? address?.dinnerSlots?.map((slot) => {
        const [start, end] = slot?.time?.split("-");

        const [startHour, startMinute] = start.split(":");

        const [endHour, endMinute] = end.split(":");

        return {
          start:
            (startHour < 10 ? 12 + Number(startHour) : startHour) +
            ":" +
            startMinute,

          end:
            (endHour < 10 ? 12 + Number(endHour) : endHour) +
            ":" +
            endMinute?.slice(0, 2),

          available: slot.active,
        };
      })
    : [];

  const slots = {
    lunch:
      lunchSlots?.length > 0
        ? lunchSlots
        : [
            { start: "12:30", end: "12:45", available: true },

            { start: "12:45", end: "13:00", available: true },

            { start: "13:00", end: "13:15", available: true },

            { start: "13:15", end: "13:30", available: true },

            { start: "13:30", end: "13:45", available: true },

            { start: "13:45", end: "14:00", available: true },

            { start: "14:00", end: "14:15", available: true },

            { start: "14:15", end: "14:30", available: true },

            { start: "14:30", end: "14:45", available: true },
          ],

    dinner:
      dinnerSlots?.length > 0
        ? dinnerSlots
        : [
            { start: "19:30", end: "19:45", available: true },

            { start: "19:45", end: "20:00", available: true },

            { start: "20:00", end: "20:15", available: true },

            { start: "20:15", end: "20:30", available: true },

            { start: "20:30", end: "20:45", available: true },

            { start: "20:45", end: "21:00", available: true },

            { start: "21:00", end: "21:15", available: true },

            { start: "21:15", end: "21:30", available: true },
          ],
  };

  const formatTo12Hour = (time, type) => {
    const [hour, minute] = time.split(":").map(Number);

    const suffix = hour >= 12 ? "PM" : "AM";

    const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    const formattedMinute = minute < 10 ? `0${minute}` : minute;

    const formateHour =
      formattedHour < 10 ? `0${formattedHour}` : formattedHour;

    if (type === "start") {
      return `${formateHour}:${formattedMinute}`;
    } else {
      return `${formateHour}:${formattedMinute} ${suffix}`;
    }
  };

  const formatSlotRange = (startTime, endTime) => {
    const formattedStart = formatTo12Hour(startTime, "start");

    const formattedEnd = formatTo12Hour(endTime, "end");

    return `${formattedStart} - ${formattedEnd}`;
  };

  const getDynamicSlots = (currentTime, sequentialDeliveryTime) => {
    if (!currentTime || !moment(currentTime, "HH:mm", true).isValid()) {
      console.error("Invalid currentTime format:", currentTime);

      return [];
    }

    const approxTime = Number(sequentialDeliveryTime) || 40;

    if (approxTime < 0) {
      console.error("Invalid sequentialDeliveryTime:", sequentialDeliveryTime);

      return [];
    }

    const currentMoment = moment(currentTime, "HH:mm");

    const deliveryTime = currentMoment.clone().add(approxTime, "minutes");

    // ✅ Use current time to decide slot type

    const slotType = currentMoment.hour() < 14 ? "lunch" : "dinner";

    const baseSlots = slots[slotType];

    const slotsToShow = [];

    baseSlots.forEach((slot) => {
      const slotStart = moment(slot.start, "HH:mm");

      const slotEnd = moment(slot.end, "HH:mm");

      if (
        deliveryTime.isSameOrAfter(slotStart) &&
        deliveryTime.isBefore(slotEnd)
      ) {
        // console.log(" If slot",slot);

        slotsToShow.push(slot);
      } else if (slotStart.isAfter(deliveryTime)) {
        // console.log(" Else if slot",slot);

        slotsToShow.push(slot);
      } else {
        // console.log(" Else else slot",slot);

        slotsToShow.push({ ...slot, available: false });
      }
    });

    return slotsToShow;
  };

  const AddressType = localStorage.getItem("addresstype");

  useEffect(() => {
    const getCurrentTimeSlots = () => {
      const current = new Date();
      // const hours = current.getHours();
      const hours = 12;
      const minutes = current.getMinutes();
      // const hours = 12
      // const minutes = 30;
      // const AddressType=localStorage.getItem("addresstype");
      // const endTime=AddressType==="corporate"?"20:00":"21:00";

      const time = `${hours < 10 ? "0" + hours : hours}:${
        minutes < 10 ? "0" + minutes : minutes
      }`;
      const isLunchWindow = time >= "12:00" && time <= "14:00";
      const isDinnerWindow = time >= "19:00" && time <= "21:00";
      setIsExpressAvailable(isLunchWindow || isDinnerWindow);
      // setIsExpressAvailable(isLunchWindow);
      console.log(time, "current time");
      let slotsToShow = [];

      // console.log("Current time:", time, "Approx time:", address?.approximatetime);
      // Lunch: 7:00 AM - 2:00 PM

      if (time >= "07:00" && time < "12:00") {
        slotsToShow = slots.lunch;
      } else if (time >= "12:00" && time <= "14:00") {
        slotsToShow = getDynamicSlots(
          time,
          parseInt(address?.sequentialDeliveryTime) || 30,
          address?.lunchSlots
        );
      }

      // Dinner: 2:00 PM - 9:00 PM
      else if (time >= "14:00" && time < "19:00") {
        slotsToShow = slots.dinner;
      } else if (time >= "19:00" && time <= "21:00") {
        slotsToShow = getDynamicSlots(
          time,
          parseInt(address?.sequentialDeliveryTime) || 30,
          address?.dinnerSlots
        );
      } else {
        // setEndstatus(true);
        slotsToShow = [];
      }
      // console.log("slotsToShow", slotsToShow);
      setAvailableSlots(
        slotsToShow.map((slot, index) => {
          return {
            id: index + 1,
            available: slot.available,
            time:
              typeof slot === "string"
                ? slot
                : formatSlotRange(slot.start, slot.end),
          };
        })
        //   typeof slot === "string" ? slot : formatSlotRange(slot.start, slot.end)}
      );
    };
    getCurrentTimeSlots();
    const interval = setInterval(getCurrentTimeSlots, 60000);
    return () => clearInterval(interval);
  }, [address?.sequentialDeliveryTime]);

  const [showBeforeEndTime, setShowBeforeEndTime] = useState("00:00");
  const handleExpressClick = () => {
    if (isExpressAvailable) {
      setDeliveryMethod("express");
    } else {
      setShowExpressDelPausedModal(true);
    }
  };

  const handleSlotSelect = (time, available) => {
    if (available) {
      setSelectedSlot(time);

      setSlotdata(time);
    } else {
      const [startTime, endTime] = time.split("-");

      const [hours, minutes] = startTime.split(":");

      const formattedHours = Number(hours) < 10 ? Number(hours) + 12 : hours;

      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      const currentTime = moment(
        `${formattedHours}:${formattedMinutes}`,
        "HH:mm"
      );

      const beforeEndTime = currentTime
        .clone()
        .subtract(address?.sequentialDeliveryTime || 30, "minutes");

      setShowBeforeEndTime(
        formatTo12Hour(beforeEndTime.format("HH:mm"), "end")
      );

      // console.log("beforeEndTime", beforeEndTime);

      // setShowBeforeEndTime(beforeEndTime);
      setDeliveryMethod("");
      setShowNotAvailableModal(true);
    }
  };
  const handleSecurityClick = () => {
    // console.log('Security Modal Clicked');
    setShowSecurityModal(true);
  };
  const handleFAQClick = () => {
    setShowFAQModal(true);
  };

  // console.log("SloteType",SloteType);

  const checkAvailableSlots = () => {
    if (AddressType === "apartment") {
      return false;
    } else if (SloteType === "lunch" && lunchSlots.length > 0) {
      return true;
    } else if (SloteType === "dinner" && dinnerSlots.length > 0) {
      return true;
    }

    return false;
  };

  // if availableSlots is empty then show the slots from the address
  return (
    <div className="container-fluid p-0 mt-2">
      <div className="delivery-type-container">
        <h5>Choose delivery type</h5>
        <div className="delivery-options-box">
          {/* Option 1: Pick a slot */}
          <div
            className="delivery-option"
            onClick={() =>
              checkAvailableSlots()
                ? setDeliveryMethod("slot")
                : setShowNotAvailableModal(true)
            }
            style={{
              cursor: checkAvailableSlots() ? "pointer" : "not-allowed",
              opacity: checkAvailableSlots() ? 1 : 0.6,
            }}
          >
            <div
              className={`custom-checkbox ${
                deliveryMethod === "slot" ? "checked" : ""
              }`}
            >
              {deliveryMethod === "slot" && (
                <Check color="white" strokeWidth={3} />
              )}
            </div>
            <div className="option-text">
              <p className="option-title">
                Pick a slot. Free delivery, fresher meals, lower CO₂
              </p>
              <p className="option-subtitle">
                ETA ~{address.sequentialDeliveryTime}mins 🌍♻️
              </p>
            </div>
          </div>

          {/* "Why slots?" Link */}
          <button
            className="why-link"
            onClick={() => setShowWhySlotsModal(true)}
          >
            Why slots?
          </button>

          {/* Option 2: Express */}
          <div
            className="delivery-option"
            onClick={handleExpressClick}
            style={{
              cursor: isExpressAvailable ? "pointer" : "not-allowed",
              opacity: isExpressAvailable ? 1 : 0.6,
            }}
          >
            <div
              className={`custom-checkbox ${
                deliveryMethod === "express" ? "checked" : ""
              }`}
            >
              {deliveryMethod === "express" && (
                <Check color="white" strokeWidth={3} />
              )}
            </div>
            <div className="option-text">
              <p className="option-title">
                Need it now? Express{" "}
                <span className="express-price">
                  ₹{address.expressDeliveryPrice}
                </span>
              </p>
              <p className="option-subtitle">
                ETA ~{address.expressDeliveryTime}mins ⚡️
              </p>
            </div>
          </div>
        </div>
      </div>
      {availableSlots.length > 0 ? (
        <>
          {/* <button className='available-slots'>Available Slots</button> */}

          {/* Content */}

          {deliveryMethod === "slot" && checkAvailableSlots() && (
            <h6>Available delivery Slots</h6>
            // <div className='note-delivery'>
            //    <p className='text-muted mb-0' style={{ fontSize: '14px' }}>
            //     Our riders deliver in 5-min slots, being on-time at delivery
            //     points helps us{' '}
            //     <span className='fw-semibold text-dark'>
            //       keep your deliveries free
            //     </span>{' '}
            //     <span style={{ fontSize: '16px' }}>😇</span>
            //   </p>

            // </div>
          )}

          {/* Time Slots Grid */}
          {/* Time Slots Grid - Now the entire div is conditional */}
          {deliveryMethod === "slot" && (
            <div className="time-slots-box">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  className={`time-slot-item ${
                    slot.available
                      ? selectedSlot === slot.time
                        ? "time-slot-item-selected"
                        : "time-slot-item-unselected"
                      : "time-slot-item-disabled"
                  } ${!slot.available ? "disabled" : ""}`}
                  onClick={() => handleSlotSelect(slot.time, slot.available)}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Navigation */}

          {checkAvailableSlots() && (
            <div className="delivery-point-box">
              <div className="delivery-point-item">
                <span className="delivery-point-item-text">Drop Point:</span>

                {/* <span className="delivery-point-item-text">:</span> */}
                <span
                  className="delivery-point-item-security"
                  onClick={
                    !address?.deliverypoint ||
                    address?.deliverypoint == "Security entry Point"
                      ? handleSecurityClick
                      : undefined
                  }
                >
                  {address?.deliverypoint || "Security entry Point"}
                  <sup>
                    <PiWarningCircleBold
                      color="#ffffff"
                      height={24}
                      width={6}
                    />
                  </sup>
                </span>
              </div>
              <div className="delivery-point-item-faq" onClick={handleFAQClick}>
                Delivery{" "}
                <span className="delivery-point-item-faq-text">FAQs</span>
                <sup>
                  <PiWarningCircleBold color="#F91D0F" height={24} width={6} />
                </sup>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="">
          No available slots at the moment. Please try again during operational
          hours (7:00 AM - 9:00 PM).
        </div>
      )}

      {/* FAQ Bootstrap Modal */}

      {/* <Modal show={showFAQModal} onHide={() => setShowFAQModal(false)} centered>
<div className="faq-modal-body">
<div className="faq-modal-body-header">
<div className="faq-modal-body-header-text">
<span className="faq-modal-body-header-text-title">🛵{" "} On-time or on us</span>
<span className="faq-modal-body-header-text-description">

                                If our rider misses slot, 💸 <span className="faq-modal-body-header-text-description-amount">₹100</span> is credited <span className="faq-modal-body-header-text-description-wallet">to your wallet</span> & your food will be delivered in the next slot.
</span>
</div>
<IoCloseCircleOutline height={30} width={30} onClick={() => setShowFAQModal(false)} className='faq-modal-body-header-close' />
</div>
 
                    <div className="faq-missed-pickup">
<div className="faq-missed-pickup-text">

                            🔄{" "} Missed your pickup?
</div>
<div className="faq-missed-pickup-description">
<u>If it’s not the last slot</u>, you can still collect it in the next slot.
</div>
</div>
</div>
</Modal>
 
 
            <Modal show={showNotAvailableModal} onHide={() => setShowNotAvailableModal(false)} centered className='not-available-modal'>
<div className="not-available-content">
<div className="not-available-content-header">
<h5 className="">⏰ Oops, you just missed this slot</h5>
<IoCloseCircleOutline height={30} width={30} onClick={() => setShowNotAvailableModal(false)} className='not-available-content-header-close' />
</div>
 
                    <p className="">

                        Please place your order before <b>{showBeforeEndTime}</b>  next time
</p>
</div>
</Modal> */}

      {/* UPDATED FAQ Modal */}
      <Modal
        show={showFAQModal}
        onHide={() => setShowFAQModal(false)}
        centered
        dialogClassName="faq-modal-updated"
      >
        <Modal.Header closeButton>
          <Modal.Title as="h5">Delivery slots — quick answers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="faq-item">
            <p>
              <strong>1. Why choose a slot?</strong>
            </p>
            <p>
              It keeps your food hot, reduces delivery fees and emissions, and
              helps us keep prices low.
            </p>
          </div>
          <div className="faq-item">
            <p>
              <strong>2. What if the rider doesn’t show?</strong>
            </p>
            <p>
              We’ll move your order to the next slot and refund any delivery fee
              to your wallet.
            </p>
          </div>
          <div className="faq-item">
            <p>
              <strong>3. What is Express?</strong>
            </p>
            {/* <p>Pay ₹49 for about 10-min delivery when you need it urgently.</p> */}
            <p>
              <p>
                Pay ₹{address.expressDeliveryPrice} for about{" "}
                {address.expressDeliveryTime}-min delivery when you need it
                urgently.
              </p>
            </p>
          </div>
          <div className="faq-item">
            <p>
              <strong>4. Where is handover done?</strong>
            </p>
            <p>We hand orders at the building’s Security Gate as per policy.</p>
          </div>
          <div className="faq-item">
            <p>
              <strong>5. Can I skip slot selection?</strong>
            </p>
            <p>
              If you don’t pick a slot, we’ll automatically assign the nearest
              available one.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="got-it-btn" onClick={() => setShowFAQModal(false)}>
            Got it
          </button>
        </Modal.Footer>
      </Modal>

      {/* UPDATED Not Available Modal */}
      <Modal
        show={showNotAvailableModal}
        onHide={() => setShowNotAvailableModal(false)}
        centered
        dialogClassName="not-available-modal-updated"
      >
        <Modal.Body>
          <p className="not-available-title">Sorry, no free slots right now</p>
          <p className="not-available-subtitle">
            Need it now? about {address.expressDeliveryTime} min
          </p>
          <button /* ... */>
            Get it now for <b>₹{address.expressDeliveryPrice}</b>
          </button>
        </Modal.Body>
      </Modal>

      {/* --- ADD THESE NEW MODALS --- */}
      <Modal
        show={showWhySlotsModal}
        onHide={() => setShowWhySlotsModal(false)}
        centered
        dialogClassName="info-modal"
      >
        <Modal.Body>
          <h5>Why slots?</h5>
          <ol>
            <li>Scheduled slots keep food hot and ready.</li>
            <li>Fewer trips help reduce delivery fees and CO₂.</li>
            <li>
              {/* Select Express for <b>₹49</b> if you need it instantly. */}
              Select Express for <b>₹{address.expressDeliveryPrice}</b> if you
              need it instantly.
            </li>
          </ol>
          <button
            className="got-it-btn"
            onClick={() => setShowWhySlotsModal(false)}
          >
            Got it
          </button>
        </Modal.Body>
      </Modal>

      <Modal
        show={showSecurityModal}
        onHide={() => setShowSecurityModal(false)}
        centered
        dialogClassName="info-modal"
      >
        <Modal.Body>
          <h5>Why here?</h5>
          <p>
            Building policy requires handover at the Security Gate. Our riders
            are not allowed beyond this point.
          </p>
          <button
            className="got-it-btn"
            onClick={() => setShowSecurityModal(false)}
          >
            Got it
          </button>
        </Modal.Body>
      </Modal>
      <Modal
        show={showExpressDelPausedModal}
        onHide={() => setShowExpressDelPausedModal(false)}
        centered
        dialogClassName="info-modal"
      >
        <Modal.Body>
          <h5>Instant delivery paused ⏯️</h5>
          <p>
            Our kitchen team takes short breaks between meals. We'll be back for
            lunch (12 – 2 PM) and dinner (7 – 9 PM)
          </p>
          <p style={{ marginTop: "16px", fontWeight: "500" }}>
            You can still preorder your next meal anytime 🍲
          </p>
          <button
            className="got-it-btn"
            onClick={() => setShowExpressDelPausedModal(false)}
          >
            Got it
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DeliverySlots;
