import type { Accessor, Component, Setter, Signal } from 'solid-js';
import { createEffect, createSignal, For, JSX, Show } from 'solid-js';
import { hex } from './Hex';
import styles from './TransactionDiagram.module.css';

import { Transaction } from '@bitgo/bitcoinjs-lib';
import { AnnotatedTransaction } from './AnnotatedTransaction';
import { DimensionsTable } from './dimensions';
import { InfoTable } from './info';
import { getClassForAnnotation } from './colorscheme';

const BYTES_PER_ROW = 16;

function Byte({
  byte,
  index,
  currentlySelectedIndex,
  tx,
  onMouseOver,
}: {
  byte: string;
  index: number;
  currentlySelectedIndex: Accessor<number | undefined>;
  tx: AnnotatedTransaction;
  onMouseOver: (e: Event) => void;
}) {
  const [classes, setClasses] = createSignal<string>();

  createEffect(() => {
    const classes = [styles.code];
    try {
      const currentIndex = currentlySelectedIndex();
      if (index === undefined) return;
      const annotation = tx.getAnnotationForByte(index);
      for (const a of annotation.annotations) {
        const cls = getClassForAnnotation(a);
        if (cls) {
          classes.push(cls);
        }
      }
      if (currentIndex !== undefined) {
        const selectedAnnotation = tx.getAnnotationForByte(currentIndex);
        if (index === currentIndex) {
          classes.push(styles.selectedByte);
          console.log('selected byte is', index);
        }
        if (
          selectedAnnotation.start <= index &&
          index < selectedAnnotation.end
        ) {
          classes.push(styles.selectedRange);
        }
      }
    } catch (e) {}
    setClasses(classes.join(' '));
  });
  return (
    <td class={classes()} id={`byte-${index}`} onMouseOver={onMouseOver}>
      {byte}
    </td>
  );
}

function ByteMarker({ row }: { row: number }) {
  const classes = [styles.code, styles.byteMarker].join(' ');
  return (
    <td class={classes} id={`byte-marker-row-${row}`}>
      <span>{'0x' + (row * 16).toString(16).padStart(4, '0')}</span>
    </td>
  );
}

function DataTable({
  tx,
  indexAccessor,
  setIndex,
}: {
  tx: AnnotatedTransaction;
  indexAccessor: Accessor<number | undefined>;
  setIndex: Setter<number | undefined>;
}) {
  const matchRegex = new RegExp(`.{1,${BYTES_PER_ROW * 2}}`, 'g');
  function getMouseOverFn(byte: string, index: number) {
    return function (e: Event) {
      if (!(e.target instanceof HTMLTableCellElement)) return;
      console.log(index, byte, JSON.stringify(tx.getAnnotationForByte(index)));
      setIndex(index);
    };
  }
  return (
    <table class={styles.txDataTable} onMouseOut={() => setIndex(undefined)}>
      <tbody>
        <For each={tx.tx.toHex().match(matchRegex)}>
          {(chunk, row) => {
            return (
              <tr>
                <ByteMarker row={row()}></ByteMarker>
                <For each={chunk.match(/.{1,2}/g)}>
                  {(byte, col) => {
                    const index = row() * BYTES_PER_ROW + col();
                    return (
                      <Byte
                        byte={byte}
                        index={index}
                        currentlySelectedIndex={indexAccessor}
                        tx={tx}
                        onMouseOver={getMouseOverFn(byte, index)}
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
  const [tx, setTx] = createSignal<AnnotatedTransaction>();
  const [index, setIndex] = createSignal<number>();
  createEffect(() => {
    const h = hex();
    if (!h) return;
    try {
      const t = Transaction.fromHex(h);
      console.log('tx hex:', h);
      console.dir(t);
      setTx(new AnnotatedTransaction(t));
      return t;
    } catch (e) {
      console.error('could not parse tx');
    }
  });
  return (
    <Show when={tx() !== undefined}>
      <p></p>
      <div class={styles.txDiagramRow}>
        <div class={styles.txDiagramColumn}>
          <DimensionsTable tx={tx()!.tx}></DimensionsTable>
        </div>
        <div class={styles.txDiagramColumn}>
          <DataTable
            tx={tx()!}
            indexAccessor={index}
            setIndex={setIndex}
          ></DataTable>
        </div>
        <div class={styles.txDiagramColumn}>
          <InfoTable tx={tx()!} index={index}></InfoTable>
        </div>
      </div>
    </Show>
  );
};

export default TransactionDiagram;
