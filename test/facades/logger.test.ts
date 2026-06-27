import { logger } from '../../src/facades/logger';
import { Logger } from '../../src/infrastructure/logger/Logger';
import { LogLevel } from '../../src/infrastructure/logger/LogLevel';

describe('logger facade', () => {
  afterEach(() => jest.restoreAllMocks());

  it('delegates debug/info/warn/error to the Logger singleton with identical args', () => {
    const inst = Logger.getInstance();
    const debug = jest.spyOn(inst, 'debug').mockImplementation(() => {});
    const info = jest.spyOn(inst, 'info').mockImplementation(() => {});
    const warn = jest.spyOn(inst, 'warn').mockImplementation(() => {});
    const error = jest.spyOn(inst, 'error').mockImplementation(() => {});

    logger.debug('d', 1);
    logger.info('i', 2);
    logger.warn('w', 3);
    const e = new Error('boom');
    logger.error('e', e, 4);

    expect(debug).toHaveBeenCalledWith('d', 1);
    expect(info).toHaveBeenCalledWith('i', 2);
    expect(warn).toHaveBeenCalledWith('w', 3);
    expect(error).toHaveBeenCalledWith('e', e, 4);
  });

  it('setLevel / addTransport / removeTransport / clearTransports delegate', () => {
    const inst = Logger.getInstance();
    const configure = jest.spyOn(inst, 'configure').mockImplementation(() => {});
    const add = jest.spyOn(inst, 'addTransport').mockImplementation(() => {});
    const remove = jest.spyOn(inst, 'removeTransport').mockReturnValue(true);
    const clear = jest.spyOn(inst, 'clearTransports').mockImplementation(() => {});

    logger.setLevel(LogLevel.WARN);
    const transport = { name: 't', write: jest.fn() };
    logger.addTransport(transport);
    logger.removeTransport('t');
    logger.clearTransports();

    expect(configure).toHaveBeenCalledWith({ level: LogLevel.WARN });
    expect(add).toHaveBeenCalledWith(transport);
    expect(remove).toHaveBeenCalledWith('t');
    expect(clear).toHaveBeenCalled();
  });
});
