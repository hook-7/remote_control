import React,{useState, useEffect} from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";

const baseURL= '120.77.79.24:38081';
// const baseURL= '192.168.1.130';


const Circle = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let ws = new WebSocket('ws://' + baseURL + '/ws');
    setSocket(ws);

    const handleOpen = () => {
      console.log('WebSocket connection opened');
    };

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(message);
    };

    const handleClose = (event) => {
      console.log('WebSocket connection closed');
      setSocket(null);
      // Attempt to reconnect
      setTimeout(() => {
        ws = new WebSocket('ws://' + baseURL + '/ws');
        setSocket(ws);
        ws.onopen = handleOpen;
        ws.onmessage = handleMessage;
        ws.onclose = handleClose;
      }, 1000);
    };

    ws.onopen = handleOpen;
    ws.onmessage = handleMessage;
    ws.onclose = handleClose;
    const heartbeatInterval = setInterval(()=>{
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'heartbeat' }));
      }
    },5000)
    return () => {
      if (socket) {
        socket.close();
      }
      clearInterval(heartbeatInterval);
    };
  }, []);


  const sendMessage = (text) => {
    console.log(text)
    if (socket) {
      socket.send("at_"+text);
    }
  };

  return (
    <View style={styles.circle}>
      <TouchableOpacity
        style={[styles.quarter, styles.topLeft]}
        onPressIn={() =>{sendMessage("up")}}
        onPressOut={() =>{sendMessage("stop")}}
      >
        <View style={[styles.quarter, styles.topLeft , styles.noBorder]}>
          <View style={[styles.buttonTextWrapper]}>
            <Text style={[styles.buttonText]}>Up</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quarter, styles.topRight]}
        onPressIn={() =>{sendMessage("right")}}
        onPressOut={() =>{sendMessage("stop")}}
      >
        <View style={[styles.quarter, styles.topLeft, styles.noBorder]}>
          <View style={styles.buttonTextWrapper}>
            <Text style={styles.buttonText}>right</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quarter, styles.bottomLeft]}
        onPressIn={() =>{sendMessage("left")}}
        onPressOut={() =>{sendMessage("stop")}}
      >
        <View style={[styles.quarter, styles.topLeft, styles.noBorder]}>
          <View style={styles.buttonTextWrapper}>
            <Text style={styles.buttonText}>left</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quarter, styles.bottomRight]}
        onPressIn={() =>{sendMessage("down")}}
        onPressOut={() =>{sendMessage("stop")}}
      >
        <View style={[styles.quarter, styles.topLeft, styles.noBorder]}>
          <View style={styles.buttonTextWrapper}>
            <Text style={styles.buttonText}>down</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 300,
    height: 300,
    borderRadius: 100,
    backgroundColor: "#ddd",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    position: "absolute",

    bottom: 200,
    margin: "auto",
    transform: [{ rotate: "45deg" }],
  },
  quarter: {
    width: "50%",
    height: "50%",
    borderWidth: 3,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  topLeft: {
    borderTopLeftRadius: 100,
  },
  topRight: {
    borderTopRightRadius: 100,
  },
  bottomLeft: {
    borderBottomLeftRadius: 100,
  },
  bottomRight: {
    borderBottomRightRadius: 100,
  },
  buttonTextWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderWidth: 0,
    transform: [{ rotate: "-45deg" }],
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 24,
    color: "#000",
    textShadowColor: "#ddd",
    textShadowOffset: { width: 0, height: 0 },
  },
  noBorder: {
    borderWidth: 0,
  },
});

export default Circle;
