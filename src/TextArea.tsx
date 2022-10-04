import { Component, createEffect, createSignal, Show } from 'solid-js';
import { setHex } from './Hex';
import styles from './TransactionDiagram.module.css';

const TextArea: Component = () => {
  const [clicked, setClicked] = createSignal(false);
  const [text, setText] = createSignal('Paste a transaction hex here');
  const [validHex, setValidHex] = createSignal(false);
  createEffect(() => {
    if (!clicked()) return;
    console.debug('textarea first clicked');
    setText('');
  });
  createEffect(() => {
    if (!clicked()) return;
    const t = text();
    const isValidHex = /^([a-f0-9]{2})+$/i.test(t);
    console.debug(`checking "${t}" for valid hex:`, isValidHex);
    setValidHex(isValidHex);
    if (isValidHex) {
      setHex(t);
    }
  });
  return (
    <>
      <textarea
        class={styles.txInputArea}
        onClick={() => setClicked(true)}
        onInput={(e) => {
          if (!(e.target instanceof HTMLTextAreaElement)) return;
          setText(e.target.value);
        }}
      >
        {text()}
      </textarea>
      <Show when={clicked() && !validHex() && text() !== ''}>
        <p>Transaction Hex is invalid!</p>
      </Show>
    </>
  );
};

export default TextArea;
