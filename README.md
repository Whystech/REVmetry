# REVmetry

  

Monitor your car via Pi.

  

---

  

## Features

  

Shows current speed, location and RPM.

Record trips with telemetry points that can be viewed on the map.

Each telemetry point will show location, speed, RPM and violations if any.

Start and end location of a trip.

Display a graph of rpm and speed over the duration of a trip.

The attached SenseHat's LEDs will show light according to your RPM.
--- White: low RPM
--- Blue : still low, but good enough for shifting
--- Green: optimal shift range
--- Red: overrevt

  

---

  

### How to Use
- Clone the repo
```
git clone https://github.com/Whystech/REVmetry
```

- Run the telemetry program ONLY if you have the OBD and GPS connected and working:
```
python ./REVmetry/telemetry.py
```
Otherwise, run the program below that simulates sensor data:
```
python ./REVmetry/simulated-telemetry.py
```
- To see the dashboard either access the deployed webapp at `https://revmetry.onrender.com`

OR
- Run it locally using
` node ./REVmetry/REVmetry-dashboard/server.js`
then on your browser visit `localhost:4000` or `<yourhostname>:4000`

  
  

## Prerequisites

### Requried hardware:

- Pi

- USB Gps receiver (Ublox 7 chip inside or better / other (garmin))

- ELM 327 OBD reader (bluetooth or USB)

  

### Required packages on your PI:

- gpsd-clients

- gpsd-tools

- gpsd

- python3-gps

- bluetooth

- blueman

  

Requied python libraries:

- gpsdclient

- gps

- odb

  

## Installing gpsd client and dependencies

```

sudo apt update

sudo apt install gpsd gpsd-tools gpsd-clients python3-gps

pip3 install gpsdclient

pip install gps==3.19

```

## Installing OBD python library
```

pip install obd

```

  

# GPS Configuration

To avoid "cold-starts" of the GPS  some changes can be made for the gpsd daemon so the GPS is "warmed up" before launching the script and starts fixing for a GPS location sooner.

If connected via USB no further configuration needs to be done as gpsd properly identifies the receiver.

Run `sudo nano /etc/default/gpsd`

Edit as follows:

```

START_DAEMON="true"

USBAUTO="true"

GPSD_OPTIONS="-n"

DEVICES="" - will allow gpsd to dynamically identify any GPS receivers

OR

DEVICES="ttyACM0" - in this specific case of GPS receiver

```

This avoids getting multiple invalid coordinates right after starting the  `telemetry.py` as gpsd just then starts to getting a fix from the satellites.


## Check if the GPS Receiver gets data

### If all the lat/lon received are 0/0
- Use `lsusb` to look for your device (tty/ACM0) or `ls /dev/ | grep ACM` and confirm its connection
-  Use `cgps` in the CLI to get GPS information
- Or `xgps` for an interactive GUI (must have a display connected to the Pi or connected through VNC)
- In `cgps` look on the right tab at Seen/Used; Should be at least 4 or more satellites used to get lat/lon/time (could be even more if the quality is bad)
- In `xgps` all satellites are listed on the left side, and their position relative to you visually represented on the right (as seen from above with your location in the middle).
- The python program is set up to use mode 1 (1 = no satellite fix, 2 = 2d fix, lat lon only, 3 = 3d fix, lat lon alt) - so it will feed location data even if there is no actual valid data.

# OBD configuration and bluetooth connection

First,  plug in the OBD adapter in your car's OBD diagnostic port. Some lights should turn on (depending on adapter) indicating that the adapter is getting power.

For Pi, the bluetooth tools are already pre-installed, if using a bluetooth adapter some additional packages might need to be installed (blueman, bluez-utils, bluetooth).

I will focus on the Pi scenario.

Run:

```
bluetoothctl
```

then the following commands in order

```
power on
agent on
default-agent
scan on
```

While scanning, look for a MAC addresss that looks something like:

```
[NEW] Device 11:22:33:44:55 OBD II
```

Copy that address and pair with it:

```
pair 11:22:33:44:55
```

A PIN might be requested, for those adapters the PIN is usually 1234 or 0000.

After pairing run:

```
trust 11:22:33:44:55
```

Now, the Pi is set to pair with the OBD when **required**.
This is an important aspect. The Pi will not be constantly connected to the OBD unless specifically told so. This happens when using the Python OBD library via
```
connection = obd.OBD()
```
Seeing no flashing lights or activity is normal.

In the case of using an OBD adapter with USB the setup should be a bit easier, plug in the USB and the python library should handle the rest.
 
# References
This project was created by Andrei-Teodor Ianus under the guidance of :

- John Rellis for the web application (based on the WebDev curriculum) - re-used WetherWeather app done for a -previous assignment.
- Frank Walsh for the backend and setup of the MQTT client, Pi and other networking/services configs.
- Mujahid Tabassum for networking debugging setup and troubleshooting.
- Caroline Cahill for managing the Linux environment.

## Resources

- gauges
https://bernii.github.io/gauge.js/
MIT Licence
  

- Leaflet for maps
https://leafletjs.com/reference.html

- python OBD
https://python-obd.readthedocs.io/en/latest/

- GPSD 
https://gpsd.io/client-howto.html - tools  
https://pypi.org/project/gpsdclient/ - python  

### Images

- https://icon-sets.iconify.design/
OFL Licence

- https://icones.js.org/collection/academicons
OFL Licence

### Guides and other sources of information

- MQTT auth  
https://cedalo.com/blog/configuring-paho-mqtt-python-client-with-examples/#Configure_client_authentication

- WebSockets  
https://gpsd.io/client-howto.html
https://render.com/docs/websocket - doesn't really mention that Render DOESN'T allow custom PORT setting.  

https://www.youtube.com/watch?v=FduLSXEHLng&t=366s  
Very good tutorial, explains how WebSockets work on the browser-side   


### Bugs
- Invalid coords will be registered as telemetry points, this means:
- Sometimes the starting and ending location will be registed as (0,0), the map will display the middle of the ocean, Null Island is a nice place to find yourself in.
- The invalid coords are "usually" genuine (e.g the GPS can't get a reading yet - the location has not been fixed, insufficient satellites, passing through a tunnel)
- Some frontend "anomalies": sometimes the RPM  gauge will not render, a refresh will most likely fix it.
- As it is built right now, there are no sessions or users registered, anyone who will access the webapp will have shared controls.


## Youtube link

https://youtu.be/iLiB-UccBNo
