from gpsdclient import GPSDClient

def get_Coords():
    coords = []
    with GPSDClient() as client:
        # Wait until a device is present
        for result in client.dict_stream(filter=["DEVICES"]):
            devices = result.get("devices", [])
            if not devices:
                return 0, 0
            break

        # Wait for a valid fix
        for result in client.dict_stream(filter=["TPV"]):
            mode = result.get("mode", 0)

            if mode >= 1: #get lat lon wether they're valid or not, wating to get a fix, makes the whole program hang (mode 2 for lat, lon, mode 3 for lat, lon, alt)
                lat = result.get("lat", "0")
                lon = result.get("lon", "0")
                return lat, lon
            
#for testing
simulatedLat = 53.350140
simulatedLon = -6.266155      

def simulated_Coords():
    global simulatedLat, simulatedLon
    # Random small change to simulate movement
    simulatedLat += 0.0001
    simulatedLon -=  0.0001
    print(f"Latitude: {simulatedLat:.6f}, Longitude: {simulatedLon:.6f}")
    return simulatedLat, simulatedLon
