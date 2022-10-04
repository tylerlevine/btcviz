import { script, Transaction } from '@bitgo/bitcoinjs-lib';
import * as varuint from 'varuint-bitcoin';
import { Buffer } from 'buffer/';

export type ScriptType =
  | 'p2pk'
  | 'p2pkh'
  | 'p2sh-p2pk'
  | 'p2sh-p2pkh'
  | 'p2sh-p2wsh'
  | 'p2wpkh'
  | 'p2wsh';

export type Annotation =
  | 'version'
  | 'segwitMarker'
  | 'segwitFlag'
  | 'vinLen'
  | 'prevHash'
  | `input-${number}`
  | 'index'
  | 'sequence'
  | 'scriptSigLen'
  | 'scriptSig'
  | 'voutLen'
  | `output-${number}`
  | 'value'
  | 'scriptPubKeyLen'
  | 'scriptPubKey'
  | `witness-${number}`
  | 'programLen'
  | `programElement-${number}-len`
  | 'programElementLen'
  | `programElement-${number}`
  | 'programElement'
  | 'locktime';

export type DataType = 'u8' | 'u32' | 'u64' | 'txid' | 'varuint' | 'buffer';

export interface AnnotationRange {
  start: number;
  end: number;
  annotations: Annotation[];
  description: string;
  value: string;
  dataType: DataType;
}

function witnessElementToString(elt: globalThis.Buffer): string {
  try {
    return script.toASM(elt);
  } catch {
    return elt.toString('hex');
  }
}

export class AnnotatedTransaction {
  private annotations: AnnotationRange[] = [];

  constructor(public tx: Transaction) {
    const buffer = tx.toBuffer();
    let offset = 0;
    this.annotations.push({
      start: 0,
      end: 4,
      annotations: ['version'],
      description: 'Transaction version',
      value: this.tx.version.toString(),
      dataType: 'u32',
    });
    offset += 4;
    if (tx.hasWitnesses()) {
      this.annotations.push({
        start: offset,
        end: offset + 1,
        annotations: ['segwitMarker'],
        description:
          'Marker used to identify Segregated Witness (SegWit) transactions',
        value: '0',
        dataType: 'u8',
      });
      this.annotations.push({
        start: offset + 1,
        end: offset + 2,
        annotations: ['segwitFlag'],
        description:
          'Flag used to identify Segregated Witness (SegWit) transactions',
        value: '1',
        dataType: 'u8',
      });
      offset += 2;
    }
    const vinLen = varuint.decode(buffer, offset);
    this.annotations.push({
      start: offset,
      end: offset + varuint.decode.bytes,
      annotations: ['vinLen'],
      description: 'Number of transaction inputs',
      value: vinLen.toString(),
      dataType: 'varuint',
    });
    offset += varuint.decode.bytes;
    for (let i = 0; i < vinLen; i++) {
      const input = this.tx.ins[i];
      this.annotations.push({
        start: offset,
        end: offset + 32,
        annotations: [`input-${i}`, 'prevHash'],
        description: `Transaction ID of previous output being spent in input ${i}`,
        value: Buffer.from(Buffer.from(input.hash).reverse()).toString('hex'),
        dataType: 'txid',
      });
      offset += 32;
      this.annotations.push({
        start: offset,
        end: offset + 4,
        annotations: [`input-${i}`, 'index'],
        description: `Output index of previous output being spent in input ${i}`,
        value: input.index.toString(),
        dataType: 'u32',
      });
      offset += 4;
      const scriptSigLen = varuint.decode(buffer, offset);
      this.annotations.push({
        start: offset,
        end: offset + varuint.decode.bytes,
        annotations: [`input-${i}`, 'scriptSigLen'],
        description: `Number of bytes in the "unlocking script" (scriptSig) for input ${i}`,
        value: scriptSigLen.toString(),
        dataType: 'varuint',
      });
      offset += varuint.decode.bytes;
      this.annotations.push({
        start: offset,
        end: offset + scriptSigLen,
        annotations: [`input-${i}`, 'scriptSig'],
        description: `"unlocking script" (scriptSig) for input ${i}`,
        value: script.toASM(input.script),
        dataType: 'buffer',
      });
      offset += scriptSigLen;
      this.annotations.push({
        start: offset,
        end: offset + 4,
        annotations: [`input-${i}`, 'sequence'],
        description:
          'Input sequence used for signaling Replace By Fee (BIP 125)',
        // probably this value is not that useful - need to show something better here
        value: input.sequence.toString(),
        dataType: 'u32',
      });
      offset += 4;
    }

    const voutLen = varuint.decode(buffer, offset);
    this.annotations.push({
      start: offset,
      end: offset + varuint.decode.bytes,
      annotations: ['voutLen'],
      description: 'Number of transaction outputs',
      // probably this value is not that useful - need to show something better here
      value: voutLen.toString(),
      dataType: 'varuint',
    });
    offset += varuint.decode.bytes;
    for (let i = 0; i < voutLen; i++) {
      const output = this.tx.outs[i];
      this.annotations.push({
        start: offset,
        end: offset + 8,
        annotations: [`output-${i}`, 'value'],
        description: `Number of satoshis assigned to output ${i}`,
        value: output.value.toString(),
        dataType: 'u64',
      });
      offset += 8;
      const scriptPubKeyLen = varuint.decode(buffer, offset);
      this.annotations.push({
        start: offset,
        end: offset + varuint.decode.bytes,
        annotations: [`output-${i}`, 'scriptPubKeyLen'],
        description: `Number of bytes in the "locking script" (scriptPubKey) for output ${i}`,
        value: scriptPubKeyLen.toString(),
        dataType: 'varuint',
      });
      offset += varuint.decode.bytes;
      this.annotations.push({
        start: offset,
        end: offset + scriptPubKeyLen,
        annotations: [`output-${i}`, 'scriptPubKey'],
        description: `"locking script" (scriptPubKey) for output ${i}`,
        value: script.toASM(output.script),
        dataType: 'buffer',
      });
      offset += scriptPubKeyLen;
    }
    if (tx.hasWitnesses()) {
      for (let i = 0; i < vinLen; i++) {
        const input = this.tx.ins[i];
        const witnessProgramLen = varuint.decode(buffer, offset);
        this.annotations.push({
          start: offset,
          end: offset + varuint.decode.bytes,
          annotations: [`witness-${i}`, 'programLen'],
          description: `Number of elements in Segregated Witness for input ${i}`,
          value: witnessProgramLen.toString(),
          dataType: 'varuint',
        });
        offset += varuint.decode.bytes;
        for (let j = 0; j < witnessProgramLen; j++) {
          const programElementLen = varuint.decode(buffer, offset);
          this.annotations.push({
            start: offset,
            end: offset + varuint.decode.bytes,
            annotations: [
              `witness-${i}`,
              `programElement-${j}-len`,
              'programElementLen',
            ],
            description: `Number of bytes in Segregated Witness element ${j} for input ${i}`,
            value: programElementLen.toString(),
            dataType: 'varuint',
          });
          offset += varuint.decode.bytes;
          this.annotations.push({
            start: offset,
            end: offset + programElementLen,
            annotations: [
              `witness-${i}`,
              `programElement-${j}`,
              'programElement',
            ],
            description: `Segregated Witness element ${j} for input ${i}`,
            // probably not that useful
            value: witnessElementToString(input.witness[j]),
            dataType: 'buffer',
          });
          offset += programElementLen;
        }
      }
    }
    this.annotations.push({
      start: offset,
      end: offset + 4,
      annotations: ['locktime'],
      description:
        'earliest time at which this transaction can be included in the blockchain, either in terms of block height (if < 500,000,000) or in terms of a unix timestamp (if >= 500,000,000)',
      value: this.tx.locktime.toString(),
      dataType: 'u32',
    });
    offset += 4;

    const txByteLength = tx.byteLength();
    if (offset != txByteLength) {
      console.warn(
        `expected to read ${txByteLength} bytes, but read ${offset} bytes instead`
      );
    }
  }

  public getAnnotationForByte(byte: number): AnnotationRange {
    for (const annotation of this.annotations) {
      if (byte >= annotation.start && byte < annotation.end) {
        return annotation;
      }
    }

    throw new Error(`could not find annotation for byte ${byte}`);
  }
}
