import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet ,Button } from "react-native";
import Dialog from "react-native-dialog";

const baseURL = "120.77.79.24:38081";
// const baseURL= '192.168.1.130';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let ws = new WebSocket("ws://" + baseURL + "/ws");
    setSocket(ws);

    const handleOpen = () => {
      console.log("WebSocket connection opened");
    };

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(message);
    };

    const handleClose = (event) => {
      console.log("WebSocket connection closed");
      setSocket(null);
      // Attempt to reconnect
      setTimeout(() => {
        ws = new WebSocket("ws://" + baseURL + "/ws");
        setSocket(ws);
        ws.onopen = handleOpen;
        ws.onmessage = handleMessage;
        ws.onclose = handleClose;
      }, 1000);
    };

    ws.onopen = handleOpen;
    ws.onmessage = handleMessage;
    ws.onclose = handleClose;
    const heartbeatInterval = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "heartbeat" }));
      }
    }, 5000);
    return () => {
      if (socket) {
        socket.close();
      }
      clearInterval(heartbeatInterval);
    };
  }, []);

  const sendMessage = (text) => {
    console.log(text);
    if (socket) {
      socket.send("at_" + text);
    }
  };
  const handleLongPress = () => {
    console.log("LongPress");
    showDialog()
  };

  const buttonProps = (direction) => ({
    onPressIn: () => sendMessage(direction),
    onPressOut: () => sendMessage("stop"),
    onLongPress: handleLongPress,
    style: [styles.quarter, styles[direction], styles.noBorder],
  });

  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSave = () => {
    console.log("Saved:", inputText); // 可以在这里调用 sendMessage
    setVisible(false);
  };

  const showDialog = () => {
    setVisible(true);
  };
  return (
    <View style={styles.circle}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

        <Dialog.Container visible={visible}>
          <Dialog.Title>编辑消息</Dialog.Title>
          <Dialog.Input
            onChangeText={(text) => setInputText(text)}
            value={inputText}
            placeholder="输入新的消息"
          />
          <Dialog.Button label="取消" onPress={handleCancel} />
          <Dialog.Button label="保存" onPress={handleSave} />
        </Dialog.Container>
      </View>
      {["Up", "Right", "Left", "Down"].map((direction) => (
        <TouchableOpacity key={direction} {...buttonProps(direction)}>
          <View style={styles.buttonTextWrapper}>
            <Text style={styles.buttonText}>{direction}</Text>
          </View>
        </TouchableOpacity>
      ))}
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
  Up: {
    borderTopLeftRadius: 100,
  },
  Right: {
    borderTopRightRadius: 100,
  },
  Left: {
    borderBottomLeftRadius: 100,
  },
  Down: {
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
