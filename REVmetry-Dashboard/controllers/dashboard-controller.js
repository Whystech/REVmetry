import { tripStore } from "../models/trip-store.js"
import { recordStatus } from "./trip-controller.js";
import { rpiStatus } from "../services/mqtt.js";
import { speed, rpm } from "../services/mqtt.js";



export const dashboardController = {
  async index(request, response) {
    let rpiOn
    let tripsPresent = false
    if (rpiStatus == "online"){
      rpiOn = true
    } else {
      rpiOn = false
    }
    const trips = await tripStore.getAllTrips()
    if (trips.length > 0){
      tripsPresent = true
    }
    let comments = []
    trips.forEach(trip  => {
      trip.startingLocationLatitude = trip.telemetry[0].latitude
      trip.startingLocationLongitude = trip.telemetry[0].longitude

    });

    const viewData = {
      title: "Telemetry Dashboard",
      trips: trips,
      recordStatus: recordStatus, //control the record status from dashboard, avoid routing problems
      rpiStatus: rpiOn,
      speedNumber: speed,
      rpmNumber: rpm,
      tripsPresent: tripsPresent
    };
    console.log(trips)
    console.log(`rpi is ${viewData.rpiStatus}`)
    console.log("dashboard rendering");
    console.log(rpiStatus)
    response.render("dashboard-view", viewData);
  },

};
