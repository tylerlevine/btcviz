import { AnnotatedTransaction } from '../AnnotatedTransaction';
import { Accessor, createEffect, createSignal, Show } from 'solid-js';
import styles from '../TransactionDiagram.module.css';
import styles2 from './info.module.css';
import { TxInfoValue } from './txInfoValue';

export interface InfoBoxState {
  offset: number;
  byte: string;
  description: string;
  value: string;
  start: number;
  end: number;
}

function formatHexValue(value?: number): string {
  if (value === undefined) return '';
  const hexString = value.toString(16);
  const padLength =
    hexString.length & 1 ? hexString.length + 1 : hexString.length;
  return `0x${value.toString(16).padStart(padLength, '0')}`;
}

export function InfoTable({
  tx,
  index,
}: {
  tx: AnnotatedTransaction;
  index: Accessor<number | undefined>;
}) {
  const [infoBoxState, setInfoBoxState] = createSignal<InfoBoxState>();
  createEffect(() => {
    const i = index();
    if (i !== undefined) {
      const annotation = tx.getAnnotationForByte(i);
      setInfoBoxState({
        offset: i,
        byte: tx.tx.toBuffer().readUInt8(i).toString(16).padStart(2, '0'),
        description: annotation.description,
        value: annotation.value,
        start: annotation.start,
        end: annotation.end,
      });
    }
  });
  return (
    <Show when={infoBoxState() !== undefined}>
      <div class={styles.txInfoSidebox}>
        <div class={styles2.txInfoGrid}>
          <div>
            <div>Byte</div>
            <div>
              <span class={styles.code}>{infoBoxState()?.byte}</span>
            </div>
          </div>
          <div>
            <div>Offset</div>
            <div>
              <span class={styles.code}>{infoBoxState()?.offset}</span>
            </div>
          </div>
          <div>
            <div>Offset (hex)</div>
            <div>
              <span class={styles.code}>
                {formatHexValue(infoBoxState()?.offset)}
              </span>
            </div>
          </div>
        </div>
        <div class={styles2.txInfoDescription}>
          <div>{infoBoxState()?.description ?? ''}</div>
        </div>
        <TxInfoValue infoBoxState={infoBoxState}></TxInfoValue>
      </div>
    </Show>
  );
}
