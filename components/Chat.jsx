"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const tmpSuggestions = [
    "How can I improve my budgeting?",
    "What are some ways to cut down on expenses?",
    "How much should I be saving each month?",
    "Can you help me analyze my recent spending?",
    "What’s the best way to manage my debt?",
    "Do you have any investment tips for me?",
    "How can I plan for a big purchase?",
    "Can you show me insights on my spending habits?",
  ];
  
  
export default function Chat() {
  const [suggestions, setSuggestions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [allData, setAllData] = useState(null); // Store all data here
  const currentMessageRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [audio, setAudio] = useState(null);
  const audioRef = useRef(null);

  const api = "AIzaSyARHb_" + "1bhST7sqK0Wk" + "YZ7Orx3GB-hnAYAI";

  const fetchAllData = async () => {
    try {
      const response = await axios.get("/api/transactions-history/all");
      setAllData(response.data);
    } catch (error) {
      console.error("Error fetching all data:", error);
    }
  };

  const fetchAudio = async (text) => {
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${api}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audioConfig: {
              audioEncoding: "MP3",
              effectsProfileId: ["small-bluetooth-speaker-class-device"],
              pitch: 0,
              speakingRate: 1,
            },
            input: { text },
            voice: {
              languageCode: "en-IN",
              name: "en-IN-Journey-D",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }

      const data = await response.json();
      setAudio(`data:audio/mpeg;base64,${data.audioContent}`);
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  const getSuggestions = () => {
    setSuggestions(tmpSuggestions);
  };

  useEffect(() => {
    if (audio && audioRef.current) {
      audioRef.current.play();
    }
  }, [audio]);

  useEffect(() => {
    getSuggestions();
    fetchAllData(); // Fetch all data when component mounts
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentMessage.trim()) return;

    const userMessage = { content: currentMessage, role: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage("");
    setAudio(null);

    if (currentMessageRef.current) {
      currentMessageRef.current.value = "";
    }

    try {
      const response = await axios.post("/api/chat", {
        messagesList: updatedMessages,
        alldata: allData, // Send allData state here
      });

      const assistantMessage = {
        content: response.data.message,
        role: "assistant",
      };
      setMessages([...updatedMessages, assistantMessage]);
      fetchAudio(response.data.message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const onChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const onSuggestionClick = (message) => {
    setCurrentMessage(message);
    if (currentMessageRef.current) {
      currentMessageRef.current.value = message;
      currentMessageRef.current.focus();
    }
  };

  return (
    <>
      <div className="chatWrapper">
        {audio && (
          <audio ref={audioRef} controls src={audio} style={{ display: "none" }}>
            Your browser does not support the audio element.
          </audio>
        )}

        <div className="chat">
          <div
            className={`suggestionsWrapper ${
              messages.length === 0 && currentMessage.length === 0
                ? "empty"
                : ""
            }`}
          >
            <div className="title">Suggestions</div>
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>

          <div ref={messagesContainerRef} className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.role === "user" ? "user" : "bot"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="form">
            <input
              ref={currentMessageRef}
              type="text"
              placeholder="Type a message"
              onChange={onChange}
              required
            />
          </form>
        </div>
      </div>

      <style>{`
        .chatWrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100vw;
          height: 90vh;
        }

        .chat {
          position: relative;
          background: #111629;
          box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 28rem;
          height: 85vh;
          margin: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chat .suggestionsWrapper {
          position: absolute;
          display: none;
          width: calc(100% - 2rem);
          flex-direction: column;
          gap: 0.75rem;
        }

        .chat .suggestionsWrapper.empty {
          display: flex;
        }

        .chat .suggestionsWrapper .title {
          color: #f0f0f0;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .chat .suggestionsWrapper .suggestions {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .chat .suggestionsWrapper .suggestions .suggestion {
          padding: 0.5rem;
          color: #8a8a8a;
          font-size: 0.8rem;
          font-weight: 500;
          border-radius: 10px;
          border: 1px solid #8a8a8a;
          width: 100%;
          cursor: pointer;
        }

        .chat .suggestionsWrapper .suggestions .suggestion:hover {
          background: #1e1f2b;
        }

        .chat .messages {
          flex-grow: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem 0;
        }

        .chat .messages .message {
          color: #f0f0f0;
          font-size: 0.9rem;
        }

        .chat .messages .message.user {
          align-self: flex-end;
          border-radius: 40px;
          background: rgba(227, 227, 227, 0.2);
          backdrop-filter: blur(15px);
          padding: 0.5rem 1rem;
        }

        .chat .messages .message.bot {
          align-self: flex-start;
        }

        .chat .form {
          overflow: hidden;
          border-radius: 48.585px;
          background: rgba(138, 138, 138, 0.32);
          display: flex;
          margin-top: auto;
        }

        .chat .form input {
          border: none;
          background: none;
          color: #f0f0f0;
          font-size: 0.9rem;
          padding: 0.75rem 1rem;
          width: 100%;
          border-radius: 48.585px;
          outline: none;
        }

        .chat .form button {
          position: relative;
          background: none;
          border: none;
          color: #f0f0f0;
          font-size: 1rem;
          cursor: pointer;
          background: rgba(18, 18, 18, 0.3);
          border-radius: 50%;
          top: 10%;
          right: 0.15rem;
          height: 80%;
          aspect-ratio: 1 / 1;
        }

        .chat .form button img {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50%;
          height: 50%;
          position: absolute;
          object-fit: contain;
        }
      `}</style>
    </>
  );
}
