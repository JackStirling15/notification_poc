import React, {useState} from 'react';
import {Stomp} from '@stomp/stompjs';


function App(){
  const [clientState, setClient] = useState(null);
  const [msg, setMsg] = useState("No Messages received yet");

  const uid = "user1";

  function connectCallback(client) {
    console.log("Connection success");
    // once connected start requests
    client.heartbeatIncoming = 0; // disable "pong"
    client.reconnectDelay = 300;

    // durable sub to persist queue after disconnect
    client.subscribe("MOTD", motdCallback, { "id": uid, 'durable-subscription-name': 'motd'});

    setClient(client);
  }

  function motdCallback (msg){
    console.log("New MOTD MESSAGE", msg);
    setMsg(msg.body);
  }

  function startCon() {
    const url = "ws://localhost:61613";

    // heartbeat every 10s by default, required to keep connection online
    const client = Stomp.client(url);
    client.connect({'client-id': uid, "subscription-type": "multicast"}, ()=>connectCallback(client));
  }

  function sendMsg() {
    const date = new Date();
    // _AMQ_LVQ_NAME header sets key of last value queue
    // persistent to make the message durable
    // problem - being shown as bytes by broker, broker messages are text (type 3)

    let message = {destination: 'MOTD', body: JSON.stringify({test: `current second: ${date.getSeconds()}`}), headers: {persistent:true, priority:0, _AMQ_LVQ_NAME: "motd_latest", _AMQ_CONTENT_TYPE: 3, 'content-type': 'text/plain'}};
    console.log("Sending:", message);
    clientState.publish(message);
  }

  function endCon(){
    clientState.deactivate().then(r => console.log("Disconnected"));
  }

  return (
    <div className="App">
      <button onClick={startCon}>CONNECT</button><br/>
      <button onClick={endCon}>DISCONNECT</button><br/>
      <button onClick={sendMsg}>SEND</button><br/>
      {msg}
    </div>
  );
}

export default App;
