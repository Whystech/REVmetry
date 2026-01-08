import express from "express";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { tripController } from "./controllers/trip-controller.js";
import { aboutController } from "./controllers/about-controller.js";

export const router = express.Router();
///Dashboard routes
router.get("/", dashboardController.index);
router.get("/dashboard", dashboardController.index);
router.post("/dashboard/starttrip", tripController.startTrip);
router.post("/dashboard/endtrip", tripController.endTrip);
router.get("/about", aboutController.index);
router.get("/trip/:id", tripController.index);

//Trip routes

router.get("/trip/delete/:id", tripController.deleteTrip);






