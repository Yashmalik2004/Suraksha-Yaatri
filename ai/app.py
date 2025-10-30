from ultralytics import YOLO
import cv2
import sys
import os
import time
import math
import socketio
import requests

SOCKET_URL = "http://localhost:5000"
API_URL = "http://localhost:5000/alerts/create"

LOCATION_THRESHOLD = 350
NO_WEAPON_INTERVAL = 3
ALERT_THROTTLE = 10

CLASS_NAME_MAP = {
    "Cuchillo": "Knife",
    "Armas": "Gun",
}

model = YOLO("best.pt")

def list_cameras(max_cams=5):
    """Return list of available camera indices."""
    available = []
    for i in range(max_cams):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            available.append(i)
            cap.release()
    return available

print("Checking available cameras...")
cams = list_cameras()
if not cams:
    print("No cameras found!")
    sys.exit(1)

print("Available cameras:")
# for i, cam in enumerate(cams):
#     print(f"{i}: Camera index {cam}")

# selected = input(f"Select camera [0-{len(cams)-1}]: ")
try:
    selected_idx = int(selected)
    if selected_idx < 0 or selected_idx >= len(cams):
        raise ValueError
    input_source = cams[selected_idx]
except:
    print("Invalid selection, using default camera 0.")
    input_source = cams[0]

cap = cv2.VideoCapture(input_source)
if not cap.isOpened():
    print(f"Failed to open camera {input_source}")
    sys.exit(1)

frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f" Video source opened ({frame_width}x{frame_height}). Press 'q' to quit.")

sio = socketio.Client()
try:
    sio.connect(SOCKET_URL)
    print("Connected to backend via Socket.IO")
except Exception as e:
    print("Failed to connect to backend:", e)
    sio = None

weapon_locations = {}  
last_no_weapon_time = 0
alert_times = {}

def convert_to_latlon(x, y):
    """Convert pixel coordinates to lat/lon (for backend)."""
    latitude = (y / frame_height) * 180 - 90
    longitude = (x / frame_width) * 360 - 180
    return latitude, longitude

def send_alert(class_name, location):
    """Send alert to backend API via Socket.IO and HTTP POST, with throttling."""
    now = time.time()
    last_sent = alert_times.get(class_name, 0)
    if now - last_sent < ALERT_THROTTLE:
        return
    alert_times[class_name] = now

    latitude, longitude = convert_to_latlon(*location)
    payload = {
        "type": "weapon",
        "location": class_name,
        "latitude": latitude,
        "longitude": longitude,
        "priority": "high",
        "userId": 1
    }

    if sio:
        sio.emit("new-alert", payload)

    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            print(f" Alert sent: {class_name}")
        else:
            print(f" Failed to send alert: {response.text}")
    except Exception as e:
        print(f" Error sending alert: {e}")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame.")
        break

    results = model(frame, verbose=False)
    annotated = results[0].plot()
    detections = results[0].boxes
    current_time = time.time()

    if len(detections) > 0:
        for box in detections:
            cls_id = int(box.cls[0].item())
            raw_name = model.names[cls_id]
            class_name = CLASS_NAME_MAP.get(raw_name, raw_name)

            x1, y1, x2, y2 = box.xyxy[0]
            center_x = int((x1 + x2) / 2)
            center_y = int((y1 + y2) / 2)
            new_location = (center_x, center_y)

            if class_name not in weapon_locations:
                print(f" ALERT: {class_name} detected at {new_location}")
                weapon_locations[class_name] = new_location
                send_alert(class_name, new_location)
            else:
                old_x, old_y = weapon_locations[class_name]
                dist = math.dist(new_location, (old_x, old_y))
                if dist > LOCATION_THRESHOLD:
                    print(f" ALERT: {class_name} moved to {new_location}")
                    weapon_locations[class_name] = new_location
                    send_alert(class_name, new_location)

        last_no_weapon_time = current_time

    else:
        if current_time - last_no_weapon_time >= NO_WEAPON_INTERVAL:
            print(" No weapon detected.")
            last_no_weapon_time = current_time
            weapon_locations.clear()

    cv2.imshow("Weapon Detection", annotated)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
if sio:
    sio.disconnect()
