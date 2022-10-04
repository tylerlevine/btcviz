import { Transaction } from '@bitgo/bitcoinjs-lib';
import styles from '../TransactionDiagram.module.css';
import styles2 from './dimensions.module.css';

function formatLocktime(tx: Transaction): string {
  if (tx.locktime < 500_000_000) {
    return `block ${tx.locktime.toString()}`;
  }

  return new Date(tx.locktime * 1000).toLocaleString();
}

export function DimensionsTable({ tx }: { tx: Transaction }) {
  return (
    <div class={styles.txDimensionsSidebar}>
      <div class={styles2.txId}>
        <div>Transaction</div>
        <div>
          <a target={'_blank'} href={`https://mempool.space/tx/${tx.getId()}`}>
            <span class={styles.code}>{tx.getId()}</span>
          </a>
        </div>
      </div>
      <div class={styles.txDimensions}>
        <div class={styles2.txDimensionsGrid}>
          <div>
            <div>Bytes</div>
            <div class={styles.code}>{tx.byteLength()}</div>
          </div>
          <div>
            <div>Virtual Size</div>
            <div class={styles.code}>{tx.virtualSize()}</div>
          </div>
          <div>
            <div>Weight</div>
            <div class={styles.code}>{tx.weight()}</div>
          </div>
        </div>
        <div class={styles2.txDimensionsGrid}>
          <div>
            <div>Inputs</div>
            <div class={styles.code}>{tx.ins.length}</div>
          </div>
          <div>
            <div>Outputs</div>
            <div class={styles.code}>{tx.outs.length}</div>
          </div>
          <div>
            <div>Output Value</div>
            <div class={styles.code}>
              {tx.outs.reduce((acc, out) => acc + out.value, 0)}
            </div>
          </div>
        </div>
        <div class={styles2.txDimensionsGrid}>
          <div>
            <div>RBF</div>
            <div class={styles.code}>
              {tx.ins.some((i) => i.sequence < 0xffffffff - 1) ? 'Yes' : 'No'}
            </div>
          </div>
          <div>
            <div>Locktime</div>
            <div class={styles.code}>{formatLocktime(tx)}</div>
          </div>
          <div>
            <div>???</div>
            <div class={styles.code}>???</div>
          </div>
        </div>
      </div>
    </div>
  );
}
