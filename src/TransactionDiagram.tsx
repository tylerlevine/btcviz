import type { Component } from 'solid-js';
import { createEffect, createSignal, For, JSX, Show } from 'solid-js';
import { hex } from './Hex';
import styles from './TransactionDiagram.module.css';

import { Transaction } from '@bitgo/bitcoinjs-lib';
import { AnnotatedTransaction, Annotation } from './AnnotatedTransaction';

const BYTES_PER_ROW = 16;

function InfoTable({ tx }: { tx: Transaction }) {
  return (
    <>
      <p>
        <span class={styles.code}>{tx.getId()}</span>
      </p>
      <table class={styles.txInfoTable}>
        <tbody>
          <tr>
            <td>Size (Bytes)</td>
            <td class={styles.code}>{tx.byteLength()}</td>
          </tr>
          <tr>
            <td>Size (VBytes)</td>
            <td class={styles.code}>{tx.virtualSize()}</td>
          </tr>
          <tr>
            <td>Size (Weight)</td>
            <td class={styles.code}>{tx.weight()}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function getClassForAnnotation(annotation: Annotation) {
  switch (annotation) {
    case 'version':
      return styles.version;
    case 'segwitFlag':
      return styles.segwitFlag;
    case 'segwitMarker':
      return styles.segwitMarker;
    case 'vinLen':
      return styles.vinLen;
    case 'prevHash':
      return styles.prevHash;
    case 'index':
      return styles.index;
    case 'scriptSig':
      return styles.scriptSig;
    case 'sequence':
      return styles.sequence;
    case 'voutLen':
      return styles.voutLen;
    case 'value':
      return styles.value;
    case 'scriptPubKeyLen':
      return styles.scriptPubKeyLen;
    case 'scriptPubKey':
      return styles.scriptPubKey;
    case 'programLen':
      return styles.programLen;
    case 'programElementLen':
      return styles.programElementLen;
    case 'programElement':
      return styles.programElement;
    case 'locktime':
      return styles.locktime;
  }
}

function Byte({
  byte,
  index,
  tx,
}: {
  byte: string;
  index: number;
  tx: AnnotatedTransaction;
}) {
  function mouseOverByte(e: Event) {
    if (!(e.target instanceof HTMLTableCellElement)) return;
    console.log(index, byte, JSON.stringify(tx.getAnnotationForByte(index)));
  }
  function computeByteClass() {
    const classes = [styles.code];
    try {
      const annotations = tx.getAnnotationForByte(index).annotations;
      for (const a of annotations) {
        const cls = getClassForAnnotation(a);
        if (cls) {
          classes.push(cls);
        }
      }
    } catch (e) {}
    return classes.join(' ');
  }
  return (
    <td
      class={computeByteClass()}
      id={`byte-${index}`}
      onMouseOver={mouseOverByte}
    >
      {byte}
    </td>
  );
}

function DataTable({ tx }: { tx: AnnotatedTransaction }) {
  const matchRegex = new RegExp(`.{1,${BYTES_PER_ROW * 2}}`, 'g');
  return (
    <table class={styles.txDataTable}>
      <tbody>
        <For each={tx.tx.toHex().match(matchRegex)}>
          {(chunk, row) => {
            return (
              <tr>
                <For each={chunk.match(/.{1,2}/g)}>
                  {(byte, col) => {
                    return (
                      <Byte
                        byte={byte}
                        index={row() * BYTES_PER_ROW + col()}
                        tx={tx}
                      ></Byte>
                    );
                  }}
                </For>
              </tr>
            );
          }}
        </For>
      </tbody>
    </table>
  );
}

const TransactionDiagram: Component = () => {
  const [tx, setTx] = createSignal<Transaction>();
  createEffect(() => {
    const h = hex();
    if (!h) return;
    try {
      const t = Transaction.fromHex(h);
      console.log('tx hex:', h);
      console.dir(t);
      setTx(t);
      return t;
    } catch (e) {
      console.error('could not parse tx');
    }
  });
  return (
    <Show when={tx() !== undefined}>
      <InfoTable tx={tx()!}></InfoTable>
      <p></p>
      <DataTable tx={new AnnotatedTransaction(tx()!)}></DataTable>
    </Show>
  );
};

export default TransactionDiagram;
