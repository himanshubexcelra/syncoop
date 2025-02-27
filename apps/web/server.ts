import { createServer } from "node:http";
import next from "next";
import { parse } from 'url';
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
/* const hostname = "localhost"; */
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // const httpServer = createServer(handle)
  const httpServer = createServer((req, res) => {
    /* res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins (you can specify domains)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); */
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_UI_APP_HOST_URL,  // Allow all origins, you can set this to a specific URL like 'http://localhost:3000'
      methods: ['GET', 'POST'],
    },
  });

  io.on("connection", /* async */(socket) => {
    // Emit an event to the client when connected
    socket.emit('server-message', 'Welcome to the server!');
    // Listen for custom events from the client
    socket.on('client-message', (data) => {
      console.log('Received from client:', data);
      // Send a response back to the client
      /* try {
          const response = await fetch('http://localhost:3000/api/my-api');
          const data = await response.json();
  
          // Emit the response to ALL connected clients (broadcasting)
          io.emit('api-response', data); // This broadcasts to ALL connected clients
        } catch (error) {
          console.error('Error fetching API:', error);
          io.emit('api-response', { error: 'Failed to fetch API' }); // Broadcast error to all clients
        } */
      io.emit('server-message', `Server received: ${data}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    // ...
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on ${process.env.NEXT_PUBLIC_UI_APP_HOST_URL}`);
    });
});

/* import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import 'module-alias/register';
const port = parseInt(process.env.PORT || '3001', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(port)
  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`
  )
}) */

// server.ts
/* import express from 'express';
import next from 'next';
import http from 'http';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  const server = express();
  // This is where you can set up custom routes and WebSocket or other server-side logic.
  server.get('*', (req, res) => {
    return handle(req, res); // Forward requests to Next.js handler
  });
  // Create an HTTP server and pass it to Express
  const httpServer = http.createServer(server);
  // Start the server
  httpServer.listen(3001, (err?: any) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3001');
  });
});
 */
