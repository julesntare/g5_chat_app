import Message from "../../components/message/Message";
import { useContext, useRef } from "react";
import axios from "axios";
import {
  SendRounded as SendIcon,
  EmojiEmotionsOutlined,
  AttachFileRounded,
  PhotoSizeSelectActualRounded,
} from "@material-ui/icons";
import Avatar from "react-avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { ThemeContext } from "../../components/ThemeProvider";
import chatBgLight from "../../pages/messenger/chat-bg-light.svg";
import chatBgDark from "../../pages/messenger/chat-bg-dark.svg";
import "react-tabs/style/react-tabs.css";

const Rooms = ({
  currentRoom,
  handleBack,
  newMessage,
  user,
  setNewMessage,
}) => {
  const scrollRef = useRef();
  const state = useContext(ThemeContext);
  const convoDesc = {
    color: state.theme.secondary,
  };
  const chatMsgInput = {
    background: state.theme.bgMenuSideBarColor,
    ...convoDesc,
  };
  const chatBoxUserTitle = {
    borderBottomColor: state.theme.secondary,
  };
  const chatBoxTop = {
    backgroundImage: `url(${
      state.theme.type === "light" ? chatBgLight : chatBgDark
    })`,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      userId: user,
      message: newMessage,
    };

    try {
      await axios.put(
        "/rooms/sendmessage/" + currentRoom._id + "/" + user,
        message
      );
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="chatBoxUserTitle" style={chatBoxUserTitle}>
        <div className="handleBackCont">
          <ArrowBackIcon
            className="handleBackIcon"
            onClick={handleBack}
            style={convoDesc}
          />
        </div>
        {currentRoom.members.length >= 2 ? (
          <AvatarGroup max={currentRoom.members.length + 1}>
            <Avatar
              name={currentRoom.name}
              size="40"
              textSizeRatio={1.75}
              className="messageImg"
            />
          </AvatarGroup>
        ) : (
          <Avatar
            name={currentRoom.name}
            size="40"
            textSizeRatio={1.75}
            className="messageImg"
          />
        )}

        <div className="chatBoxUserDesc">
          <span className="userTitle" style={convoDesc}>
            {currentRoom.name +
              " (" +
              (currentRoom.members.length + 1) +
              (currentRoom.members.length < 2 ? " member)" : " members)")}
          </span>
          <span className="userStatus">{"Online"}</span>
        </div>
      </div>
      <div className="chatBoxTop" style={chatBoxTop}>
        {currentRoom.messages.map((m, i) => (
          <div ref={scrollRef} key={i}>
            <Message
              message={m}
              own={m.sender === user}
              receiverId={user}
              isRoom={true}
            />
          </div>
        ))}
      </div>
      <div className="chatBoxBottom">
        <textarea
          className="chatMessageInput"
          style={chatMsgInput}
          placeholder="Type a message"
          onChange={(e) => {
            setNewMessage(e.target.value);
          }}
          onKeyUp={(e) =>
            e.key === "Enter" ? handleSubmit(e) : e.preventDefault()
          }
          value={newMessage}
        ></textarea>
        <div className="chatSendIcons">
          <div>
            <EmojiEmotionsOutlined />
          </div>
          <div>
            <input
              type="file"
              name="
                      "
              id="attachFile"
            />
            <label htmlFor="attachFile">
              <AttachFileRounded />
            </label>
          </div>
          <div>
            <input
              type="file"
              name="
                      "
              id="photoSelect"
            />
            <label htmlFor="photoSelect">
              <PhotoSizeSelectActualRounded />
            </label>
          </div>
          {newMessage.length > 0 ? (
            <button className="chatSubmitButton" onClick={handleSubmit}>
              <SendIcon />
            </button>
          ) : (
            <button
              className="chatSubmitButton"
              disabled
              onClick={handleSubmit}
            >
              <SendIcon />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Rooms;
