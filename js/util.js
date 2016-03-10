/*
 Global helpers fns for geometry because math is hard

 Trigonometry refresher

       w
    _______
    |/ r  /
    |    /  cos(r) = w/h | h = w/cos(r)
 h  |   /
    |  /
    | /
    |/

 */

// Radians / degrees conversion
function deg2rad( d ) { return d * Math.PI / 180 }
function rad2deg( r ) { return r / Math.PI * 180 }


function getLinesFromStrip (strip) {
  var results = {};
  results.bottomLine = { m: Math.tan(strip.rotation) , b: strip.offset };
  results.topLine = { m: Math.tan(strip.rotation), b: (strip.offset + strip.yHeight) };
  return results;
}

/*
  Helper method to find the point of intersection between two lines
  within a bounding rectangle, if it exists.
   - lines are defined geometrically as a slope (m) and initial offset (b)
   - returns either the {x,y} point of intersection or false
*/
function getLineIntersection(lineA, lineB, topLeft, bottomRight){
  var iX, iY, sign,
      dM = lineA.m - lineB.m,
      dO = lineA.b - lineB.b,
      minX = topLeft.x,
      minY = topLeft.y,
      maxX = bottomRight.x,
      maxY = bottomRight.y;
  try {
    sign = dO * dM > 0 ? -1 : 1;
    iX = Math.abs(dO / dM) * sign;
    iY = lineA.m * iX + lineB.b;

    if ((iX > minX && iX < maxX)
        && (iY > minY && iY < maxY)){
      return { x: iX, y: iY};

    }

  } catch (e) {}
  // divide by 0 = no intersection
  return false;
}

// Extend the JS array to have a super-sweet method that returns a random index
Array.prototype.getRandomIndex = function() {
  return Math.floor(Math.random() * this.length);
};


/*
  Helper methods to populate the board with pretty good strip coverage
*/

var MIN_ANGLE = 20,
    DENSITY = 0.25;

/*
 Takes the width of the object and the canvas to be covered,
 returns an array of {x, y} coordinates to be evaluated by our coverage routine
 */
function generateFillPoints(unitWidth, canvasObj) {
  var u = unitWidth * DENSITY;
  var points = [],
      x = unitWidth,
      y = u;
  while (y < canvasObj.height - u * 2) {
    while (x < canvasObj.width - u / 2) {
      points.push({'x': x, 'y': y + (x % 2 * u)});
      x += 2 * u;
    }
    x = u / 2;
    y += u;
  }
  return points;
}

/*
 Kind of a magic function tied to our strategy for filling space with a line.
 */
function newStripThroughPoint(image, p) {
  var sign = Math.random() > .7 ? -1 : 1;
  var angle = Math.round(Math.random() * MIN_ANGLE) * sign;
  var offset = -1 * (Math.round(Math.tan(deg2rad(angle)) * p.x)) + p.y;
  return new Strip(image, angle, offset);
}

/*
  Make sure there are easy strips on the top and bottom
*/
function topAndBottomStrips(image){
  var topStrip = new Strip(image, 0 - Math.random() * 4, 0);
  var bottomStrip = new Strip(image, Math.random() * 4, GLOBAL_HEIGHT - image.height);
  return [topStrip, bottomStrip];
}

/*
 Function to take a given canvas and wrapping image and cover it
 */
function populateStrips(canvasObj, image) {
  // Create a map of points to sample
  var points = generateFillPoints(image.height, canvasObj),
      i, strip, p;

  // Heuristics: generate an easy to peel top & bottom strip
  Wrapper.strips = topAndBottomStrips(image);

  // Randomly sample points and remove them
  while (points.length > 0) {
    i = points.getRandomIndex();
    p = points.splice(i, 1)[0];

    // If the point isn't wrapped, wrap it with a new strip
    if (Wrapper.getClickedStripIndex(p) < 0) {

      strip = newStripThroughPoint(image, p);
      Wrapper.strips.push(strip);
      if (GLOBAL_DEBUG){
        canvasObj.drawStrip(strip);
        //debugger;
      }

    }
  }
  console.log("Total strips:", Wrapper.strips.length);
  return Wrapper.strips;
}

/*
  Helper if you get super fancy with your canvas
 */
function _clipCanvas(c, tl, tr, br, bl, debug) {
  c.beginPath();
  c.moveTo(tl.x, tl.y);
  c.lineTo(tr.x, tr.y);
  c.lineTo(br.x, br.y);
  c.lineTo(bl.x, bl.y);
  if (debug) {
    c.fillStyle = 'rgba(255,0,255,.5)';
    c.fill();
  } else {
    c.clip();
  }
}