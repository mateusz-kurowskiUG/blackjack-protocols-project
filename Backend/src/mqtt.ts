import mqtt from "mqtt"; // require mqtt
import { Server } from "socket.io";
export const mqttClient = mqtt.connect("mqtt://localhost"); // create a client

export const io = new Server(3001, {});
