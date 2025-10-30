from ultralytics import YOLO
import cv2

# Load the trained model
model = YOLO("C:/Users/YASH/Desktop/yolo/best.pt")
# Open webcam (0 = default camera)
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    # Run YOLO prediction
    results = model(frame, imgsz=640, conf=0.4)
    # Plot results on frame
    annotated_frame = results[0].plot()
    # Show the frame
    cv2.imshow("YOLOv8 Live Detection", annotated_frame)
    # Exit on 'q' key
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
