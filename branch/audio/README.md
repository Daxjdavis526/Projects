# audio/

Put a file named `track.mp3` (or `track.wav`) in this folder and BRANCH will
play it instead of its built-in generated music. It is picked up automatically
at startup — no configuration, no timestamps.

The analysis is fully live, so any track works: the visuals derive kicks,
builds and drops from the spectrum itself.

You can also load a file at any time without putting it here — use the **Load**
button in the control bar, press `L`, or drag the file onto the window.

Note: the automatic pickup needs the page served over http:// (see the README);
loading from `file://` is blocked by the browser, so use the Load button there.
