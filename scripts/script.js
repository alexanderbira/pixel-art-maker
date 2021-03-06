//keeps track of whether to apply change when hovering over a pixel widthout a click if the mouse is already down
var mouseDown = false;
document.body.setAttribute('onmousedown', "mouseDown=true; hoverFilledList=[colour]");
document.body.setAttribute('onmouseleave', "mouseDown=false");
document.body.setAttribute('onmouseup', 
"mouseDown=false; if(hoverFilledList.length>1){if(prevmode){trimActionList()}actions.push(hoverFilledList);actionCounter++}");

//tools
var selecting = false; //if sampling mode is on
var filling = false; //if filling mode is on
var oldcol = 'black'; //the colour to revert to when the eraser is re-enabled
var lining = false; //if the line mode is on
var circling = false; //if circle mode is on
var movingSetting = false; //if the colour menu is currently being moved

var menuHidden = false; //keeps track of if the menu if up or down
var view = 0; //keeps track of what view mode (grids and dots) the page is on

var actions = []; //for the un/re do tool
var actionCounter = 0; 
var prevmode = false; //if you're back in time

var hoverFilledList = []; //to append whne click and hold brush is used (to actions)
var hoveredCurrentBackground = '';

var elementsMatrix = [];

var colour = 'black'; //brush colour


//returns the formatted image url in b64
function makeImage(width, height, multiplier, data) {

  let imageWidth = width;
  let imageHeight = height;

  //makes all the pixels be the defined multiplier size
  function expandImage(pixelSize, imageData){
    let outputList = [];
    imageWidth *= pixelSize;
    imageHeight *= pixelSize;

    //basically inserts each pixel n times into the row, and each row n times into the image list
    for (row of imageData) {
      let newRow = [];
      for (pixel of row) {
        for (a=0; a<pixelSize; a++) {
          newRow.push(pixel);
        }
      }
      for (let b=0; b<pixelSize; b++) {
        outputList.push(newRow);
      }
    }
    return outputList.toString().replace(/[\[\]]/g, '').split(','); //returns as single list
  }

  let imageData = expandImage(multiplier, data);
  let formattedImageData = imageData.map(data=>String.fromCharCode(data)).join(''); //converts each element in the data list to the string from char code and puts it all in a big string
  let dataURL = btoa(generatePng(imageWidth, imageHeight, formattedImageData));
  let finalURL = 'data:image/png;base64,' + dataURL;
  //window.open(finalURL); //uncomment to make the new image open in a new tab
  img = document.createElement("img");
  img.src = finalURL;

  return img;
}

//function is run when a pixel is hovered
function divHover(element, fromClick) { //remember this funtion is also called onmousedown
  if (selecting+movingSetting+filling+lining+circling === 0) { //if none of them are true - basically brush mode

    let currentBackground = element.style.backgroundColor;
    
    if (fromClick !== undefined) {
      (hoveredCurrentBackground=>{setTimeout(()=>hoverFilledList.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), hoveredCurrentBackground]),1)})(hoveredCurrentBackground); //timeout so not reset by document mousedown event
    }

    hoveredCurrentBackground = element.style.backgroundColor; //needs to be global so that when clicked undo function can know what the last colour was

    if (!mouseDown) {
      element.setAttribute("onmouseleave", "this.style.backgroundColor='"+currentBackground+"';this.removeAttribute('onmouseleave')"); //if the mouse is not down, make it lose the colour when hovered out, and also delete the hover out event
    } else {
      hoverFilledList.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
    }
    element.style.backgroundColor = colour;

  } else if (lining) { //create line

    if (firstPoint !== undefined) { //make line if a point is picked
      let secondPoint = element.getAttribute('data-coords').split(',').map(data=>parseInt(data));
      line(firstPoint[1], firstPoint[0], secondPoint[1], secondPoint[0]);

    } else { //otherwise colour in the hovered one
      let currentBackground = element.style.backgroundColor;
      element.setAttribute("onmouseout", "this.style.backgroundColor='"+currentBackground+"';this.removeAttribute('onmouseout');");
      element.style.backgroundColor = colour;

    } 
  } else if (circling) { //create circle

    if (firstPointC !== undefined) { //make line if a point is picked
      let secondPointC = element.getAttribute('data-coords').split(',').map(data=>parseInt(data));
      circleFunc(firstPointC[1], firstPointC[0], secondPointC[1], secondPointC[0]);

    }
  }
}

//function is run when a pixel is clicked
function divClick(element) {
  if (lining) {
    
    if (firstPoint === undefined) {
      firstPoint = element.getAttribute('data-coords').split(',').map(data=>parseInt(data));
    } else {
      let secondPoint = element.getAttribute('data-coords').split(',').map(data=>parseInt(data));
      line(firstPoint[1], firstPoint[0], secondPoint[1], secondPoint[0]);
      if (prevmode) {
        trimActionList();
      }
      actions.push(newlyLined);
      actionCounter++;
      firstPoint = undefined;
      newlyLined = [];
    }

  } else if (circling) {

    if (firstPointC === undefined) {
      firstPointC = element.getAttribute('data-coords').split(',').map(data=>parseInt(data));
    } else {
      let secondPointC = element.getAttribute('data-coords').split(',').map(data=>parseInt(data));
      circleFunc(firstPointC[1], firstPointC[0], secondPointC[1], secondPointC[0]);
      if (prevmode) {
        trimActionList();
      }
      actions.push(newlyCircled);
      actionCounter++;
      firstPointC = undefined;
      newlyCircled = [];
    }

  } else if (selecting) {
    changeColour(element.style.backgroundColor);

  } else if (filling) {
    fill(element);
  }
}

/* makes and displays the grid with the following layout:
<span><div></div><div></div></span<br>
<span><div></div><div></div></span

(each div is a pixel)*/ //   ------------------make a global matrix of these elements for undo/fill/line
function makeGrid(width, height) {
  //scale to the most constricted element so that all the boxes fit on the page (set the line height accordingly)
  let a = window.innerHeight/height;
  let b = (window.innerWidth-51)/width; //the 51 is the sidebar width
  let divSize = Math.min(a,b)-2;
  document.body.style.lineHeight = (Math.floor(divSize)+1).toString()+'px';

  let divSizeFinal = Math.floor(divSize).toString()+'px';
  
  //actually make and append the elements to the page
  for (let a=0; a<height; a++) {
    let newSpan = document.createElement('span');

    newSpan.classList.add('rowSpan'); //used for getting the spans


    for (let b=0; b<width; b++) {

      let newDiv = document.createElement('div');

      newDiv.style.height = newDiv.style.width = divSizeFinal;

      newDiv.setAttribute("onclick","divClick(this)");
      newDiv.setAttribute("onmouseenter","divHover(this)");
      newDiv.setAttribute("onmousedown","if(!lining){divHover(this, true)}");
      newDiv.setAttribute("data-coords", `${a},${b}`);
      
      //make divs on the right and bottom have a border
      if (b-width === -1)  newDiv.style.borderRight  = "solid gray 1px";
      if (a-height === -1) newDiv.style.borderBottom = "solid gray 1px";

      newDiv.classList.add('pixel'); //pixel class has extra formatting (see style.css)


      newSpan.appendChild(newDiv);

    }
    document.body.appendChild(newSpan);
    document.body.innerHTML += '<br>';
  }
  document.body.innerHTML += '<br>';

  //make sure sliders are updated
  let currentColour = getColour();
  currentColour = currentColour.concat(rgbToHsl(currentColour[0], currentColour[1], currentColour[2]));
  updateSliders(currentColour);


  let spans = document.getElementsByClassName('rowSpan');
  for (span of spans) {
    elementsMatrix.push(span.children);
  }
}

//input:element
//output: [r, g, b, a] (0-255 for each)
function getDivColour(div) {
  let unformatted = window.getComputedStyle(div, null).getPropertyValue('background-color');
  let spliced = unformatted.replace(/[()a-z]/g, '');
  let listed = spliced.split(',');
  if (listed.length == 3) {
    listed.push(255);
  } else {
    listed[3] = Math.round(parseFloat(listed[3])*255);
  }
  let numerified = listed.map(x=>parseInt(x));
  return numerified;
}

//goes through each element and returns a compatible list of colours
function getImageData() {
  let imageData = [];
  let spans = document.getElementsByClassName('rowSpan');

  for (span of spans) {
    let rowData = [];
    let children = span.children;

    for (div of children) {
      rowData.push(getDivColour(div));
    }

    imageData.push(rowData);
  }
  
  return imageData;
}

//called on for filling
function fill(div) {
  let divCoords = div.getAttribute('data-coords').split(',').map(data=>parseInt(data));

  let x = divCoords[0];
  let y = divCoords[1];

  let maxX = elementsMatrix.length-1;
  let maxY = elementsMatrix[0].length-1;

  let initialColour = getDivColour(elementsMatrix[x][y]).join('');
  elementsMatrix[x][y].style.backgroundColor = colour;
  let afterColour = getDivColour(elementsMatrix[x][y]).join('');

  let toFillList = [[elementsMatrix[x][y], x, y]];
  let filledList = [colour, [[x, y], initialColour]]; //used to append to actions for undo

  //debugger; //uncomment to see beautiful fill

  //fill algorithm
  if (initialColour !== afterColour) { //don't try filling in pixels to the same colour as the pixel that was clicked (causes infiniloop)
    for (; toFillList.length > 0; toFillList.shift()) { //while list has items, iterator: remove 1st element
      let div = toFillList[0];
      let x = div[1];
      let y = div[2];
  
      if ((x < maxX) && (getDivColour(elementsMatrix[x+1][y]).join('')==initialColour)) {
        filledList.push([[x+1,y], elementsMatrix[x+1][y].style.backgroundColor]);
        elementsMatrix[x+1][y].style.backgroundColor = colour;
        toFillList.push([elementsMatrix[x+1][y], x+1, y]);
      }
      if ((x > 0) && (getDivColour(elementsMatrix[x-1][y]).join('')==initialColour)) {
        filledList.push([[x-1,y], elementsMatrix[x-1][y].style.backgroundColor]);
        elementsMatrix[x-1][y].style.backgroundColor = colour;
        toFillList.push([elementsMatrix[x-1][y], x-1, y]);
      }
      if ((y < maxY) && (getDivColour(elementsMatrix[x][y+1]).join('')==initialColour)) {
        filledList.push([[x,y+1], elementsMatrix[x][y+1].style.backgroundColor]);
        elementsMatrix[x][y+1].style.backgroundColor = colour;
        toFillList.push([elementsMatrix[x][y+1], x, y+1]);
      }
      if ((y > 0) && (getDivColour(elementsMatrix[x][y-1]).join('')==initialColour)) {
        filledList.push([[x,y-1], elementsMatrix[x][y-1].style.backgroundColor]);
        elementsMatrix[x][y-1].style.backgroundColor = colour;
        toFillList.push([elementsMatrix[x][y-1], x, y-1]);
      }
    }
    if (prevmode) {
      trimActionList();
    }
    actions.push(filledList);
    actionCounter++;
  }
}

function line(x0, y0, x1, y1) {
  var dx = Math.abs(x1 - x0);
  var dy = Math.abs(y1 - y0);
  var sx = (x0 < x1) ? 1 : -1;
  var sy = (y0 < y1) ? 1 : -1;
  var err = dx - dy;

  newlyLined.splice(0,1);

  for (element of newlyLined) {
    elementsMatrix[element[0][0]][element[0][1]].style.backgroundColor = element[1];
  }

  newlyLined = [colour];

  while(true) {
    let element = elementsMatrix[y0][x0];
    newlyLined.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
    element.style.backgroundColor = colour; // Add to the list of filled elements
    
    if ((x0 === x1) && (y0 === y1)) break;
    var e2 = 2*err;
    if (e2 > -dy) { err -= dy; x0  += sx; }
    if (e2 < dx) { err += dx; y0  += sy; }
  }
}

function circleFunc(x1, y1, x2, y2) {
  let a = x1 - x2;
  let b = y1 - y2;
  let r = Math.round(Math.sqrt( a*a + b*b ));

  let x_centre = y1;
  let y_centre = x1;

	let x = r;
  let y = 0;

  let element;
  

  newlyCircled.splice(0,1);

  for (element of newlyCircled) {
    elementsMatrix[element[0][0]][element[0][1]].style.backgroundColor = element[1];
  }

  newlyCircled = [colour]; 

  //debugger;
  
  try {
    element = elementsMatrix[x_centre - x][y + y_centre];
    newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
    element.style.backgroundColor = colour; // Add to the list of filled elements
  } catch {}
	
	//When radius is zero only a single 
	//point be printed 
	if (r > 0) {
    
    try {
      element = elementsMatrix[x + x_centre][-y + y_centre];
      newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
      element.style.backgroundColor = colour; // Add to the list of filled elements
    } catch {}
    
    try {
      element = elementsMatrix[y + x_centre][x + y_centre];
      newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
      element.style.backgroundColor = colour; // Add to the list of filled elements
    } catch {}
    
    try {
      element = elementsMatrix[-y + x_centre][-x + y_centre];
      newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
      element.style.backgroundColor = colour; // Add to the list of filled elements
    } catch {}
  }
	
	//Initialising the value of P 
  let P = 1 - r ;
  

	while (x > y) { 
	
		y += 1;
		
		//Mid-point inside or on the perimeter 
		if (P <= 0) { 
			P = P + 2 * y + 1;
    }
		//Mid-point outside the perimeter 
		else {
			x -= 1;
			P = P + 2 * y - 2 * x + 1;
    }
		//All the perimeter points have 
		//already been printed 
		if (x < y) {
      break;
    }
		
		//Printing the generated point its reflection 
    //in the other octants after translation 
    try {
      element = elementsMatrix[x + x_centre][y + y_centre];
      newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
      element.style.backgroundColor = colour; // Add to the list of filled elements
    } catch {}

    try {
      element = elementsMatrix[-x + x_centre][y + y_centre];
      newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
      element.style.backgroundColor = colour; // Add to the list of filled elements
    } catch {}

    try {
      element = elementsMatrix[x + x_centre][-y + y_centre];
      newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
      element.style.backgroundColor = colour; // Add to the list of filled elements
    } catch {}

    try {
      element = elementsMatrix[-x + x_centre][-y + y_centre];
      newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
      element.style.backgroundColor = colour; // Add to the list of filled elements
    } catch {}
    
		
		//If the generated point on the line x = y then 
		//the perimeter points have already been printed 
		if (x != y) {
      
      try {
        element = elementsMatrix[y + x_centre][x + y_centre];
        newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
        element.style.backgroundColor = colour; // Add to the list of filled elements
      } catch {}

      try {
        element = elementsMatrix[-y + x_centre][x + y_centre];
        newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
        element.style.backgroundColor = colour; // Add to the list of filled elements
      } catch {}

      try {
        element = elementsMatrix[y + x_centre][-x + y_centre];
        newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
        element.style.backgroundColor = colour; // Add to the list of filled elements
      } catch {} 

      try {
        element = elementsMatrix[-y + x_centre][-x + y_centre];
        newlyCircled.push([element.getAttribute('data-coords').split(',').map(data=>parseInt(data)), element.style.backgroundColor]);
        element.style.backgroundColor = colour; // Add to the list of filled elements
      } catch {}
    }
  }
}


function trimActionList() {
  while (actions.length > actionCounter) {
    actions.pop();
  }
}

function handleFileSelect(event) {
  const reader = new FileReader()
  reader.onload = (event)=>useFileData(event.target.result);
  reader.readAsText(event.target.files[0])
}

function useFileData(data) {
  data = LZString.decompressFromUTF16(data);
  data = data.split('.');

  let metaData = data[0].split(',');
  document.getElementById('startWidth').value = metaData[0];
  document.getElementById('startHeight').value = metaData[1];
  start();

  let gridData = data[1].split(',');

  let spans = document.getElementsByClassName('rowSpan');

  let counter = 0;
  for (span of spans) {
    let children = span.children;

    for (div of children) {
      div.style.background = `rgba(${gridData[counter]},${gridData[counter+1]},${gridData[counter+2]},${gridData[counter+3]/255})`;
      counter += 4;
    } 
  }
}

//randomise(255, 255, 0, 20, 0, 255, 0, 1)
function randomise(rmin=0, rmax=255, gmin=0, gmax=255, bmin=0, bmax=255, amin=1, amax=1) { //dev tool

  colourator=(rmin, rmax, gmin, gmax, bmin, bmax, amin, amax)=>()=>`rgb(${num(rmin,rmax)},${num(gmin,gmax)},${num(bmin,bmax)}, ${decnum(amin,amax)})`;

  num=(min,max)=>Math.floor((Math.random()*(max-min))+min);

  decnum=(min,max)=>Math.floor(((Math.random()*(max-min))+min)*1000000)/1000000;

  var randomColour = colourator(rmin, rmax, gmin, gmax, bmin, bmax, amin, amax);

  let spans = document.getElementsByClassName('rowSpan');

  for (span of spans) {
    let children = span.children;

    for (div of children) {
      div.style.backgroundColor = randomColour();
    } 
  }
}





//-------------tools-------------\\



//when the save button is clicked and the pixel size is confirmed
function getImage() {
  document.getElementById('pixelSizePopup').style.display = 'none';
  let myImage = makeImage(settings[0],settings[1], parseInt(document.getElementById('pxsz').value), getImageData());
  document.body.appendChild(myImage);
}

//when the reset button is clicked
function reset() {

  let filledList = ['']; //to add to undo actions list

  if (confirm('Are you sure you want to reset all pixels?')) {
    for (div of document.getElementsByClassName('pixel')) {
      filledList.push([div.getAttribute('data-coords').split(',').map(data=>parseInt(data)), div.style.backgroundColor]);
      div.style.backgroundColor = '';
    }
  }

  if (prevmode) {
    trimActionList();
  }
  actions.push(filledList);
  actionCounter++;
}

//when the popup is confirmed
function start() {
  document.getElementById('sizePopup').style.display = 'none';

  settings = [document.getElementById('startWidth').value, document.getElementById('startHeight').value];

  makeGrid(settings[0],settings[1]);
}

function pen(button) {
  button.style.backgroundColor = 'white';

  document.getElementById('sampler').style.backgroundColor = '';
  selecting = false;

  document.getElementById('eraser').style.backgroundColor = '';
  colour = oldcol;

  document.getElementById('filler').style.backgroundColor = '';
  filling = false;

  document.getElementById('liner').style.backgroundColor = '';
  lining = false;

  document.getElementById('circler').style.backgroundColor = '';
  circling = false;
}

//when the sampler button is clicked
function sample(button) {
  document.getElementById('eraser').style.backgroundColor = '';
  colour = oldcol;

  document.getElementById('filler').style.backgroundColor = '';
  filling = false;

  document.getElementById('liner').style.backgroundColor = '';
  lining = false;

  document.getElementById('circler').style.backgroundColor = '';
  circling = false;

  document.getElementById('pen').style.backgroundColor = '';


  if (button.style.backgroundColor == 'white') {
    selecting = false;
    button.style.backgroundColor = '';
    document.getElementById('pen').style.backgroundColor = 'white';
  } else {
    colour = oldcol;
    selecting = true;
    button.style.backgroundColor = 'white';
  }
}

//when the eraser button is clicked
function erase(button) {
  document.getElementById('sampler').style.backgroundColor = '';
  selecting = false;

  document.getElementById('filler').style.backgroundColor = '';
  filling = false;

  document.getElementById('liner').style.backgroundColor = '';
  lining = false;

  document.getElementById('circler').style.backgroundColor = '';
  circling = false;

  document.getElementById('pen').style.backgroundColor = '';


  if (button.style.backgroundColor == 'white') {
    colour = oldcol;
    button.style.backgroundColor = '';
    document.getElementById('pen').style.backgroundColor = 'white';
  } else {
    oldcol = colour;
    colour = '';
    button.style.backgroundColor = 'white';
  }
}

//when the filler button is clicked
function filler(button) {
  document.getElementById('sampler').style.backgroundColor = '';
  selecting = false;

  document.getElementById('eraser').style.backgroundColor = '';
  colour = oldcol;

  document.getElementById('liner').style.backgroundColor = '';
  lining = false;

  document.getElementById('circler').style.backgroundColor = '';
  circling = false;

  document.getElementById('pen').style.backgroundColor = '';


  if (button.style.backgroundColor == 'white') {
    filling = false;
    button.style.backgroundColor = '';
    document.getElementById('pen').style.backgroundColor = 'white';
  } else {
    filling = true;
    button.style.backgroundColor = 'white';
  }
}

//when the colour button is clicked
function colourer(button) {
  if (button.style.backgroundColor == 'white') {
    button.style.backgroundColor = '';
    button.style.borderColor = colour;
    document.getElementById('colours').style.display = 'none';
  } else {
    changeColour(colour);
    button.style.backgroundColor = 'white';
    document.getElementById('colours').style.display = 'block';
  }
}

//when the line button is clicked
function liner(button) {
  document.getElementById('sampler').style.backgroundColor = '';
  selecting = false;

  document.getElementById('eraser').style.backgroundColor = '';
  colour = oldcol;

  document.getElementById('filler').style.backgroundColor = '';
  filling = false;

  document.getElementById('circler').style.backgroundColor = '';
  circling = false;

  document.getElementById('pen').style.backgroundColor = '';

  if (button.style.backgroundColor == 'white') {
    lining = false;
    button.style.backgroundColor = '';
    newlyLined = null;
    document.getElementById('pen').style.backgroundColor = 'white';

  } else {
    lining = true;
    button.style.backgroundColor = 'white';

    firstPoint = undefined;
    newlyLined = [];
  }
}

//when the line button is clicked
function circler(button) {
  document.getElementById('sampler').style.backgroundColor = '';
  selecting = false;

  document.getElementById('eraser').style.backgroundColor = '';
  colour = oldcol;

  document.getElementById('filler').style.backgroundColor = '';
  filling = false;

  document.getElementById('liner').style.backgroundColor = '';
  lining = false;

  document.getElementById('pen').style.backgroundColor = '';

  if (button.style.backgroundColor == 'white') {
    circling = false;
    button.style.backgroundColor = '';
    newlyCircled = null;
    document.getElementById('pen').style.backgroundColor = 'white';

  } else {
    circling = true;
    button.style.backgroundColor = 'white';

    firstPointC = undefined;
    newlyCircled = [];
  }
}

//when the arrow button is clicked
function toggleMenu(button) {
  if (menuHidden) {
    menuHidden = false;
    document.getElementById('menuparent').classList.remove('menuUp');
    button.classList.remove('buttonSpin1');
    document.getElementById('menuparent').classList.add('menuDown');
    button.classList.add('buttonSpin2');
  } else {
    menuHidden = true;
    document.getElementById('menuparent').classList.remove('menuDown');
    button.classList.remove('buttonSpin2');
    document.getElementById('menuparent').classList.add('menuUp');
    button.classList.add('buttonSpin1');
  }
}

function toggleView() {

  switch (view) {
    case 0:
      document.styleSheets[0].addRule('.pixel','border: none;');
      document.body.style.lineHeight = (parseInt(document.body.style.lineHeight.replace(/px/,''))-1).toString()+'px';
      
      var spans = document.getElementsByClassName('rowSpan');
      for (span of spans) {
        span.lastChild.style.borderRight = 'none';
      }
      for (span of spans[spans.length-1].children) {
        span.style.borderBottom = 'none';
      }

      view ++;
      break;
    
    case 1:
      document.styleSheets[0].addRule('.pixel:after','background: none;');
      view ++;
      break;
      
    case 2:
      document.styleSheets[0].addRule('.pixel','border-left: solid gray 1px;');
      document.styleSheets[0].addRule('.pixel','border-top: solid gray 1px;');
      document.body.style.lineHeight = (parseInt(document.body.style.lineHeight.replace(/px/,''))+1).toString()+'px';

      var spans = document.getElementsByClassName('rowSpan');
      for (span of spans) {
        span.lastChild.style.borderRight = 'solid gray 1px';
      }
      for (span of spans[spans.length-1].children) {
        span.style.borderBottom = 'solid gray 1px';
      }

      view ++;
      break;

    case 3:
      document.styleSheets[0].addRule('.pixel:after','background: url("../icons/dot.svg");');
      view = 0;
      break;
  }

}

function undo() {
  prevmode = true;

  if (actionCounter > 0) {
    actionCounter --;
  }

  let changedElements = [];

  let currentActions = actions[actionCounter].slice(1,actions[actionCounter].length);

  for (action of currentActions) {
    if (!changedElements.includes(action[0].toString())) {
      elementsMatrix[action[0][0]][action[0][1]].style.background = action[1];
      changedElements.push(action[0].toString());
    }
  }
}

function redo() {

  if (actionCounter < actions.length) {
    actionCounter ++;
  }
  if (actionCounter === actions.length-1) {
    prevmode = false;
  }

  let previousColour = actions[actionCounter-1][0];

  let currentActions = actions[actionCounter-1].slice(1,actions[actionCounter-1].length);

  for (action of currentActions) {
    elementsMatrix[action[0][0]][action[0][1]].style.background = previousColour;
  }
}


function exportAsFile() {
  var pom = document.createElement('a');

  let data = LZString.compressToUTF16(`${settings[0]},${settings[1]}.`+getImageData());

  pom.setAttribute('href', 'data:,' + data);
  
  pom.setAttribute('download', new Date().toISOString().split('T')[0]+'.pxart');

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  };
};


//confirm before leaving page
window.onbeforeunload = function (e) {
  e = e || window.event;
  // For IE and Firefox prior to version 4
  if (e) {
      e.returnValue = 'Sure?';
  }
  // For Safari
  return 'Sure?';
}


/*

tools to add:

duplicate area - i can't even tho uwu

*/