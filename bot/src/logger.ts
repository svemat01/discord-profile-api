import { createLogger } from '@lvksh/logger';
import kleur from 'kleur';

export const logger = createLogger({
    debug: kleur.cyan('[DEBUG]'),
    info: kleur.green('[INFO]'),
    warning: kleur.yellow('[WARN]'),
    error: kleur.red('[ERROR]'),
})