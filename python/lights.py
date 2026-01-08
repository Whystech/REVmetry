from sense_hat import SenseHat

sense = SenseHat()
G = (0, 255, 0)   
O = (0, 0, 0)     

check_mark = [
    O,O,O,O,O,O,O,O,
    O,O,O,O,O,O,O,G,
    O,O,O,O,O,O,G,O,
    O,O,O,O,O,G,O,O,
    O,G,O,O,G,O,O,O,
    O,O,G,G,O,O,O,O,
    O,O,O,O,O,O,O,O,
    O,O,O,O,O,O,O,O
]

def check():
    sense.clear()
    sense.set_pixels(check_mark)

sense.clear()