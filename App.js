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
import { AntDesign } from "@expo/vector-icons";

const STORAGE_TODOS_KEY = "@toDos";
const STORAGE_WORKING_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadWorking();
    loadToDos();
  }, []);
  const onChangeText = (payload) => setText(payload);
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
      [Date.now()]: { text, working: working, completed: false },
    };
    await saveToDos(newToDos);
    setToDos(newToDos);
    setText("");
  };
  const finishToDo = async (key) => {
    if (key in toDos) {
      const newToDos = { ...toDos };
      const toDo = newToDos[key];
      toDo.completed = !toDo.completed;
      await saveToDos(newToDos);
      setToDos(newToDos);
    }
  };
  const deleteToDo = (key) => {
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
    await saveWorking(!working);
    setWorking(!working);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
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
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
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
                <Text
                  style={{
                    ...styles.toDoText,
                    color: toDos[key].completed ? "#d3d3d3" : "#000000",
                  }}
                >
                  {toDos[key].text}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Text>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </Text>
              </TouchableOpacity>
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
    borderWidth: 2,
    borderStyle: "solid",
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
    borderWidth: 1,
    borderStyle: "solid",
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
});
