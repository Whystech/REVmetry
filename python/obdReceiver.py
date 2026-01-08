import obd

connection = obd.OBD("/dev/rfcomm0")

def connectObd():
    global connection
    global connection
    if connection.is_connected():
        return  #break before the loop starts
    while not connection.is_connected():
        connection = obd.OBD()
    
    


def get_Obd_Data():
    connectObd()
    speedRaw = connection.query(obd.commands.SPEED)
    speed = speedRaw.value.to("kph").magnitude #magnitude returns only the number
    rpmRaw = connection.query(obd.commands.RPM)
    rpm = rpmRaw.value.magnitude
    tempRaw = connection.query(obd.commands.COOLANT_TEMP)
    temp = tempRaw.value.to("celsius").magnitude
    return speed, rpm, temp



    data = get_Obd_Data()
    print (f"{data[0]} {data[1]}, {data[2]}")

   