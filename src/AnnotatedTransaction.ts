import { Transaction } from '@bitgo/bitcoinjs-lib';
import * as varuint from 'varuint-bitcoin';

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

export interface AnnotationRange {
  start: number;
  end: number;
  annotations: Annotation[];
}

export class AnnotatedTransaction {
  private annotations: AnnotationRange[] = [];

  constructor(public tx: Transaction) {
    const buffer = tx.toBuffer();
    let offset = 0;
    this.annotations.push({ start: 0, end: 4, annotations: ['version'] });
    offset += 4;
    if (tx.hasWitnesses()) {
      this.annotations.push({
        start: offset,
        end: offset + 1,
        annotations: ['segwitMarker'],
      });
      this.annotations.push({
        start: offset + 1,
        end: offset + 2,
        annotations: ['segwitFlag'],
      });
      offset += 2;
    }
    const vinLen = varuint.decode(buffer, offset);
    this.annotations.push({
      start: offset,
      end: offset + varuint.decode.bytes,
      annotations: ['vinLen'],
    });
    offset += varuint.decode.bytes;
    for (let i = 0; i < vinLen; i++) {
      this.annotations.push({
        start: offset,
        end: offset + 32,
        annotations: [`input-${i}`, 'prevHash'],
      });
      offset += 32;
      this.annotations.push({
        start: offset,
        end: offset + 4,
        annotations: [`input-${i}`, 'index'],
      });
      offset += 4;
      const scriptSigLen = varuint.decode(buffer, offset);
      this.annotations.push({
        start: offset,
        end: offset + varuint.decode.bytes,
        annotations: [`input-${i}`, 'scriptSigLen'],
      });
      offset += varuint.decode.bytes;
      this.annotations.push({
        start: offset,
        end: offset + scriptSigLen,
        annotations: [`input-${i}`, 'scriptSig'],
      });
      offset += scriptSigLen;
      this.annotations.push({
        start: offset,
        end: offset + 4,
        annotations: [`input-${i}`, 'sequence'],
      });
      offset += 4;
    }

    const voutLen = varuint.decode(buffer, offset);
    this.annotations.push({
      start: offset,
      end: offset + varuint.decode.bytes,
      annotations: ['voutLen'],
    });
    offset += varuint.decode.bytes;
    for (let i = 0; i < voutLen; i++) {
      this.annotations.push({
        start: offset,
        end: offset + 8,
        annotations: [`output-${i}`, 'value'],
      });
      offset += 8;
      const scriptPubKeyLen = varuint.decode(buffer, offset);
      this.annotations.push({
        start: offset,
        end: offset + varuint.decode.bytes,
        annotations: [`output-${i}`, 'scriptPubKeyLen'],
      });
      offset += varuint.decode.bytes;
      this.annotations.push({
        start: offset,
        end: offset + scriptPubKeyLen,
        annotations: [`output-${i}`, 'scriptPubKey'],
      });
      offset += scriptPubKeyLen;
    }
    if (tx.hasWitnesses()) {
      for (let i = 0; i < vinLen; i++) {
        const witnessProgramLen = varuint.decode(buffer, offset);
        this.annotations.push({
          start: offset,
          end: offset + varuint.decode.bytes,
          annotations: [`witness-${i}`, 'programLen'],
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
          });
          offset += programElementLen;
        }
      }
    }
    this.annotations.push({
      start: offset,
      end: offset + 4,
      annotations: ['locktime'],
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
