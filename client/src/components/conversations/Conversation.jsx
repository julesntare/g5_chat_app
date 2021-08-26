import axios from "axios";
import { useEffect, useState, useContext } from "react";
import "./conversation.css";
import Avatar from 'react-avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import { ThemeContext } from "../ThemeProvider";

export default function Conversation({ conversation, currentUser, roomsLength }) {
  const [user, setUser] = useState(null);
  const [lastMsg, setLastMsg] = useState("");
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const state = useContext(ThemeContext);
  const friendId = conversation.members ? conversation.members.find((m) => m !== currentUser.others._id) : "";

  const convoDesc = {
    color: state.theme.secondary,
  };

  useEffect(() => {
    let res = {};
// retrieve private convo user info
    const getUser = async () => {
      try {
        if(friendId) {
          res = await axios.get("/users?userId=" + friendId);
        }
        else {
          res = await axios.get("/users?userId=" + conversation._id);
        }
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    if(!roomsLength) {
      getUser();
    }
  }, [currentUser, conversation, friendId, roomsLength]);

  useEffect(() => {
    const getLastMessage = async () => {
    try {
      const res = await axios.get(`/messages/lastOne/${conversation._id}`);
      setLastMsg(res.data[0].text);
    } catch (err) {
    }
  }
  getLastMessage();
  }, [conversation._id]);

  return (
    <>
{/* room convo */}
{roomsLength ? <><div className="conversation">
        {conversation.members.length >= 2 ? <AvatarGroup  max={conversation.members.length + 1}>
          <Avatar name={conversation.name} size="35" textSizeRatio={1.75} className="conversationImg" />
        </AvatarGroup> : <Avatar name={conversation.name} size="35" textSizeRatio={1.75} className="conversationImg" />}
        <div>
          <span className="conversationName" style={convoDesc}>{conversation.name}</span>
      <p className="latestConvoMsg" style={convoDesc}>{conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1].sender + " : " + conversation.messages[conversation.messages.length - 1].msg : ""}</p>
        </div>
        {/* <span className="conversationTotalUnread">1</span> */}
      </div>
      <div className="bottom-line" style={convoDesc}></div></>
      : null}

    {/* private convo */}
      {!roomsLength && conversation && user ? <><div className="conversation">
        {user?.profilePicture ? <img
          className="conversationImg"
          src={PF + user.profilePicture}
          alt=""
        /> :
        <Avatar name={user.firstname + " " + user.lastname} size="35" textSizeRatio={1.75} className="conversationImg" />}
        <div>
          <span className="conversationName" style={convoDesc}>{user?.username}</span>
      <p className="latestConvoMsg" style={convoDesc}>{lastMsg !== "" ? lastMsg : ""}</p>
        </div>
        {/* <span className="conversationTotalUnread">1</span> */}
      </div>
      <div className="bottom-line" style={convoDesc}></div></>
      : null}
    </>
  );
}
