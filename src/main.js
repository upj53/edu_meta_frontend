import './app.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.js";
import App from './App.svelte';

const app = new App({
	target: document.getElementById('app'),
});

export default app;
