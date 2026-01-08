import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { engine } from "express-handlebars";
import { router } from "./routes.js";
import { WebSocketServer } from "ws";
import './services/mqtt.js' // run the MQTT client

const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public")); //access for the public folder at browser level
app.use(fileUpload());
app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");
app.use("/", router);

export const listener = app.listen(process.env.PORT || 4000, function () {
  console.log(`Todolist started on http://localhost:${listener.address().port}`);
  });

//also attaching the WSS to the node server (same port, good for RENDER deployment)
export const wss = new WebSocketServer({ server: listener });
wss.on('error', (err) => {
  console.error('WebSocket server error:', err);
});

