import React, {useEffect, useState} from 'react';
import {Client, Stomp} from '@stomp/stompjs';


// docs http://localhost:8081/user-manual/non-destructive-queues.html
// console http://localhost:8081/console/auth/login

// client http://localhost:3000/
// client docs https://stomp-js.github.io/stomp-websocket/codo/extra/docs-src/Usage.md.html

function App(){
  const [clientState, setClient] = useState(null);
  const [msg, setMsg] = useState("No Messages received yet");
  const [motdSub, setMotdSub] = useState(null);
  const [lastMsg, setLastMsg] = useState(null);

  useEffect(()=>{
  },[]);

  function startConOld() {
    const url = "ws://localhost:61613/ws";
    const client = new Client();
    const uid = "user1";

    client.configure({
      "client-id": uid,
      brokerURL: url,
      onConnect: () => {
        console.log('onConnect');
        // /MOTD/queues/multicast/queue1
        client.subscription("MOTD", message => {
          console.log(message);
          setMsg(message.body);
        }, {"subscription-type": "multicast"});

      },
      // Helps during debugging, remove in production
      debug: (str) => {
        console.log(new Date(), str);
      }
    });

    client.activate();

    setClient(client);
  }

  const uid = "user1";

  function connectCallback(client) {
    console.log("Connected");
    //,
    setMotdSub(client.subscribe("MOTD", motdCallback, { "id": `${uid}-motd`, 'durable-subscription-name': `${uid}-motd`}));
  }

  function motdCallback (msg){
    console.log("New MOTD MESSAGE", msg);
    setMsg(msg.body);
    setLastMsg(msg);

    console.log(client.browse())
  }

  function startCon() {
    const url = "ws://localhost:61613";

    const client = Stomp.client(url);
    client.connect({'client-id': uid, "subscription-type": "multicast"}, ()=>connectCallback(client));

    setClient(client);
  }

  function sendMsg() {
    const date = new Date();
    clientState.send("MOTD", {}, `current minute: ${date.getMinutes()}`);
  }

  function ackMsg() {
    lastMsg.ack();
  }

  return (
    <div className="App">
      <button onClick={startCon}>CONNECT</button><br/>
      <button onClick={()=>clientState.deactivate()}>DISCONNECT</button><br/>
      <button onClick={sendMsg}>SEND</button><br/>
      <button onClick={ackMsg}>ACK</button><br/>
      {msg}
    </div>
  );
}

export default App;
