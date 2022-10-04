import { Annotation } from '../AnnotatedTransaction';
import styles from './colorscheme.module.css';

export function getClassForAnnotation(annotation: Annotation) {
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
    case 'scriptSigLen':
      return styles.scriptSigLen;
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
