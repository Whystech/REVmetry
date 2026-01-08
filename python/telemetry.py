from envsensors import *;
from spatialsensors import *;
from gpsReceiver import *;
import os, time, json;
import paho.mqtt.client as mqtt;
import sys, signal;
from random import *;
from rpmIndicatorv2 import *;
from lights import *;
from obdReceiver import *;

USER_ID = os.getenv("USER_ID", "ianuj")
BROKER  = os.getenv("MQTT_BROKER", "8cd1987612ce4be5a8a0228b31bd0975.s1.eu.hivemq.cloud") #experimenting with authentication so data is not publicly available
TELEMETRY_PERIOD_S = float(os.getenv("TELEMETRY_PERIOD_S", "10"))
PASSWORD = "HDIPiot2026@" #configured in Hivemq
PORT = 8883

#Client Id's must be different (node/python)
client = mqtt.Client(
    client_id=f"{USER_ID}-python", 
    protocol=mqtt.MQTTv5,
    callback_api_version=mqtt.CallbackAPIVersion.VERSION2, #a lot of issues here.
)

#set username and password
client.username_pw_set(USER_ID, PASSWORD)

###Topics for MQTT 
SENSORS_TOPIC = f"/{USER_ID}/sensors"
STATUS_TOPIC = f"/{USER_ID}/status"


def on_connect(client, userdata, flags, reason_code, properties):
    print("MQTT connected:", reason_code)
    client.publish(STATUS_TOPIC, "online", qos=1, retain=True)
    check() #a visual confirmation that the Pi is connected to the MQTT server and it will start sending telemetry
    sleep(2)

#no data should be received in this scenario
def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode("utf-8"))
        print("Message received:", data)
    except Exception as e:
        print("on_message error:", e)


client.on_connect = on_connect
client.on_message = on_message

#Before connecting (will)
client.will_set(STATUS_TOPIC,payload="offline", qos=1, retain=True)

def shutdown(*_):
    try:
        client.publish(STATUS_TOPIC, "offline", qos=1, retain=True)
        time.sleep (0.1)
        client.disconnect()
    except Exception:
        pass
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)

def publishTelemetry():
    global rpm
    obdData = get_Obd_Data()
    coords = get_Coords() or (0.0, 0.0)  # default if GPS not ready, if the receiver is removed while the script is running, telemetry will freeze, and the script will have to be restarted
    latitude, longitude = coords
    speed, rpm, coolantTemp = obdData

    payload = {
            "userID": USER_ID,
            "temp": get_temp(),
            "humidity": get_humidity(),
            "ts": int(time()),
            "latitude": latitude, #latitude or simulatedLatitude
            "longitude": longitude, #longitude or simulatedLongitude
            "speed": speed, #speed or simulatedSpeed
            "rpm": rpm, #rpm of simulatedRpm
            "coolantTemp": coolantTemp

        }
    # QoS 0 for frequent telemetry; retain latest for late subscribers
    client.publish(SENSORS_TOPIC, json.dumps(payload), qos=0, retain=False)
    print("Telemetry:", payload)


def main():
    client.tls_set() #requried if used authentication - as in this scenario
    client.connect(BROKER, PORT)
    client.loop_start() #according to docs and other tutorials this part should keep the mqtt broker/server aware the Pi is still "alive" by pings.
    while True:
        publishTelemetry()
        rpmIndicator(rpm)
        sleep(0.5)
main()
