import type { Component } from 'solid-js';

import styles from './App.module.css';
import TextArea from './TextArea';
import TransactionDiagram from './TransactionDiagram';
import { ErrorBoundary } from 'solid-js';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <h1>Bitcoin Transaction Visualizer</h1>
      <p>
        Inspired by the laminated reference sheet you get in Jimmy Song's
        Programming Bitcoin class
      </p>
      <TextArea></TextArea>
      <ErrorBoundary fallback={<p>Oops, bad transaction</p>}>
        <TransactionDiagram></TransactionDiagram>
      </ErrorBoundary>
    </div>
  );
};

export default App;
