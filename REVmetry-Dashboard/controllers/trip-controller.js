import { tripStore } from "../models/trip-store.js";
import { v4 } from "uuid";
import axios from "axios";
import { telemetryFuncs } from "../services/mqtt.js"
import { statusEmit } from "../services/mqtt.js";
import dayjs from "dayjs";



//End trip if the script/connection suddenly stops, assign telemetry obtained up until disconnect, status saved to indicate "why" the trip recording was stopped
//Pretty much the same as the "endTrip" function
//limited knowledge on WebSockets and other "live" stuff, since node.js is server side can't use DOM manipulation, can't use window.reload()
statusEmit.on("offlineStatus", async (newStatus) => {
  if (newStatus === "offline" && recordStatus) {
    newTrip.endedAt = Date.now();
    newTrip.telemetry = telemetryFuncs.sendTelemetry()
    newTrip.status = "Disconnected"
    //set record status to false
    recordStatus = false;
    telemetryFuncs.stopRecording()
    await tripStore.addTrip(newTrip);
    console.log(`adding trip ${newTrip.id}`);
    newTrip = null; //reset trip
  }
});


export let recordStatus = false //for disabling record button, exported to Dashboard Controller - biggest downside of this code, as with this variable set here is basically impossible to have multiple users recording trips at the ame time
let newTrip; //initialize trip 
export const tripController = {
  async index(request, response) {
    const id = request.params.id;
    const trip = await tripStore.getTripById(id);
    const telemetry = trip.telemetry
    let speedViolationCounter = 0
    let rpmViolationCounter = 0
    let hasComments = false;

    let speedValuesForAverage = []
    let speedAverage;
    let maxSpeed;
    let rpmValuesForAverage = []
    let rpmAverage;
    let maxRpm;


    //Format received data
    telemetry.forEach(telemetryPoint => {
      telemetryPoint.invalidCoords = false;
      telemetryPoint.comments = []
      telemetryPoint.formattedTemp = Number(telemetryPoint.temp.toString().substring(0, 4)) //strings since there is nothing else to be done with this info
      telemetryPoint.formattedHumidity = Number(telemetryPoint.humidity.toString().substring(0, 4))
      telemetryPoint.formattedTimeStamp = dayjs.unix(telemetryPoint.ts).format('YYYY-MM-DD HH:mm:ss')
      telemetryPoint.latitude ??= 0; // null or undefined to avoid bugs (telemetry could come incomplete, especially on coordinates and rpm, speed)
      telemetryPoint.longitude ??= 0;
      telemetryPoint.speed ??= 0
      telemetryPoint.rpm ??= 0
      telemetryPoint.formattedLatitude = Number(Number(telemetryPoint.latitude).toFixed(5))//toFixed returns a string
      telemetryPoint.formattedLongitude = Number(Number(telemetryPoint.longitude).toFixed(5))

      //get meaningful speed and rpm calcaulations (less than 5 is most likely stationary, less than 1000 rpm's is most likely idle)
      if (telemetryPoint.speed > 5) {
        speedValuesForAverage.push(telemetryPoint.speed)
        maxSpeed = Math.max(...speedValuesForAverage) // also get max speed recorded
        console.log(speedValuesForAverage)
        let sum
        speedValuesForAverage.forEach(speedPoint => {
          sum = speedValuesForAverage.reduce((a, b) => a + b, 0)
          console.log(`sum is ${sum}`)
          speedAverage = (sum / speedValuesForAverage.length).toFixed(1)
        });
      }

      if (telemetryPoint.rpm > 1000) {
        rpmValuesForAverage.push(telemetryPoint.rpm)
        maxRpm = Math.max(...rpmValuesForAverage) // also get max rpm recorded
        let sum
        rpmValuesForAverage.forEach(rpmPoint => {
          sum = rpmValuesForAverage.reduce((a, b) => a + b, 0)
          rpmAverage = (sum / rpmValuesForAverage.length).toFixed(1)
        })
      }

      if (telemetryPoint.speed > 120) {
        telemetryPoint.comments.push("Speed Violation")
        telemetry.speedViolation = true;
        speedViolationCounter += 1
        hasComments = true;
      }
      if (telemetryPoint.rpm > 4000) {
        telemetryPoint.comments.push("Over Rev")
        telemetry.rpmViolation = true;
        rpmViolationCounter += 1
        hasComments = true;
      }
      if (telemetryPoint.formattedLatitude === 0 || telemetryPoint.formattedLatitude === 0)
        telemetryPoint.invalidCoords = true; //if the coords are invalid, grey out show on map button
    });


    //end of formatting data

    const startingLocationCoords = [telemetry[0].latitude, telemetry[0].longitude]
    const endingLocationCoords = [telemetry[telemetry.length - 1].latitude, telemetry[telemetry.length - 1].longitude]
    const startTs = dayjs.unix(telemetry[0].ts)
    const endTs = dayjs.unix(telemetry[telemetry.length - 1].ts)
    const durationHours = endTs.diff(startTs, "hours", true).toFixed(0)
    const durationMinutes = endTs.diff(startTs, "minutes", true).toFixed(0)
    const durationSeconds = endTs.diff(startTs, "seconds", true).toFixed(0)
   

    ///TREND DATA
    let graph = {};
    graph.trendSpeed = [];
    graph.trendRpm = [];
    graph.trendTstamps = [];
    telemetry.forEach(telemetryPoint => {
      graph.trendSpeed.push(telemetryPoint.speed)
      graph.trendRpm.push(telemetryPoint.rpm)
      let formattedTsGraph = `"${dayjs.unix(telemetryPoint.ts).format('HH:mm:ss')}"`; //need the `""` seo the graph can see where the ts ends
      graph.trendTstamps.push(formattedTsGraph)
    });
    ///TREND DATA

    const viewData = {
      title: "Trip",
      trip: trip,
      telemetry: trip.telemetry,
      startingLocationLatitude: startingLocationCoords[0],
      startingLocationLongitude: startingLocationCoords[1],
      endingLocationLatitude: endingLocationCoords[0],
      endingLocationLongitude: endingLocationCoords[1],
      speedViolationCounter: speedViolationCounter,
      rpmViolationCounter: rpmViolationCounter,
      maxRpm: maxRpm,
      maxSpeed: maxSpeed,
      rpmAverage: rpmAverage,
      speedAverage: speedAverage,
      hasComments: hasComments,
      durationHours: durationHours,
      durationMinutes: durationMinutes,
      durationSeconds: durationSeconds,
      graph: graph,
    };
    response.render("trip-view", viewData);
  },

  async startTrip(request, response) {
    newTrip = {
      startedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      _id: v4(),
    };
    //record state set to on
    recordStatus = true
    telemetryFuncs.recordTelemetry(newTrip._id)
    console.log(`starting trip ${newTrip._id}`);
    response.redirect("/dashboard");
  },

  ///End and record data to the trip
  async endTrip(request, response) {
    newTrip.endedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    //add collected telemetry data to the trip
    newTrip.telemetry = telemetryFuncs.sendTelemetry()
    //stop recording/clear buffers in mqtt
    telemetryFuncs.stopRecording();
    //record state set to off
    recordStatus = false;
    //end early if the record stop button is spammed so there are no empty trips
    if (newTrip.telemetry.length === 0) {
      console.log(`Trip discarded`);
      response.redirect("/dashboard")
    }
    else {
      newTrip.status = "Ended by user"
      //add the trip
      await tripStore.addTrip(newTrip);
      console.log(`adding trip ${newTrip.id}`);
      newTrip = null; //reset trip
      response.redirect("/dashboard");
    }
  },

  async deleteTrip(request, response) {
    const tripid = request.params.id;
    console.log(`Deleting trip ${tripid}`);
    await tripStore.deleteTripById(tripid);
    response.redirect("/dashboard")
  }
}
