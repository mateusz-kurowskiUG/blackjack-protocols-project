import mqtt from "mqtt"; // require mqtt
const mqttClient = mqtt.connect("mqtt://localhost"); // create a client
export default mqttClient;
