import $ from "jquery";

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var curve1 = createObject(200, 30, 100, 30, 200, 90, 90, 100, false);
var curve2 = createObject(210, 35, 30, 30, 20, 10, 80, 70, false);

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
  editingBezier(nearRes.idx);
});

$(c).mouseup(function(e){
	drawing = false;
})

$(c).mousemove(function(e){
  var mX = e.offsetX;
  var mY = e.offsetY;
  var nearRes = nearObject(curves, mX, mY);
  if (nearRes != null) {
  	$(c).css("cursor", "crosshair");
  }else{
    $(c).css("cursor", "auto");
  }

	if (drawing){

    ctx.clearRect(0, 0, c.width, c.height);

    for (var curveIdx in curves) {
    	if (curveIdx == currentNode.idx) {
      	updateBezier(curveIdx, currentNode.point, mX, mY);
      }else{
      	var curve = curves[curveIdx];
        redraw(curve, false);
      }
    }
  }
});

function finishEditingBezier() {
  ctx.clearRect(0, 0, c.width, c.height);

  for (var curveIdx in curves) {
    var curve = curves[curveIdx];
    redraw(curve, false);
  }
}

function editingBezier(idx) {
  ctx.clearRect(0, 0, c.width, c.height);

  for (var curveIdx in curves) {
    if (curveIdx == idx) {
      hoverBezier(curveIdx, true);
    }else{
      var curve = curves[curveIdx];
      redraw(curve, false);
    }
  }
}

function hoverBezier(idx, state) {
  var selectedNode = curves[idx];
  var sX = selectedNode.start.x;
  var sY = selectedNode.start.y;
  var c1X = selectedNode.context1.x;
  var c1Y = selectedNode.context1.y;
  var c2X = selectedNode.context2.x;
  var c2Y = selectedNode.context2.y;
  var endX = selectedNode.end.x;
  var endY = selectedNode.end.y;
  createObject(sX, sY, c1X, c1Y, c2X, c2Y, endX, endY, state)
}

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
      var x_diff = c1X - sX;
      var y_diff = c1Y - sY;
      updatedNode = createObject(mX, mY, mX + x_diff, mY + y_diff, c2X, c2Y, endX, endY, true)
      break;
    case 'context1':
      updatedNode = createObject(sX, sY, mX, mY, c2X, c2Y, endX, endY, true)
      break;
    case 'context2':
      updatedNode = createObject(sX, sY, c1X, c1Y, mX, mY, endX, endY, true)
      break;
    case 'end':
      var x_diff = c2X - endX;
      var y_diff = c2Y - endY;
      updatedNode = createObject(sX, sY, c1X, c1Y, mX + x_diff, mY + y_diff, mX, mY, true)
      break;
  }
  curves[idx] = updatedNode;
}

function redraw(bezier, showDetails) {
	drawPath(bezier.start.x, bezier.start.y, bezier.context1.x, bezier.context1.y, bezier.context2.x, bezier.context2.y, bezier.end.x, bezier.end.y, showDetails);
}

function createObject(startX, startY, c1X, c1Y, c2X, c2Y, endX, endY, showDetails) {
  // Init with default path
  drawPath(startX, startY, c1X, c1Y, c2X, c2Y, endX, endY, showDetails);

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


function drawPath(startX, startY, c1X, c1Y, c2X, c2Y, endX, endY, showDetails) {
	ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(c1X, c1Y, c2X, c2Y, endX, endY);
  ctx.strokeStyle = '#000';
  ctx.stroke();


  if (showDetails) {
    drawHandleToContext(c1X, c1Y, startX, startY);
    drawHandleToContext(c2X, c2Y, endX, endY);
    drawContext(c1X, c1Y, 5);
    drawContext(c2X, c2Y, 5);
    drawHandle(startX, startY, 10);
    drawHandle(endX, endY, 10);
  }

}

function drawContext(x, y, padding) {
	ctx.beginPath();
  ctx.arc(x, y, padding, 0,2*Math.PI);
  ctx.strokeStyle = '#2795ee';
  ctx.fillStyle = '#2795ee';
  ctx.fill();
  ctx.stroke();
}

function drawHandleToContext(x, y, oX, oY) {
  ctx.beginPath();
  ctx.moveTo(oX, oY);
	ctx.lineTo(x, y);
  ctx.strokeStyle = '#2795ee';
  ctx.stroke();
}

function drawHandle(x, y, padding) {
	ctx.beginPath();
  ctx.rect(x - padding / 2, y - padding / 2, padding, padding);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.stroke();
}
