import React from 'react'
import '../Styles/WhatsAppChat.css';
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const ChatWithUs = () => {

    const navigate = useNavigate()
    const phoneNumber = '7204188504'; // Replace with your WhatsApp number
    const message = 'Hello! I need assistance.'; // Default message

    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div>
            <MdArrowBackIosNew
                onClick={() => navigate("/home")}
                style={{
                    color: "black",
                    fontSize: "26px",
                    marginLeft: "5px",
                    marginTop: "5px",
                }}
            />
            <div >
                <h3 style={{
                    textAlign: "center",
                    padding: "20px 0"
                }}>Chat With Us</h3>

                <div className="chatImg">
                    <img src="Assets/chat.gif" alt="" srcset="" style={{ textAlign: "center" }} />
                </div>


                <div className="whatsapp-chat">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <img src="Assets/whatspapp.png" alt="Chat with us on WhatsApp" />
                    </a>
                </div>
            </div>
        </div>
    )
}

export default ChatWithUs
