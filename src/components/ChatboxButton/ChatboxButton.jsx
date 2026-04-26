"use client";
import { useState, useRef, useEffect } from "react";
import { FaHeadset, FaPaperPlane, FaTimes } from "react-icons/fa";
import OptionButtonsChatbot from "../OptionButtonsChatbot/OptionButtonsChatbot";
import ProductListChatbot from "../ProductListChatbot/ProductListChatbot";
import BlogListChatbot from "../BlogListChatbot/BlogListChatbot"; // import BlogListChatbot
import "../../styles/css/ChatboxButton.css";

export default function ChatboxButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
    ]);

    const messagesEndRef = useRef(null);
    const toggleChatbox = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");

        try {
            const res = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });
            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: data.text || data.reply || "Xin lỗi, tôi không hiểu yêu cầu của bạn.",
                    products: data.products || null,
                    blogs: data.blogs || null,
                    seeMoreUrl: data.seeMoreUrl || null,
                    options: data.options || null,
                },
            ]);

        } catch (error) {
            console.error("Lỗi gọi API Chatbot:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Có lỗi xảy ra, vui lòng thử lại." },
            ]);
        }
    };

    const handleOptionSelect = async (option) => {
        const newMessages = [...messages, { sender: "user", text: option }];
        setMessages(newMessages);

        try {
            const res = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: option }),
            });
            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: data.text || data.reply || "Xin lỗi, tôi không hiểu yêu cầu của bạn.",
                    products: data.products || null,
                    seeMoreUrl: data.seeMoreUrl || null,
                    options: data.options || null,
                },
            ]);

        } catch (error) {
            console.error("Lỗi gọi API Chatbot:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Có lỗi xảy ra, vui lòng thử lại." },
            ]);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            <button
                onClick={toggleChatbox}
                className="fixed bottom-4 right-4 bg-white text-gray-900 border border-gray-300 rounded-full shadow-lg z-50 transition-all duration-300 min-w-[70px] min-h-[70px] flex flex-col items-center justify-center hover:shadow-xl hover:scale-105"
            >
                <div className="relative">
                    <FaHeadset size={25} className="text-gray-700" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <span className="text-xs font-medium mt-1">Trợ lý AI</span>
            </button>

            {isOpen && (
                <div className="chatbox-container">
                    <div className="chatbox-header">
                        <div className="chatbox-header-left">
                            <div className="chatbox-status-dot"></div>
                            <div className="chatbox-title">Trợ lý AI - Đồng Hồ WATCHES</div>
                        </div>
                        <button onClick={toggleChatbox} className="chatbox-close-btn">
                            <FaTimes size={16} />
                        </button>
                    </div>

                    <div className="chatbox-content">
                        <div className="chatbox-messages">
                            {messages.map((msg, i) => (
                                <div key={i} className={`chatbox-message ${msg.sender === "bot" ? "bot" : "user"}`}>
                                    <div className={`chatbox-bubble ${msg.sender === "bot" ? "bot" : "user"}`}>
                                        {msg.text}
                                        {msg.products && (
                                            <ProductListChatbot
                                                products={msg.products}
                                                seeMoreUrl={msg.seeMoreUrl}
                                            />
                                        )}
                                        {msg.blogs && (
                                            <BlogListChatbot
                                                blogs={msg.blogs}
                                                seeMoreUrl="/tin-tuc"
                                            />
                                        )}
                                        {msg.options && (
                                            <OptionButtonsChatbot
                                                options={msg.options}
                                                onSelect={handleOptionSelect}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="chatbox-input-area">
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            className="chatbox-input"
                        />
                        <button onClick={handleSend} className="chatbox-send-btn">
                            <FaPaperPlane size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
