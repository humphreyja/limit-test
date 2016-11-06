import $ from "jquery";

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var curve1 = createObject(200, 30, 100, 30, 200, 90, 90, 100);
var curve2 = createObject(210, 35, 30, 30, 20, 10, 80, 70);

var curves = [curve1, curve2];
var drawing = false;
var currentNode = null

$(c).mousedown(function(e){
	var mX = e.offsetX;
  var mY = e.offsetY;
  var nearRes = nearObject(curves, mX, mY);
  if (nearRes == null) {
  	return;
  }

  currentNode = nearRes;
  drawing = true;
});

$(c).mouseup(function(e){
	drawing = false;
})

$(c).mousemove(function(e){
	if (drawing){
    var mX = e.offsetX;
    var mY = e.offsetY;
    ctx.clearRect(0, 0, c.width, c.height);

    for (var curveIdx in curves) {
    	if (curveIdx == currentNode.idx) {
      	updateBezier(curveIdx, currentNode.point, mX, mY);
      }else{
      	var curve = curves[curveIdx];
        redraw(curve);
      }
    }
  }
})

function updateBezier(idx, point, mX, mY) {
	var selectedNode = curves[idx];

  var sX = selectedNode.start.x;
  var sY = selectedNode.start.y;
  var c1X = selectedNode.context1.x;
  var c1Y = selectedNode.context1.y;
  var c2X = selectedNode.context2.x;
  var c2Y = selectedNode.context2.y;
  var endX = selectedNode.end.x;
  var endY = selectedNode.end.y;
  var updatedNode = null;
  switch(point) {
    case 'start':
      updatedNode = createObject(mX, mY, c1X, c1Y, c2X, c2Y, endX, endY)
      break;
    case 'context1':
      updatedNode = createObject(sX, sY, mX, mY, c2X, c2Y, endX, endY)
      break;
    case 'context2':
      updatedNode = createObject(sX, sY, c1X, c1Y, mX, mY, endX, endY)
      break;
    case 'end':
      updatedNode = createObject(sX, sY, c1X, c1Y, c2X, c2Y, mX, mY)
      break;
  }
  curves[idx] = updatedNode;
}

function redraw(bezier) {
	drawPath(bezier.start.x, bezier.start.y, bezier.context1.x, bezier.context1.y, bezier.context2.x, bezier.context2.y, bezier.end.x, bezier.end.y);
}

function createObject(startX, startY, c1X, c1Y, c2X, c2Y, endX, endY) {
  // Init with default path
  drawPath(startX, startY, c1X, c1Y, c2X, c2Y, endX, endY);

  return {
    start: {
      x: startX,
      y: startY
    },
    context1: {
      x: c1X,
      y: c1Y
    },
    context2: {
      x: c2X,
      y: c2Y
    },
    end: {
      x: endX,
      y: endY
    }
  };

}

function nearObject(curves, x, y) {

  for (var curveIdx in curves) {
  	var curve = curves[curveIdx];
    if (isClose(curve.start.x, x) && isClose(curve.start.y, y)) {
      return {curve: curve, point: 'start', idx: curveIdx};
    }else if (isClose(curve.context1.x, x) && isClose(curve.context1.y, y)) {
      return {curve: curve, point: 'context1', idx: curveIdx};
    }else if (isClose(curve.context2.x, x) && isClose(curve.context2.y, y)) {
      return {curve: curve, point: 'context2', idx: curveIdx};
    }else if (isClose(curve.end.x, x) && isClose(curve.end.y, y)) {
      return {curve: curve, point: 'end', idx: curveIdx};
    }
  }

  return null;
}


function isClose(point, mouse) {
  var padding = 5;
	if ((point >= (mouse - padding)) && (point <= (mouse + padding))) {
  	return true;
  }
  return false;
}


function drawPath(startX, startY, c1X, c1Y, c2X, c2Y, endX, endY) {
	ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(c1X, c1Y, c2X, c2Y, endX, endY);
  drawHandle(startX, startY, 10);
  drawHandle(c1X, c1Y, 10);
  drawHandle(c2X, c2Y, 10);
  drawHandle(endX, endY, 10);
  ctx.stroke();
}

function drawHandle(x, y, padding) {
  ctx.fillRect(x - padding / 2, y - padding / 2, padding, padding);
}
