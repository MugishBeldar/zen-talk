import { useTypingEffect } from "@/hooks";

const NoChatSelected = () => {
  const welcomeMessage =
    "Please select or create a chat to start a conversation.";
  const greetingMessage = "Welcome, admin!";
  const typedMessage = useTypingEffect(welcomeMessage, 70);

  return (
    <div className="flex justify-center items-center h-full flex-col">
      <p className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary-indigo to-primary-violet bg-clip-text text-transparent">
        {greetingMessage}
      </p>
      <span className="text-xl font-bold bg-gradient-to-r from-primary-violet to-primary-indigo bg-clip-text text-transparent">
        {typedMessage}
      </span>
    </div>
  );
};

export default NoChatSelected;
