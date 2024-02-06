import { React, useEffect, useState } from "react";
import "./App.css";
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import Pusher from "pusher-js";
import axios from "./axios";
function App() {
  const [messages, SetMessages] = useState([]);

  useEffect(() => {
    axios.get("/messages/sync").then((response) => {
      SetMessages(response.data);
    });
  }, []);

  useEffect(() => {
    const pusher = new Pusher("33195423b27c4be261cb", {
      cluster: "eu",
    });

    const channel = pusher.subscribe("messages");
    channel.bind("inserted", (newMessage) => {
      SetMessages([...messages, newMessage]);
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);

  console.log(messages);

  return (
    <div className="app">
      <div className="app_body">
        <Sidebar />
        <Chat messages={messages} />
      </div>
    </div>
  );
}

export default App;
