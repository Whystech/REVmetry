
import { initStore } from "../utils/store-utils.js";

const db = initStore("trips");

export const tripStore = {
  async getAllTrips() {
    await db.read();
    return db.data.trips;
  },

  //unused
  async getTripsByUserId(userid) {
    await db.read();
    return db.data.trips.filter((trip) => trip.userid === userid);
  },

  async addTrip(trip) {
    await db.read();
    db.data.trips.push(trip);
    await db.write();
    return trip;
  },

  async getTripById(id) {
    await db.read();
    const trip = db.data.trips.find((trip) => trip._id === id);
    console.log(trip)
    return trip;
  },

  async deleteTripById(id) {
    await db.read();
    const index = db.data.trips.findIndex((trip) => trip._id === id);
    db.data.trips.splice(index, 1);
    await db.write();
  },

  async pushTelemetryData(tripid, telemetryData) {
    await db.read()
    const trip = await this.getTripById(tripid);
    trip.push(telemetryData);
    await db.write()
  },

  async deleteAllTrips() {
    //need await read here so I won't get null errors
    await db.read();
    db.data.trips = [];
    await db.write();
  },
};
