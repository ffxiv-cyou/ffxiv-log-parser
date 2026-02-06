import { mount } from 'svelte'
import App from './App.svelte'

import "purecss/build/pure.css";
import "purecss/build/grids-responsive.css";

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
