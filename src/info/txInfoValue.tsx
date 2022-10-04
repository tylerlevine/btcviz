import styles from '../TransactionDiagram.module.css';
import { Accessor, Show } from 'solid-js';
import { InfoBoxState } from './index';
import styles2 from './info.module.css';

export function TxInfoValue({
  infoBoxState,
}: {
  infoBoxState: Accessor<InfoBoxState | undefined>;
}) {
  return (
    <Show when={infoBoxState() !== undefined}>
      <div class={styles2.txInfoValue}>
        <span class={styles.code}>{infoBoxState()?.value}</span>
      </div>
    </Show>
  );
}
