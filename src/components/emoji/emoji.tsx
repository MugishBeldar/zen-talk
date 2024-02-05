import React from 'react'
import EmojiPicker from 'emoji-picker-react';
interface EmojiProps {
  setCurrentMessage: React.Dispatch<React.SetStateAction<string | null>>
  emojiPickerVisible: boolean;
  setEmojiPickerVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const Emoji = ({ setEmojiPickerVisible, setCurrentMessage, emojiPickerVisible }: EmojiProps) => {
  return (
    <>
      <EmojiPicker
        height={350} width="30rem"
        open={emojiPickerVisible}
        onEmojiClick={(e) => {
          setCurrentMessage((prevMessage) => prevMessage ? prevMessage + e.emoji : e.emoji)
          setTimeout(() => {
            setEmojiPickerVisible(false)
          }, 800);
        }}
        searchDisabled={true}
      />
    </>
  )
}

export default Emoji