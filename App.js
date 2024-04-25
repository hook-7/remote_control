import React, { useState, useEffect, useRef } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Button ,TextInput} from "react-native";
import * as Network from "expo-network";
import axios from "axios";
// import Dialog from "react-native-dialog";

const baseURL = "120.77.79.24:38081";
// const baseURL= '192.168.1.130';

const App = () => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const [net, setNet] = useState("");
  const heartbeatRef = useRef(null);
  const [publicIP, setPublicIP] = useState("点击获取IP");

  useEffect(() => {
    Network.getNetworkStateAsync().then((res) => {
      setNet(JSON.stringify(res) );
    });
    const connectWebSocket = () => {
      socketRef.current = new WebSocket(`ws://${baseURL}/ws`);

      socketRef.current.onopen = () => {
        console.log("WebSocket connection opened");
        // 发送心跳保持连接
        heartbeatRef.current = setInterval(() => {
          if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "heartbeat" }));
          }
        }, 60000);
      };

      socketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...message]);
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket connection closed");
        clearInterval(heartbeatRef.current);
        // 重连逻辑
        setTimeout(() => {
          connectWebSocket();
        }, 1000);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearInterval(heartbeatRef.current);
    };
  }, []);

  const sendMessage = (text) => {
    console.log(`Sending message: ${text}`);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(`at_${text}`);
    }
  };

  const handleLongPress = () => {
    console.log("LongPress activated");
  };

  const buttonProps = (direction) => ({
    onPressIn: () => sendMessage(direction),
    onPressOut: () => sendMessage("stop"),
    onLongPress: handleLongPress,
    style: [styles.quarter, styles[direction], styles.noBorder],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => console.log(messages[messages.length - 1])}
        style={styles.button}
      >
        <Text style={styles.topButton}>
          {messages.length > 0 ? messages[messages.length - 1] : "No messages"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          console.log("重连中....");
        }}
        style={styles.button}
      >
        <Text style={styles.topButton}>{net}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          fetch(`http://${baseURL}/`)
            .then(res => res.text()) 
            .then(ipText => {
              console.log(ipText);  
              setPublicIP(ipText);  
            })
            .catch(err => {
              console.error(err);  
              setPublicIP(JSON.stringify(err));  
            });
            
          // axios
          //   .get(`http://${baseURL}/`)
          //   .then((res) => {
          //     setPublicIP(res.data);
          //   })
          //   .catch((err) => {
          //     console.error(err); 
          //     setPublicIP(JSON.stringify(err)); 
          //   });

        }}
        style={styles.button}
      >
          <TextInput
        value={publicIP}
        onChangeText={text => setPublicIP(text)}
        style={styles.input}
      />
        {/* <Text style={styles.topButton}>{publicIP}</Text> */}
      </TouchableOpacity>

      <View style={styles.circle}>
        {["up", "right", "left", "down"].map((direction) => (
          <TouchableOpacity key={direction} {...buttonProps(direction)}>
            <View style={styles.buttonTextWrapper}>
              <Text style={styles.buttonText}>{direction}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // 垂直居中
    alignItems: "center", // 水平居中
    position: "relative",
  },
  topButton: { color: "#fff", fontSize: 24 },
  button: {
    // position: "absolute",
    bottom: 300, // 控制按钮相对于容器顶部的位置
    left: 0, // 控制按钮相对于容器左侧的位置
    backgroundColor: "#007AFF", // iOS按钮蓝色
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
    marginBottom: 20,
  },
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
  up: {
    borderTopLeftRadius: 100,
  },
  right: {
    borderTopRightRadius: 100,
  },
  left: {
    borderBottomLeftRadius: 100,
  },
  down: {
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
    borderWidth: 3,
  },
});

export default App;
