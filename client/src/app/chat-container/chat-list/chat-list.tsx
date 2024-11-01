/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
interface ChatListProps {
  chats: any
}
const ChatList = ({ chats }: ChatListProps) => {
  return (
    <div style={{ width: '250px', borderRight: '1px solid #ccc' }}>
      <h2>Chat List</h2>
      <ul>
        {chats.map((chat: any) => (
          <li key={chat.id}>
            <Link to={`/${chat.userId}/chat/${chat.id}`}>
              {chat.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
