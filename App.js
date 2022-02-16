import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

const STORAGE_TODOS_KEY = "@toDos";
const STORAGE_WORKING_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [modifyText, setModifyText] = useState("");
  const [modifyFlag, setModifyFlag] = useState(false);
  useEffect(() => {
    loadWorking();
    loadToDos();
  }, []);
  const onChangeText = (payload) => setText(payload);
  const onChangeModifyText = (payload) => setModifyText(payload);
  const saveToDos = async (toSaveTodos) => {
    await AsyncStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(toSaveTodos));
  };
  const saveWorking = async (toSaveWorking) => {
    await AsyncStorage.setItem(
      STORAGE_WORKING_KEY,
      JSON.stringify(toSaveWorking)
    );
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_TODOS_KEY);
    setToDos(JSON.parse(s));
  };
  const loadWorking = async () => {
    const w = await AsyncStorage.getItem(STORAGE_WORKING_KEY);
    setWorking(JSON.parse(w));
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working: working, completed: false, modify: false },
    };
    await saveToDos(newToDos);
    setToDos(newToDos);
    setText("");
  };
  const finishToDo = async (key) => {
    if (modifyFlag) return;
    const newToDos = { ...toDos };
    const toDo = newToDos[key];
    toDo.completed = !toDo.completed;
    await saveToDos(newToDos);
    setToDos(newToDos);
  };
  const modifyToDo = async (key) => {
    const newToDos = { ...toDos };
    const toDo = newToDos[key];
    if (!toDo.modify) {
      toDo.modify = !toDo.modify;
      setModifyText(toDo.text);
      setModifyFlag(toDo.modify);
    } else {
      toDo.text = modifyText;
      toDo.modify = !toDo.modify;
      await saveToDos(newToDos);
      setToDos(newToDos);
      setModifyText("");
      setModifyFlag(toDo.modify);
    }
  };
  const deleteToDo = (key) => {
    if (modifyFlag) return;
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive", // ONLY IOS
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
    return;
  };
  const addWorking = async () => {
    if (modifyFlag) return;
    await saveWorking(!working);
    setWorking(!working);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* Tab */}
      <View style={styles.header}>
        <TouchableOpacity onPress={addWorking}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={addWorking}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      {/* Input */}
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
        editable={!modifyFlag}
      />
      {/* ToDo List */}
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <View style={styles.toDoCheck}>
                <TouchableOpacity
                  style={styles.check}
                  onPress={() => finishToDo(key)}
                >
                  <Text>
                    <AntDesign
                      name={
                        toDos[key].completed ? "checksquare" : "checksquareo"
                      }
                      size={24}
                      color="black"
                    />
                  </Text>
                </TouchableOpacity>
                {toDos[key].modify ? (
                  <TextInput
                    onSubmitEditing={() => modifyToDo(key)}
                    onChangeText={onChangeModifyText}
                    value={modifyText}
                    style={styles.toDoText}
                    autoFocus={modifyFlag}
                  />
                ) : (
                  <Text
                    style={{
                      ...styles.toDoText,
                      ...(toDos[key].completed
                        ? styles.del
                        : { color: "#000000" }),
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                )}
              </View>
              <View style={styles.toDoCheck}>
                <TouchableOpacity
                  style={styles.interval}
                  onPress={() =>
                    toDos[key].completed ? null : modifyToDo(key)
                  }
                >
                  <Text>
                    {toDos[key].modify ? (
                      <Fontisto name="save" size={18} color={theme.grey} />
                    ) : (
                      <MaterialCommunityIcons
                        name="pencil-outline"
                        size={22}
                        color={theme.grey}
                      />
                    )}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Text>
                    <Fontisto name="trash" size={18} color={theme.grey} />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    fontSize: 16,
    fontWeight: "500",
  },
  toDoCheck: {
    flexDirection: "row",
  },
  check: {
    marginRight: 10,
  },
  del: {
    color: "#d3d3d3",
    textDecorationLine: "line-through",
  },
  interval: {
    marginRight: 10,
  },
});
