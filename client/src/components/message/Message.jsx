import React, {useState, useEffect, useContext} from 'react'
import "./message.css";
import { format } from "timeago.js";
import axios from 'axios';
import Avatar from 'react-avatar';
import { ThemeContext } from "../../components/ThemeProvider";
import ContextMenu from './contextMenu';
import ContextList from './contextMenuOptions';

export default function Message({ message, own, isRoom, receiverId }) {
  const [user, setUser] = useState({})

  const [contextCoordinate, setContextCoordinate] = useState({x:0,y:0});
  const [toggleContextMenu, setToggleContextMenu] = useState(false);
  const [contextId, setContextId] = useState(null);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const state = useContext(ThemeContext);

  const convoDesc = {
    color: state.theme.secondary,
  };
  const chatMsgInput = {
    background: state.theme.bgMenuSideBarColor,
    ...convoDesc
  }

  useEffect(()=> {
    const fetchMsgSender = async() => {
      await axios.get("/users?userId=" + message.sender).then(res=> {
        setUser(res.data);
      }).catch(err=>console.log(err))
    }
    fetchMsgSender()
  }, [message.sender])

  const onRightClick=(event,ID)=>{
    setToggleContextMenu(false)
    let parentW=document.getElementById("singleItem").offsetWidth;
    event.preventDefault();

    let x=event.clientX - 500,y=event.clientY

    let leftMarginOffset=(5/100)*parentW

    if(window.innerWidth-event.clientX<160+leftMarginOffset){
      x=event.clientX + 500;
      console.log(x);
    }
    if(window.innerHeight-event.clientY<60){
      y=window.innerHeight-65
    }

    var coordinate={...contextCoordinate}
    coordinate.x=x;
    coordinate.y=y;
    setContextCoordinate(coordinate)
    setToggleContextMenu(true)
    setContextId(ID)
  }

  const onClickItemHandle=(Item)=>{
    switch(Item.name){
      case "Delete":
        console.log("Delete",contextId)
        axios.put("/messages/deleteMsg", {contextId}).then(res=> {
        setToggleContextMenu(false);
      }).catch(err=>{console.log(err)
      setToggleContextMenu(false)
      })
      break;
      default:
        return null;
    }
  }

  return (
      <div className={own ? "message own" : "message"} id="singleItem">
        {own ? <div className="messageTop" onContextMenu={(e)=>onRightClick(e, message._id)}>
          <p className="messageText">{isRoom ? message.msg : message.text}</p>
          {user?.profilePicture ? <img
            className="messageImg"
          src={PF + user.profilePicture}
            alt={user.username}
            title={user.username}
          /> : user.firstname && !isRoom ? <Avatar name={user.firstname + " " + user.lastname} size="35" textSizeRatio={1.75} className="messageImg" /> : isRoom && message.sender === receiverId ? <Avatar name={message.sender} size="35" textSizeRatio={1.75} className="messageImg" /> : <Avatar src={PF + "noAvatar.png"} size="35" textSizeRatio={1.75} className="messageImg" />}
          {/* context menu */}
        {toggleContextMenu?
        <ContextMenu
        x={contextCoordinate.x}
        y={contextCoordinate.y}
        contextItem={[
          ContextList.delete
        ]}
        contextClicked={onClickItemHandle}
        cd = {chatMsgInput}
      />:null
      }
        {/* end context menu */}
        </div> : <div className="messageTop" onContextMenu={(e)=>onRightClick(e, message._id)}>
          {user?.profilePicture ? <img
            className="messageImg"
          src={PF + user.profilePicture}
            alt={user.username}
            title={user.username}
          /> : user.firstname ? <Avatar name={user.firstname + " " + user.lastname} size="35" textSizeRatio={1.75} className="messageImg" /> : isRoom ? <Avatar name={message.sender} size="35" textSizeRatio={1.75} className="messageImg" /> : <Avatar src={PF + "noAvatar.png"} size="35" textSizeRatio={1.75} className="messageImg" />}
          <p className="messageText">{isRoom ? message.msg : message.text}</p>
          {/* context menu */}
        {toggleContextMenu?
        <ContextMenu
        x={contextCoordinate.x}
        y={contextCoordinate.y}
        contextItem={[
          ContextList.delete
        ]}
        contextClicked={onClickItemHandle}
        cd = {chatMsgInput}
      />:null
      }
        {/* end context menu */}
        </div>}
        <div className="messageBottom" style={convoDesc}>{isRoom ? format(message.sentAt) : format(message.createdAt)}</div>
      </div>
  );
}
