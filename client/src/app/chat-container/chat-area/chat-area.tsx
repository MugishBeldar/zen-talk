import { useParams } from "react-router-dom";

const ChatArea = () => {
  const { chatId } = useParams();
  return (
    <div style={{ flex: 1, padding: "10px" }}>
      <h2>Chat Area - Chat ID: {chatId}</h2>
    </div>
  );
};

export default ChatArea;
