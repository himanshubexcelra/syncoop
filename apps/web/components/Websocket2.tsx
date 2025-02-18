/* 'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
export default function SocketIOComponent() {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    // Connect to the Socket.io server
    const socket: any = io('http://localhost:3001/v1/websocket');
    console.log(socket);
    // Listen for messages from the server
    socket.on('message', (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    // Store the socket connection
    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, []);
  // Send a message to the server when the button is clicked
  const sendMessage = () => {
    if (socket) {
      alert('hello');
      socket.emit('clientMessage', 'Hello from client');
    }
  };
  return (
    <div>
      <h2>Socket.IO Messages</h2>
      <button onClick={sendMessage}>Send Message</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
 */

"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";


export default function SocketIOComponent2() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [messages, setMessages] = useState<any[]>([]);
  // const [socket, setSocket] = useState<any>(null);
  // const [channel] = useState(new BroadcastChannel('message_channel'));


  useEffect(() => {

    const socketInstance = io(`${process.env.NEXT_PUBLIC_UI_APP_HOST_URL}`);

    if (socketInstance.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socketInstance.io.engine.transport.name);

      socketInstance.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);

    // Set up listeners
    socketInstance.on('server-message', (msg) => {
      setMessages((prevMessages: any[]) => [...prevMessages, msg]);
    });

    // setSocket(socketInstance);
    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
    };


  }, []);

  /* useEffect(() => {
    // Listen to messages from BroadcastChannel
    channel.onmessage = (event) => {
      const newMessage = event.data;
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    return () => {
      channel.close(); // Close channel on unmount
    };
  }, [channel]); */

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <div>
        <h1>WebSocket with Socket.io in Next.js</h1>
        <div>
          <h2>Server Messages:</h2>
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}