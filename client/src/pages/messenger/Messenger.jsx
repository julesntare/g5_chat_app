import "./messenger.css";
import MenuSide from "../../components/MenuSide/MenuSide";
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";
import {SendRounded as SendIcon, Search, EmojiEmotionsOutlined, AttachFileRounded, PhotoSizeSelectActualRounded} from "@material-ui/icons";
import Avatar from 'react-avatar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from "react-router";
import { ThemeContext } from "../../components/ThemeProvider";
import chatBgLight from './chat-bg-light.svg';
import chatBgDark from './chat-bg-dark.svg';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Rooms from "../../components/Rooms/Rooms";

export default function Messenger() {
  const [currentChatUser, setCurrentChatUser] = useState({});
  const [ isTyping, setIsTyping ] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [roomSearchValue, setRoomSearchValue] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchRooms, setSearchRooms] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [conversations, setConversations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [toggleCurrentChatBox, setToggleCurrentChatBox] = useState(1);
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();
  const history = useHistory();
  const state = useContext(ThemeContext);

  const messenger = {
    background: state.theme.primary,
  };
  const chatBox = {
    background: state.theme.bgMenuSideBarColor,
  };
  const convoDesc = {
    color: state.theme.secondary,
  };
  const chatMsgInput = {
    background: state.theme.bgMenuSideBarColor,
    ...convoDesc
  }
  const chatBoxUserTitle = {
    borderBottomColor: state.theme.secondary,
  }
  const chatBoxTop = {
    backgroundImage: `url(${state.theme.type === "light" ? chatBgLight : chatBgDark})`,
  }

  const matches = useMediaQuery('(min-width:860px)');

  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

// make messenger portal responsive
useEffect(()=> {
  if(document.querySelector(".chatBox")) {
  if(matches) {
    document.querySelector(".menuSideBar").style.display = "block";
    document.querySelector(".chatMenu").style.display = "block";
    document.querySelector(".chatBox").style.display = "block";
  }
  else {
    document.querySelector(".menuSideBar").style.display = "block";
    document.querySelector(".chatMenu").style.display = "block";
    document.querySelector(".chatBox").style.display = "none";
  }
}
if(!matches && (toggleCurrentChatBox === 0)) {
  document.querySelector(".menuSideBar").style.display = "none";
  document.querySelector(".chatMenu").style.display = "none";
  document.querySelector(".chatBox").style.display = "block";
}
if(!matches && (toggleCurrentChatBox === 1)) {
  document.querySelector(".menuSideBar").style.display = "block";
  document.querySelector(".chatMenu").style.display = "block";
  document.querySelector(".chatBox").style.display = "none";
}
}, [matches, toggleCurrentChatBox]);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", user.others._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        user.others.followings.filter((f) => users.some((u) => u.userId === f))
      );
    });
  }, [user.others]);

  // retrieve conversations
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/conversations/" + user.others._id);
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user.others._id]);

  // retrieve specific rooms
    useEffect(() => {
    const getRooms = async () => {
      try {
        const res = await axios.get("/rooms/member/" + user.others._id);
        setRooms(res.data.rooms);
      } catch (err) {
        console.log(err);
      }
    };
    getRooms();
  }, [user.others._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
    const handleChatUser = async() => {
      if(!currentChat) return null
      const sender = currentChat.members.filter(member=> user.others._id !== member)
      await axios.get("/users?userId=" + sender).then(res=> {
      setCurrentChatUser(res.data);
    }).catch(err=>console.log(err))
    }
    handleChatUser();
  }, [currentChat, user.others._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: user.others._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== user.others._id
    );

    socket.current.emit("sendMessage", {
      senderId: user.others._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("/messages", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearch = async (e, isRoom) => {
    if(isRoom) {
    setRoomSearchValue(e.target.value);
    if(e.target.value.length > 0) {
      const rooms = await axios.post("/rooms/search/", {search: e.target.value, sender: user.others._id});
      if (rooms.data.length < 1) {
        setSearchRooms([]);
      }
      else {
        setSearchRooms([...rooms.data]);
        }
    }
    else {
      setSearchRooms([]);
    }
      return;
    }
    setSearchValue(e.target.value);
    if(e.target.value.length > 0) {
      const senders = await axios.post("/users/search/", {search: e.target.value});
      if(senders.data.length > 0) {
        const chats = senders.data.filter(sender=> sender._id !== user.others._id);
        setSearchUsers([...chats]);
      }
      else {
        setSearchUsers([]);
      }
    }
    else {
      setSearchUsers([]);
    }
  }

  const handleChatBox = async(receiver) => {
    setToggleCurrentChatBox(true);
    const res = await axios.post('/conversations/', {senderId: user.others._id, receiverId: receiver._id});
    setCurrentChat(...res.data);
    history.push("/");
  }
  const handleTyping = (e) => {
    if(newMessage !== '') {
      // setVerify(true)
    //   socket.current.emit('typing', {
    //     to: currentChatUser._id,
    //     typing: true,
    //   })
    }
    // socket.current = io("ws://localhost:8900");
    // socket.current.on("receiveTyping", data=> {
    //   console.log(data);
    //   setIsTyping(true);
    // })
    // else if(newMessage === ''){
    //   // setVerify(false)
    //   socket.current.emit('typing', {
    //     to: currentChatUser._id,
    //     typing: false ,
    //   })
    // }
  }
  
  const handleBack = (e) => {
    setToggleCurrentChatBox(1);
    document.querySelector(".chatMenu").style.display = "block";
    document.querySelector(".menuSideBar").style.display = "block";
    document.querySelector(".chatBox").style.display = "none";
    setCurrentChat(null);
    setCurrentRoom(null);
  }

  const handleCurrentChatBox = () => {
    if(!matches) {
    setToggleCurrentChatBox(0);
      document.querySelector(".menuSideBar").style.display = "none";
      document.querySelector(".chatMenu").style.display = "none";
      document.querySelector(".chatBox").style.display = "block";
    }
  }

  return (
    <>
      <div className="messenger" style = {messenger}>
        <MenuSide userProfile={user.others} />
        <div className="chatMenu">
          <div className="chatMenuWrapper">
          <Tabs>
            <TabList>
      <Tab style={chatMsgInput}><h3 className="ChatContainerTitle">Chats ({conversations.length})</h3></Tab>
      <Tab style={chatMsgInput}><h3 className="ChatContainerTitle">Groups ({rooms.length})</h3></Tab>
    </TabList>
    <TabPanel>
            <div className="chatSearchBox">
              <Search className="chatMenuInputIcon" style={chatMsgInput}/>
              <input placeholder="Search people..." className="chatMenuInput"
                    style={chatMsgInput} onChange={handleSearch} value={searchValue} />
            </div>
            {(searchUsers.length > 0 && searchValue.length > 0)?
              searchUsers.map((searchUser, i)=> (<div key={i} onClick={() => handleChatBox(searchUser)}>
                <Conversation conversation={searchUser} currentUser={user} />
                </div>)) : searchUsers.length < 1 && searchValue.length > 0 ? <div  className="noConversation" style={convoDesc}><span>No result found</span></div>:
              conversations.map((c, i) => (<div onClick={() => {setCurrentChat(c); setCurrentRoom(null); handleCurrentChatBox();}} key={i}>
                <Conversation conversation={c} currentUser={user} />
              </div>))
            }
            </TabPanel>
            <TabPanel>
              <div className="chatSearchBox">
              <Search className="chatMenuInputIcon" style={chatMsgInput}/>
              <input placeholder="Search group..." className="chatMenuInput"
                    style={chatMsgInput} onChange={(e) => handleSearch(e, true)} value={roomSearchValue} />
            </div>
            {(searchRooms.length > 0 && roomSearchValue.length > 0)?
              searchRooms.map((searchRoom, i)=> (<div key={i} onClick={() => handleChatBox(searchRoom)}>
                <Conversation conversation={searchRoom} currentUser={user} roomsLength= {rooms.length} />
                </div>)) : searchRooms.length < 1 && roomSearchValue.length > 0 ? <div  className="noConversation" style={convoDesc}><span>No result found</span></div>:
              rooms.map((c, i) => (<div onClick={() => {setCurrentRoom(c); setCurrentChat(null); handleCurrentChatBox();}} key={i}>
                <Conversation conversation={c} currentUser={user} roomsLength= {rooms.length} />
              </div>))
            }
            </TabPanel>
          </Tabs>
          </div>
        </div>
        <div className="chatBox" style = {chatBox}>
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxUserTitle" style={chatBoxUserTitle}>
<div className="handleBackCont">
  <ArrowBackIcon className="handleBackIcon" onClick={handleBack} style={convoDesc}/>
</div>
                  {currentChatUser?.profilePicture ? <img
                    className="messageImg"
                  src={PF + currentChatUser.profilePicture}
                    alt="profile pic"
                  /> : <Avatar name={currentChatUser.firstname + " " + currentChatUser.lastname} size="40" textSizeRatio={1.75} className="messageImg" />}
                  <div className="chatBoxUserDesc">
                    <span className="userTitle" style={convoDesc}>
                    {currentChatUser.username}
                    </span>
                    <span className="userStatus">{isTyping ? 'Typing...':'Online'}</span>
                  </div>
                </div>
                <div className="chatBoxTop" style={chatBoxTop}>
                  {messages.map((m, i) => (
                    <div ref={scrollRef} key={i}>
                      <Message message={m} own={m.sender === user.others._id} />
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
                      handleTyping(e);
                    }}
                    onKeyUp={(e) => e.key === "Enter" ? handleSubmit(e) : e.preventDefault()}
                    value={newMessage}
                  ></textarea>
                  <div className="chatSendIcons">
                    <div><EmojiEmotionsOutlined /></div>
                  <div>
                      <input type="file" name="
                      " id="attachFile" />
                      <label htmlFor="attachFile">
                        <AttachFileRounded/>
                      </label>
                    </div>
                  <div>
                      <input type="file" name="
                      " id="photoSelect" />
                      <label htmlFor="photoSelect">
                        <PhotoSizeSelectActualRounded/>
                      </label>
                    </div>
                  {newMessage.length > 0 ? (<button className="chatSubmitButton" onClick={handleSubmit}>
                    <SendIcon/>
                  </button>
                  ):(
                    <button className="chatSubmitButton" disabled onClick={handleSubmit}>
                    <SendIcon/>
                  </button>
                  )}
                  </div>
                </div>
              </>
            ) : (
              currentRoom ?
              <Rooms currentRoom={currentRoom} handleBack={handleBack} isTyping={isTyping} messages={messages} newMessage={newMessage}
handleSubmit={handleSubmit}
user={user.others._id}
setNewMessage={setNewMessage}/>
              :
              <div className="noConversationContainer">
                <img src="/assets/app-logo.png" alt="app logo" className="noConversationImg" />
                <div className="noConversationDesc" style={convoDesc}>
                  <h1>G5 Chat</h1>
                  <span>Open a conversation to start a chat.</span>
                </div>
              </div>
            )}
          </div>
          {/* <div className="chatOnline">
            <div className="chatOnlineWrapper">
              <ChatOnline
                onlineUsers={onlineUsers}
                currentId={user._id}
                setCurrentChat={setCurrentChat}
              />
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}
