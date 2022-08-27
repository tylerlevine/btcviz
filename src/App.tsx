import type { Component } from 'solid-js';

import styles from './App.module.css';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <h1>Bitcoin Transaction Visualizer</h1>
      <p>Inspired by the laminated reference sheet you get in Jimmy Song's Programming Bitcoin class</p>
      <textarea>Paste a transaction hex here</textarea>
    </div>
  );
};

export default App;
