import { ConsoleLogger } from '../../src/infrastructure/logger/console-logger.js';

describe('ConsoleLogger', () => {
  it('пишет correlation id и уровни info/warn/error', () => {
    const lines: string[] = [];
    const sink = {
      info: (message: string): void => {
        lines.push(message);
      },
      warn: (message: string): void => {
        lines.push(message);
      },
      error: (message: string): void => {
        lines.push(message);
      },
    };
    const logger = new ConsoleLogger({ verbose: false, correlationId: 'cid-1' }, sink);
    logger.info('ok');
    logger.warn('careful');
    logger.error('fail');
    logger.debug('hidden');
    expect(lines).toEqual([
      '[cid-1] info: ok',
      '[cid-1] warn: careful',
      '[cid-1] error: fail',
    ]);
  });

  it('с --verbose пишет debug', () => {
    const lines: string[] = [];
    const sink = {
      info: (message: string): void => {
        lines.push(message);
      },
      warn: (message: string): void => {
        lines.push(message);
      },
      error: (message: string): void => {
        lines.push(message);
      },
    };
    const logger = new ConsoleLogger({ verbose: true, correlationId: 'cid-2' }, sink);
    logger.debug('details');
    expect(lines).toEqual(['[cid-2] debug: details']);
  });
});
