// filepath: src/utils/transpose.js

// Chromatic scale arrays
const sharpScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatScale = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Get index of a note in the scale
function getNoteIndex(note, useFlats = false) {
  const scale = useFlats ? flatScale : sharpScale;
  return scale.indexOf(note);
}

// Check if we should use flats based on the original key
function shouldUseFlats(key) {
  const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];
  return flatKeys.includes(key);
}

// Transpose a single note
function transposeNote(note, semitones, useFlats) {
  const scale = useFlats ? flatScale : sharpScale;
  let noteIndex = scale.indexOf(note);
  
  if (noteIndex === -1) {
    // Try the other scale
    const otherScale = useFlats ? sharpScale : flatScale;
    noteIndex = otherScale.indexOf(note);
    if (noteIndex === -1) return note;
  }
  
  // Handle wrap-around
  let newIndex = (noteIndex + semitones) % 12;
  if (newIndex < 0) newIndex += 12;
  
  return scale[newIndex];
}

// Parse and transpose a chord
function transposeChord(chord, semitones) {
  if (!chord || semitones === 0) return chord;
  
  // Check if original uses flats
  const useFlats = shouldUseFlats(chord);
  
  // Match chord pattern: root + quality + optional bass
  // Examples: C, Am, G7, Cmaj7, Dm7, Gsus4, Cadd9, C/E
  const chordRegex = /^([A-G][b#]?)(.*?)(\/([A-G][b#]?))?$/;
  const match = chord.match(chordRegex);
  
  if (!match) return chord;
  
  const [, root, quality, , bass] = match;
  
  // Transpose root
  const newRoot = transposeNote(root, semitones, useFlats);
  
  // Transpose bass if exists
  const newBass = bass ? transposeNote(bass, semitones, useFlats) : null;
  
  // Reconstruct chord
  let newChord = newRoot + quality;
  if (newBass) {
    newChord += '/' + newBass;
  }
  
  return newChord;
}

// Main transpose function
export function transposeChords(chordChart, semitones) {
  if (!chordChart || semitones === 0) return chordChart;
  
  // Split into lines and process each
  const lines = chordChart.split('\n');
  const transposedLines = lines.map(line => {
    // Skip section headers like "Verse:", "Chorus:", etc.
    if (/^(Intro|Verse|Pre-Chorus|Chorus|Bridge|Instrumental|Ending|Tag|Outro):?\s*$/i.test(line)) {
      return line;
    }
    
    // Find all chords in the line
    // Chord pattern: uppercase letter optionally followed by # or b, then quality, optionally with bass
    const chordPattern = /([A-G](?:b|#)?(?:m|maj|min|sus|add|dim|aug|\d+)*(?:\/\w+)?)/g;
    
    return line.replace(chordPattern, (match) => {
      return transposeChord(match, semitones);
    });
  });
  
  return transposedLines.join('\n');
}

// Get all available keys
export function getKeys() {
  return sharpScale;
}

// Get key after transposition
export function getTransposedKey(originalKey, semitones) {
  if (!originalKey) return originalKey;
  const useFlats = shouldUseFlats(originalKey);
  return transposeNote(originalKey, semitones, useFlats);
}