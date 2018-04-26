import { curryN } from 'ramda';
import controller from './ctrl';

export {default as FjsPromise} from './commons/promise';

export const ctrl = curryN(2, controller);