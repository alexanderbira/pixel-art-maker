# Pixel-Art-Maker
This website allows you to make pixel art and export it as a PNG.

# Sections
* [Tools](#tools)
* [Features](#features)
* [Usage](#usage)
* [Screenshots](#screenshots)

# Tools

## Save as png
Open a popup where you type in a final image size, and then the image appears as a PNG at the bottom of the page.<br>
<kbd>alt+s</kbd><br>
![save icon](icons/save.png?raw=true)

## Reset grid
If alert is confirmed, will reset every pixel in the grid to be transparent.<br>
<kbd>alt+r</kbd><br>
![reset icon](icons/reset.png?raw=true)

## Pen tool
This is the default tool, and will be selected if any other tool is deselected. Allows you to draw freely by clicking a pixel, or dragging while with the mouse down.<br>
<kbd>alt+space</kbd><br>
![pen icon](icons/pen.png?raw=true)

## Sample colour
Lets you click on any pixel on the grid to set your brush to that colour.<br>
<kbd>alt+p</kbd><br>
![sample icon](icons/sample.png?raw=true)

## Eraser
Acts like the pen tool, but with a transparent brush.<br>
<kbd>alt+e</kbd><br>
![eraser icon](icons/eraser.png?raw=true)

## Fill area
Fills in all the pixels in an enclosed area to be the brush colour.<br>
<kbd>alt+f</kbd><br>
![fill icon](icons/fill.png?raw=true)

## Pick colour
Opens up a draggable widget where you can create and delete colour circles. These colour circles are automatically saved between sessions, and any of them can be selected to change the brush colour to its colour. The colour of these circles can be changed either through your computer's native colour selector, through typing in a CSS colour code, or with the RGBAHSL sliders/text boxes.<br>
<kbd>alt+c</kbd><br>
![palette icon](icons/palette.png?raw=true)

## Draw line
Draws a line between the two points that you click, and shows you a preview of the line when you hover over squares after clicking one point.<br>
<kbd>alt+l</kbd><br>
![line icon](icons/line.png?raw=true)

## Draw circle
Draws a circle between the two points that you click (first point is midpoint, second point is on circle), and shows you a preview of the circle when you hover over squares after clicking one point.<br>
<kbd>alt+o</kbd><br>
![circle icon](icons/circle.png?raw=true)

## Change view
Switch between the different view modes. There's:<br>
* Grid and background dots
* Grid and no background dots
* No grid and background dots
* No grid and no background dots

The default is grid and background dots. The grid shows you the border of the square, and the background dot goes behing the pixel colour, allowing you to see if the pixel is transparent/translucent.<br>
<kbd>alt+v</kbd><br>
![view icon](icons/eye.png?raw=true)

## Undo last action
Undoes your last move. A move is any of the following:<br>
* Grid reset
* Fill area
* Draw line
* Click pixel (including eraser)
* Mousedown drag (including eraser)

<kbd>alt+z</kbd><br>
![undo icon](icons/undo.png?raw=true)

## Redo last action
Undoes the last undo. Does not work if any extra pixels are changed between the undo and redo<br>
<kbd>alt+shift+z</kbd><br>
![redo icon](icons/redo.png?raw=true)

## Download file for later editing
Downloads your file as the custom `.pxart` fomat. This file contains all of the grid data, and can be re-imported in the popup that appears when the site is opened<br>
<kbd>alt+d</kbd><br>
![download icon](icons/download.png?raw=true)

## Toggle menu
Hides the sidebar with all the tools except for itself. Can be re-clicked to reveal the toolbar. Keyboard shortcuts for tools still work when the bar is hidden.<br>
<kbd>alt+h</kbd><br>
![arrow icon](icons/arrow.png?raw=true)

# Features
<ul>
  <li>Choose colour with native picker, CSS code, or RGBAHSL sliders / input boxes</li>
  <li>Make custom-sized grid - any rectangle from 1x1 up to 100x100</li>
  <li>Grid always scaled to fit on screen, ensuring each square is as big as possible while being visible</li>
  <li>Export as PNG image, with alpha channel support</li>
  <li>Choose how much to scale one grid square into a pixel - you can make a 2x2 grid become a 2x2 - 100x100 image</li>
  <li>No loss in image quality</li>
  <li>Create new colours and have multiple at a time to choose between. You can delete these, and they are save accross sessions</li>
  <li>Colour menu can be dragged and relocated across page</li>
  <li>Use the line tool and click on one point, then hover elsewhere to see a preview, and click to apply</li>
  <li>Dots behind each grid square to show opacity</li>
  <li>Choose between view options of grid and dots, no grid and dots, no dots and grid, or no dots and no grid</li>
  <li>Hide the menu to draw without distractions</li
  <li>Undo all your mistakes with the undo tool, and re-do unnecessary undos</li>
  <li>Download your project as a .pxart file</li>
  <li>Upload a .pxart file to continue editing it</li>
 </ul>
 
# Usage
<ol>
  <li>Input the grid width and height in the popup</li>
  <li>Use the colour selector to change your brush colour</li>
  <li>Hover over a pixel for a preview of what it looks like</li>
  <li>Click on a pixel to apply the colour change, or click and hold to colour every pixel your mouse goes over</li>
  <li>Use tools to simplify the drawing process</li>
  <li>Click the save button</li>
  <li>Fill in the pixel scaler popup</li>
  <li>Scroll down and your image is there. You can copy it or save it with a right click</li>
</ol>

# Screenshots
![1](screenshots/1.png?raw=true)

---

![2](screenshots/2.png?raw=true)

---

![3](screenshots/3.png?raw=true)

---

![4](screenshots/4.png?raw=true)

---

![5](screenshots/5.png?raw=true)

---

![6](screenshots/6.png?raw=true)

---

![7](screenshots/7.png?raw=true)

---

![8](screenshots/8.png?raw=true)

---

![9](screenshots/9.png?raw=true)

---

![10](screenshots/10.png?raw=true)
