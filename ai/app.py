from ultralytics import YOLO
import cv2
import sys
import os
import time
import math
import socketio
import requests
import threading

SOCKET_URL = "http://localhost:5000"
API_URL = "http://localhost:5000/alerts/create"

LOCATION_THRESHOLD = 350
NO_WEAPON_INTERVAL = 3
ALERT_THROTTLE = 10

CLASS_NAME_MAP = {
    "Cuchillo": "Knife",
    "Armas": "Gun",
}

# Global scan control
is_scanning = True
model = None
sio = None

def load_model():
    """Load the YOLO model."""
    global model
    try:
        model = YOLO("best.pt")
        print("[MODEL] YOLO model loaded successfully")
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
        sys.exit(1)

def connect_socket():
    """Connect to Socket.io server."""
    global sio
    try:
        sio = socketio.Client()
        sio.connect(SOCKET_URL)
        print("[SOCKET] Connected to backend via Socket.IO")
        return sio
    except Exception as e:
        print(f"[WARNING] Failed to connect to Socket.io: {e}")
        return None

def list_cameras(max_cams=5):
    """Return list of available camera indices."""
    available = []
    for i in range(max_cams):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            available.append(i)
            cap.release()
    return available

def convert_to_latlon(x, y, frame_width, frame_height):
    """Convert pixel coordinates to lat/lon (for backend)."""
    latitude = (y / frame_height) * 180 - 90
    longitude = (x / frame_width) * 360 - 180
    return latitude, longitude

def send_weapon_alert(class_name, location, latitude, longitude):
    """Send weapon detection alert to backend via Socket.IO."""
    global sio
    try:
        # Emit weapon-detected event for real-time frontend update
        weapon_data = {
            "type": class_name,
            "location": class_name,
            "confidence": 0.95,  # You can pass actual confidence from detection
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "latitude": latitude,
            "longitude": longitude,
        }
        
        if sio:
            sio.emit("weapon-detected", weapon_data)
            print(f"[EMIT] Weapon detected event sent: {class_name}")
        
        # Also send as alert via HTTP
        payload = {
            "type": "weapon",
            "location": class_name,
            "latitude": latitude,
            "longitude": longitude,
            "priority": "high",
            "userId": 1
        }
        
        try:
            response = requests.post(API_URL, json=payload, timeout=5)
            if response.status_code == 200:
                print(f"[API] Alert created: {class_name}")
            else:
                print(f"[API] Failed to create alert: {response.text}")
        except Exception as e:
            print(f"[API] Error: {e}")
            
    except Exception as e:
        print(f"[ERROR] Failed to send weapon alert: {e}")

def run_weapon_detection():
    """Main weapon detection loop."""
    global is_scanning, model, sio
    
    print("[INIT] Starting weapon detection...")
    
    # Load model
    load_model()
    if model is None:
        return
    
    # Connect to Socket.io
    connect_socket()
    
    # List and select camera
    print("[CAMERA] Checking available cameras...")
    cams = list_cameras()
    if not cams:
        print("[ERROR] No cameras found!")
        if sio:
            sio.emit("scan-error", {"error": "No cameras found"})
        return
    
    input_source = cams[0]  # Default to first camera
    print(f"[CAMERA] Using camera index: {input_source}")
    
    # Open camera
    cap = cv2.VideoCapture(input_source)
    if not cap.isOpened():
        print(f"[ERROR] Failed to open camera {input_source}")
        if sio:
            sio.emit("scan-error", {"error": f"Failed to open camera {input_source}"})
        return
    
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"[CAMERA] Video source opened ({frame_width}x{frame_height})")
    
    if sio:
        sio.emit("scan-status", {"message": f"Camera opened ({frame_width}x{frame_height}). Starting detection..."})
    
    weapon_locations = {}
    last_no_weapon_time = time.time()
    alert_times = {}
    frame_count = 0
    
    print("[SCAN] Starting detection loop. Press 'q' to quit...")
    if sio:
        sio.emit("scan-status", {"message": "Detection loop started. Processing frames..."})
    
    try:
        while is_scanning:
            ret, frame = cap.read()
            if not ret:
                print("[ERROR] Failed to grab frame.")
                break
            
            frame_count += 1
            
            # Run detection
            results = model(frame, verbose=False)
            annotated = results[0].plot()
            detections = results[0].boxes
            current_time = time.time()
            
            if len(detections) > 0:
                print(f"[DETECT] Detections found in frame {frame_count}")
                for box in detections:
                    cls_id = int(box.cls[0].item())
                    raw_name = model.names[cls_id]
                    class_name = CLASS_NAME_MAP.get(raw_name, raw_name)
                    confidence = float(box.conf[0].item())
                    
                    x1, y1, x2, y2 = box.xyxy[0]
                    center_x = int((x1 + x2) / 2)
                    center_y = int((y1 + y2) / 2)
                    new_location = (center_x, center_y)
                    
                    latitude, longitude = convert_to_latlon(center_x, center_y, frame_width, frame_height)
                    
                    if class_name not in weapon_locations:
                        print(f"[ALERT] {class_name} detected at {new_location} (confidence: {confidence:.2f})")
                        weapon_locations[class_name] = new_location
                        now = time.time()
                        if class_name not in alert_times or (now - alert_times[class_name] >= ALERT_THROTTLE):
                            send_weapon_alert(class_name, new_location, latitude, longitude)
                            alert_times[class_name] = now
                    else:
                        old_x, old_y = weapon_locations[class_name]
                        dist = math.dist(new_location, (old_x, old_y))
                        if dist > LOCATION_THRESHOLD:
                            print(f"[ALERT] {class_name} moved to {new_location}")
                            weapon_locations[class_name] = new_location
                            now = time.time()
                            if class_name not in alert_times or (now - alert_times[class_name] >= ALERT_THROTTLE):
                                send_weapon_alert(class_name, new_location, latitude, longitude)
                                alert_times[class_name] = now
                
                last_no_weapon_time = current_time
            else:
                if current_time - last_no_weapon_time >= NO_WEAPON_INTERVAL:
                    print(f"[SCAN] No weapons detected (frame {frame_count})")
                    last_no_weapon_time = current_time
                    weapon_locations.clear()
            
            # Show detection window
            try:
                cv2.imshow("Weapon Detection", annotated)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("[STOP] 'q' pressed, stopping scan...")
                    break
            except Exception as e:
                print(f"[WARNING] Display error: {e}")
    
    except KeyboardInterrupt:
        print("[STOP] Keyboard interrupt received")
    except Exception as e:
        print(f"[ERROR] Scan loop error: {e}")
        if sio:
            sio.emit("scan-error", {"error": str(e)})
    finally:
        print("[CLEANUP] Closing camera and cleanup...")
        cap.release()
        cv2.destroyAllWindows()
        if sio:
            sio.disconnect()
        print("[DONE] Weapon detection stopped")

if __name__ == "__main__":
    run_weapon_detection()
