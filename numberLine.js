let maxHeight = 64.0;

export function numberLine(width) {
    let lineGroup = new Konva.Group();

    let strokeWidth = 2.0;
    let strokeColor = 'black';

    var baseLine = new Konva.Line({
        points: [0, 0, width, 0],
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        opacity: 1.0,
        listening: false
      });

    lineGroup.add(baseLine);

    for (let i = 0; i <= 16; i++) {
        strokeColor = 'black';
        let x = i * width/16;
        let height = 10.0;
        if (i % 4 == 0) {
            height *= 4;
            strokeColor = 'green';
        } else if (i % 2 == 0) {
            height *= 2;
        }
        let hatchLine = new Konva.Line({
            points: [x, 0-height/2, x, 0+height/2],
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            opacity: 1.0,
            listening: false
          });
        lineGroup.add(hatchLine);

        let valueMarks = ["0", "1/16", "1/8", "3/16", "1/4"]
        valueMarks[8] = "1/2";
        valueMarks[12] = "3/4";
        valueMarks[16] = "1";

        
        let fontSizes = [16, 12, 14, 12];
        let fontSize = i < 4 ? fontSizes[i] : fontSizes[0];

        let size = 38;
        let y = 0 + height/2 + 8;
        if (i % 4 == 0 || i < 4)  {
            let valueText = new Konva.Text({
                x: x - size/2,
                y: y,
                text: valueMarks[i],
                fontSize: fontSize,
                fill: 'black',
                width: size,
                height: size,
                align: 'center',
                verticalAlign: 'middle'
              });
            lineGroup.add(valueText);
        }
    }

    return lineGroup;
}

export function drawLinePattern(targetGroup, pattern, width, noteColors, scale, semitones) {
    targetGroup.destroyChildren()
  
    for (var i = 0; i < pattern.value.length; i++) {
  
      var note = pattern.value[i];
      var amplitude = pattern.amplitude[i] || 0;
      if (note == '-' && i % 2 == 0) {

      } else if (noteColors.hasOwnProperty(note)) {
        var noteColor = noteColors.getColor(note, amplitude);
        if (note.length > 1) {
          var duration = pattern.duration[i] || 1;
          var noteNode = createHarmonicNote(i, noteColor, note, scale, semitones, width, duration);
          // var noteNode = createHarmonicNote(i, duration, noteColor, note, patternOriginX, patternOriginY, radius)
        } else {
          var noteNode = createNote(i, noteColor, width, amplitude)
        }
        targetGroup.add(noteNode)
      }
    }

}

export function drawRhythmLinePatternTop(targetGroup, pattern, width, noteColors) {
  targetGroup.destroyChildren()
  drawRhythmLinePattern(targetGroup, pattern, width, noteColors, 1);
}

export function drawRhythmLinePatternBottom(targetGroup, pattern, width, noteColors) {
  drawRhythmLinePattern(targetGroup, pattern, width, noteColors, -1);
}

function drawRhythmLinePattern(targetGroup, pattern, width, noteColors, direction) {
  for (var i = 0; i < pattern.value.length; i++) {

    var note = pattern.value[i];
    var amplitude = pattern.amplitude[i] || 0;
    if (note == '-' && i % 2 == 0) {

    } else if (noteColors.hasOwnProperty(note)) {
      var noteColor = noteColors.getColor(note, amplitude);
      var noteNode = createNote(i, noteColor, width, amplitude, direction)

      targetGroup.add(noteNode)
    }
  }
}

export function drawMelodicLinePattern(targetGroup, pattern, width, noteColors, scale, semitones) {
  targetGroup.destroyChildren()
  
  for (var i = 0; i < pattern.value.length; i++) {
    var note = pattern.value[i];
    var amplitude = pattern.amplitude[i] || 0;
    if (note == '-' && i % 2 == 0) {

    } else if (noteColors.hasOwnProperty(note)) {
      var noteColor = noteColors.getColor(note, amplitude);
      var duration = pattern.duration[i] || 1;
      var noteNode = createMelodicNote(i, noteColor, note, scale, semitones, width, duration);

      targetGroup.add(noteNode)
    }
  }
}



function createMelodicNote(step, color, note, scale, semitones, width, duration) {
  let group = new Konva.Group()

  let stepWidth = width/32;
  let x = step * stepWidth;

  let segmentWidth = step % 2 == 0 ? width/16 : width/32;
  let noteWidth = Math.pow(2, duration-1) * segmentWidth;
  noteWidth = Math.min(noteWidth, width - x);

  let scaleDegree = scale.indexOf(note);
  let noteHeight = sizeFor(scaleDegree, semitones, maxHeight);

  var note = new Konva.Rect({
      x: x,
      y: 0 - noteHeight,
      width: noteWidth,
      height: noteHeight,
      fill: color,
      stroke: 'rgba(255,255,255,0.5)',
      strokeWidth: 1,
      listening: false
  });
  group.add(note);

  for (var i = 0; i <= scaleDegree; i++) {
    let lower = i == 0 ? 0 : sizeFor(i-1, semitones, maxHeight);;
    let upper = lower + incrementalSizeFor(i, semitones, maxHeight);
    let line = new Konva.Rect({
      x: x,
      y: 0 - upper,
      width: noteWidth,
      height: upper - lower,
      fill: color,
      stroke: 'rgba(255,255,255,0.5)',
      strokeWidth: 1,
      listening: false
    });
    group.add(line);
  }

  return group
}

function sizeFor(index, semitones, height) {
  var semitonesWithin = semitones.slice(0, index + 1).reduce(function(acc, val) { return acc + val; }, 0)
  var semitonesTotal = semitones.reduce(function(acc, val) { return acc + val; }, 0);
  var percent = semitonesWithin / semitonesTotal;
  var size = height * percent;
  return size;
}

function incrementalSizeFor(index, semitones, height) {
  var semitonesWithin = semitones[index]
  var semitonesTotal = semitones.reduce(function(acc, val) { return acc + val; }, 0);
  var percent = semitonesWithin / semitonesTotal;
  var size = height * percent;
  return size;
}

function createNote(step, color, width, amplitude, direction=-1) {
    let stepWidth = width/32;
    let x = step * stepWidth;

    let noteWidth = step % 2 == 0 ? width/16 : width/32;
    let noteHeight = 20.0;

    let y = direction > 0 ? 0 - noteHeight : 0;
  
    var note = new Konva.Rect({
        x: x,
        y: y,
        width: noteWidth,
        height: noteHeight,
        fill: color,
        stroke: 'rgba(255,255,255,0.5)',
        strokeWidth: 1,
        listening: false
    });

    return note
}