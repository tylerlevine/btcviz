import type { Component } from 'solid-js';

import styles from './App.module.css';
import TextArea from './TextArea';
import TransactionDiagram from './TransactionDiagram';
import { ErrorBoundary } from 'solid-js';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <div class={styles.header}>
        <div class={styles.measure}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <h1>Bitcoin Transaction Visualizer</h1>
        <p>
          Inspired by the laminated reference sheet from Jimmy Song's
          Programming Bitcoin class
        </p>
        <TextArea></TextArea>
        <div class={styles.measure}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <ErrorBoundary fallback={<p>Oops, bad transaction</p>}>
        <TransactionDiagram></TransactionDiagram>
      </ErrorBoundary>
    </div>
  );
};

export default App;
