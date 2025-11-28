import { useState } from 'react';
import { Drawer } from 'antd';
import moment from 'moment';
import { FaAngleUp, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "../Styles/MultiCartDrawer.css";
import MyMeal from "../assets/mymeal.svg";
import Swal2 from "sweetalert2";

const MultiCartDrawer = ({
    proceedToPlan,
    groupedCarts,
    overallSubtotal,
    overallTotalItems,
    onJumpToSlot // Function to set selectedDate/Session in Home.jsx
}) => {
    const user = JSON.parse(localStorage.getItem("user"));
    // const addresstype = localStorage.getItem("addresstype");
    // const address = JSON.parse(
    //     localStorage.getItem(
    //         addresstype === "apartment" ? "address" : "coporateaddress"
    //     )
    // );
 const address = JSON.parse(localStorage.getItem("currentLocation")??localStorage.getItem("primaryAddress"));
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const formatSlotDate = (date) => {
        const today = moment().startOf('day');
        const tomorrow = moment().add(1, 'days').startOf('day');
        const dateMoment = moment(date).startOf('day');
        if (dateMoment.isSame(today)) return "Today";
        if (dateMoment.isSame(tomorrow)) return "Tomorrow";
        return moment(date).format('MMM D');
    };

    const handleSlotDetailClick = (slot) => {
        onJumpToSlot(slot.date, slot.session);
        setIsDrawerOpen(false);
    };

    const handleCheckout = () => {
        setIsDrawerOpen(false);
        navigate("/checkout");
    };

    if (overallTotalItems === 0) {
        return null;
    }

    return (
        <>
            {/* small "All Slots" bubble above closed bar */}
            {isDrawerOpen || <>
                {groupedCarts.length>1 &&
                <>
                 <div className="all-slots-bubble" onClick={() => setIsDrawerOpen(true)}>
                    All Slots
                    <img src="/Assets/arrowup.svg" />
                </div>
                <div className='cartbutton'>
                    <div className='cartbtn back1'></div>
                    <div className='cartbtn back2'></div>
                </div>
                </>
                }

                <div className="cartbutton">
                    <div className={`cartbtn ${groupedCarts.length>1?'multi-cart':"" }`}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-1 align-items-center">
                                {/* <p className="cart-slot-type">{SloteType}</p> */}
                                <div className="cart-items-price">
                                    {overallTotalItems} items | ₹{overallSubtotal.toFixed(0)}
                                </div>
                            </div>
                            {user ? (
                                <a
                                    onClick={() => {
                                        if (!(user && !address)) {
                                            proceedToPlan();
                                        }
                                    }}
                                    style={{
                                        color: "unset",
                                        textDecoration: "none",
                                        opacity: user && !address ? 0.5 : 1,
                                        pointerEvents: user && !address ? "none" : "auto",
                                    }}
                                >
                                    <div className="d-flex gap-1 align-content-center ">
                                        <div className="my-meal-icon">
                                            <img src={MyMeal} alt="" />
                                            <div className="red-icon"></div>
                                        </div>

                                        <div className="my-meal-text">My Meal</div>
                                    </div>
                                </a>
                            ) : (
                                <div
                                    className="d-flex gap-2 viewcartbtn"
                                    onClick={() => {
                                         const address = JSON.parse(localStorage.getItem("currentLocation")??localStorage.getItem("primaryAddress"));
                                        if (!address) {
                                            Swal2.fire({
                                                toast: true,
                                                position: "bottom",
                                                icon: "info",
                                                title: `Please sign in to your account`,
                                                showConfirmButton: false,
                                                timer: 3000,
                                                timerProgressBar: true,
                                                customClass: {
                                                    popup: "me-small-toast",
                                                    title: "me-small-toast-title",
                                                },
                                            });
                                            // return;
                                        }
                                        navigate("/", { replace: true });
                                    }}
                                >
                                    <div className="my-meal-icon">
                                        <img src={MyMeal} alt="My Meal" />
                                        <div className="red-icon"></div>
                                    </div>

                                    <div className="my-meal-text">My Meal</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Glass bottom floating bar (closed state) */}
                {/* <div className="cartbutton-manager">
                    <div className="green-pill cartbtn">
                        <div className="left-badge">
                            <span className="items-count">{overallTotalItems} items</span>
                            <span className="divider">|</span>
                            <span className="items-price">₹{overallSubtotal.toFixed(0)}</span>
                        </div>

                        <div className="right-action">
                            <div className="icon-wrap">
                                <img src="/Assets/mydishes.svg" alt="MyDishes" /> 
                                <span className="red-dot" />
                            </div>
                            <div className="pill-text">My Dishes</div>
                        </div>
                    </div>
            </div> */}
            </>
            }

            {/* Expanded drawer */}
            <Drawer
                placement="bottom"
                closable={false}
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                height={Math.min(700, groupedCarts.length * 92 + 170)}
                className="multi-cart-drawer"
            >
                {/* center close circle overlapping */}
                <div className="center-close-circle" onClick={() => setIsDrawerOpen(false)}>
                    <FaTimes size={18} color="#fff" />
                </div>
                <div className=" multi-cart-drawer-content">
                    <div className="multi-cart-header">
                        {/* <h3>Your Meals</h3> */}
                        <div className="checkout-top" onClick={proceedToPlan}>
                            Checkout All <img src="/Assets/checkoutback.svg" style={{ transform: "rotate(0deg)" }}  />
                        </div>
                    </div>

                    <div className="slot-list-container">



                        {groupedCarts.map((slot, index) => (
                            <div className="cartbutton">
                                <div className="mc-cartbtn">
                                    <div className="d-flex justify-content-around align-items-center gap-2">
                                        <div className="d-flex gap-1 align-items-center">
                                            {/* <p className="cart-slot-type">{SloteType}</p> */}
                                            <div className="cart-items-price">
                                                {slot.totalItems} items | ₹{slot.subtotal.toFixed(0)}
                                            </div>
                                        </div>
                                        <div className="slot-title-details">
                                            <div className="slot-session-date">
                                                <span className="session-name">{slot.session}</span>
                                                <span className="date-name">- {formatSlotDate(slot.date)}</span>
                                            </div>
                                            {/* <span className="item-count-small">
                                        {slot.items?.length || 0} products
                                    </span> */}
                                        </div>
                                        <a
                                            onClick={() => {
                                                handleSlotDetailClick(slot)
                                            }}
                                            style={{
                                                color: "unset",
                                                textDecoration: "none",
                                                // opacity: user && !address ? 0.5 : 1,
                                                // pointerEvents: user && !address ? "none" : "auto",
                                            }}
                                        >
                                            <div className="d-flex gap-1 align-content-center ">
                                                <div className="my-meal-icon">
                                            <img src={MyMeal} alt="" />
                                                    {/* <img src={} alt="" /> */}
                                                    {/* <div className="red-icon"></div> */}
                                                </div>

                                                <div className="my-meal-text">Details</div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Drawer>
        </>
    );
};

export default MultiCartDrawer;