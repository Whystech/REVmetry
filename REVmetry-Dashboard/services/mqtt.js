
import mqtt from "mqtt";
import { v4 } from "uuid";
import { EventEmitter } from 'events';
import { wss } from "../server.js";



const USER_ID = 'ianuj'
const broker = 'ssl://8cd1987612ce4be5a8a0228b31bd0975.s1.eu.hivemq.cloud'
const options = {
  username: "ianuj",
  password: "HDIPiot2026@",
  protocolVersion: 5,
  clientId: v4(), //remember to keep this client differt so the one deployed on Render is not the same (if running local and Render deployment at the same time)
  port: 8883
}
const client = mqtt.connect(broker, options)
const SENSORS_TOPIC = `/${USER_ID}/sensors`;
const STATUS_TOPIC = `/${USER_ID}/status`;
const topics = [STATUS_TOPIC, SENSORS_TOPIC]


//initialize vars
//need to know the rpiStatus so I can disable trip recording in the trip controller

let telemetryRecorded = []
let telemetryInterval = null;
let telemetry;
export let rpiStatus;
export let speed;
export let rpm;
export let latitude;
export let longitude;
export const statusEmit = new EventEmitter()


//MQTT
client.on('connect', () => {
  console.log('Connected to mqtt server')
  topics.forEach(element => {
    client.subscribe(element)
    console.log(`Subscribed to ${element}`)
  });
})

client.on('disconnect', () => {
  console.log('Disconnected')
    ;
})

//get status and telemetry
client.on('message', (topic, message) => {
  const msgStr = message.toString();
  if (topic === STATUS_TOPIC) {
    //Status messages as string
    rpiStatus = msgStr;
    console.log(`Pi status: ${rpiStatus}`);
    if (rpiStatus == "offline") {
      statusEmit.emit("offlineStatus", rpiStatus)
    }
  }
  if (topic === SENSORS_TOPIC) { //differentiate between status and telmetry
    try {
      telemetry = JSON.parse(msgStr);
      speed = telemetry.speed
      rpm = telemetry.rpm
      latitude = telemetry.latitude
      longitude = telemetry.longitude
      //send websocket data when telemetry is received
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          let data = JSON.stringify({ "speed": speed, "rpm": rpm, "longitude": longitude, "latitude": latitude })
          client.send(data)
        }
      });
    } catch (err) {
      console.error('Error telemetry JSON:', err);
    }
  }});

client.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

//helper function to get the data in trip controller controller
export function getTelemetry() {
  return telemetry
};

///functions used to record / send telemetry to the controller
export const telemetryFuncs = {

  recordTelemetry() {
    let telemetryBuffer;
    telemetryInterval = setInterval(() => {
      if (!telemetry)
        return; // telemetry might be 0 if it's a fresh start, I do not know if the bug is from the gpsd porgram in the Pi or something else
      telemetryBuffer = getTelemetry()
      telemetryBuffer._id = v4();// id for each telemetry data to debug duplicates 
      const last = telemetryRecorded[telemetryRecorded.length - 1];
      if (!last || JSON.stringify(last) !== JSON.stringify(telemetryBuffer)) {
        telemetryRecorded.push(telemetryBuffer);
      }// throw away identical telemetry inserts
      console.log("Telemetry Buffer:", telemetryBuffer);
    }, 300);

  },

  sendTelemetry() {
    return telemetryRecorded
  },

  stopRecording() {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
    telemetryRecorded = [] //clear any stored values
  },
}


