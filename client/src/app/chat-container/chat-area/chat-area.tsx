import { useParams } from "react-router-dom";

const ChatArea = () => {
  const { chatId } = useParams();
  return (
    <div className="flex-1">
      <h2>Chat Area - Chat ID: {chatId}</h2>
    </div>
  );
};

export default ChatArea;
