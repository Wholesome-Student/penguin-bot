from imread_from_url import imread_from_url
import cv2
import base64
import sys

def symmetryLeft(image):
  width = image.shape[1]
  imageLeft = image[:,0:width//2]
  imageFlipped = cv2.flip(imageLeft, 1)
  return cv2.hconcat([imageLeft, imageFlipped])

def symmetryRight(image):
  width = image.shape[1]
  imageRight = image[:,width//2:width]
  imageFlipped = cv2.flip(imageRight, 1)
  return cv2.hconcat([imageFlipped, imageRight])

if __name__ == "__main__":
  if(len(sys.argv) == 3):
    isInverse = sys.argv[1]
    url = sys.argv[2]
  else:
    sys.exit(1)
  if isInverse=="true":
    symmetryImage = symmetryRight(imread_from_url(url))
  else:
    symmetryImage = symmetryLeft(imread_from_url(url))
  _, encoded = cv2.imencode(".png", symmetryImage)
  print(base64.b64encode(encoded).decode("ascii"))
