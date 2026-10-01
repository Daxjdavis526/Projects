/* REDLINE — entry point. */
import { App } from './ui/app.js';

const app = new App(document.getElementById('app'));
// exposed for debugging from the console and for the headless screenshot script
window.redline = app;
