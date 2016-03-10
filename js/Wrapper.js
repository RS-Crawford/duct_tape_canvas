/*
 Wrapper is the big cheese. It is the only object the consumer needs to interact with.
 It is responsible for
 - global state / the list of strips in the world
 - bindings to mouse events
 - routines to handle initial wrapping of element
*/
var Wrapper = (function () {

  // The Wrapper object to be returned by the anonymous function
  var _w = {
    // Z-index ordered array of strips, highest to lowest
    strips: [],

    // Container for canvas context
    board: new StripCanvas(),


    init: function (opts) {
      var containerElem = document.getElementById(opts.containerId),
          canvasElem = document.getElementById(opts.boardId);

      this.board.init(canvasElem, containerElem);

      this.strips = populateStrips(this.board, opts.wrapImage);
      this.redraw();

      canvasElem.addEventListener('mousedown', function (e) {
        Wrapper.evalClick({ 'x': e.clientX, 'y': e.clientY});
      });

    },

    redraw: function(){
      this.board.clear();
      for(var i = 0; i < this.strips.length; i++){
        this.board.drawStrip(this.strips[i]);
      }
    },


    /*
      Finds the first strip object a click interacts with
       - this.strips is a depth sorted array of the strips on the board
       - strip[0] is the lowest strip in the pile
       - returns -1 if the click doesn't collide with any strips
       - returns the index of the first strip at the coordinates if there's a collision
    */
    getClickedStripIndex: function (coord) {
      var l = this.strips.length - 1,
          strip;

      // Search the strips from top down until a collision is detected
      for (l; l >= 0; l--) {
        strip = this.strips[l];
        if (strip.contains(coord)) {
          return l;
        }
      }
      return -1;
    },

    /*
     -------------------------------------------------------------------------------------
     @Todo C: devise a strategy to see if strips overlap
     -------------------------------------------------------------------------------------
     Complete the strip.overlaps method then take advantage of the depth-sorted
     strips array to see if the strip clicked is covered by any others
      - a method that returns true or false will work for todo D
      - you'll need the full set of overlapping strips for todo E
    */
    getOverlappingStripsIndices: function (index) {
      // initialize the array of overlapping indices, if any
      var overlaps = [],
          strips = this.strips,
          l = strips.length-1,
          clickedStrip = strips[index];

      for ( l; l >= 0; l-- ) {
        if ( l !== index ) {
          if ( clickedStrip.overlaps(strips[l]) && _stripIsAbove(l, index) ) {
            overlaps.push(l);
          }
        }
      }

      function _stripIsAbove (indexToCheck, indexClicked) {
        return indexToCheck > indexClicked;
      }

      return overlaps;
    },


    /*
     Listener to get the initial type of mouse interaction and set state
     */
    evalClick: function (coord) {
      // Get the array index of the highest strip the click interacts with
      var clickedIndex = this.getClickedStripIndex(coord),
          strips = this.strips,
          wrapper = this;

      // No strip at the given click
      if (clickedIndex < 0){
        return;
      } else if(GLOBAL_DEBUG) {
        console.log("click at coord ", coord, " is on strip at index ", clickedIndex);
      }

      /*
        This won't work until you complete the strip.overlaps todo
        and the Wrapper.getOverlappingStrips todo
      */
      var overlappingStripIndices = wrapper.getOverlappingStripsIndices(clickedIndex),
          overlapLength = overlappingStripIndices.length;

      /*
       -------------------------------------------------------------------------------------
       @Todo D: make the board interactive
       -------------------------------------------------------------------------------------
       If you complete the strip.overlaps method, you can easily check to see if the
       strip clicked is the highest strip in the stack.
       - If the user clicks a strip that isn't covered by any others, remove it
         and redraw the board
       */

      if ( !overlapLength ) {
        wrapper.removeStripByIndex(clickedIndex);
      // @Todo E
      } else if ( overlapLength ) {
        wrapper.makeStripsFeedbackColor(overlappingStripIndices);
      }

      /*
       -------------------------------------------------------------------------------------
       @Todo E: provide the user with validation feedback
       -------------------------------------------------------------------------------------
       - If the user clicks a strip that's covered by another strip, redraw the overlapping
       strips with a color indicating they're obstructing the first strip
      */
    },

    removeStripByIndex: function (index) {
      var wrapper = this,
          strips = wrapper.strips;

      strips.splice(index, 1);
      wrapper.redraw();
    },

    makeStripsFeedbackColor: function (indicesArr) {
      var wrapper = this,
          strips = wrapper.strips,
          feedbackColor = '#ff0000'; // red
      
      indicesArr.forEach(function (index) {
        strips[index].color = feedbackColor;
      });

      wrapper.redraw();
    }
  };

  return _w;
})();

