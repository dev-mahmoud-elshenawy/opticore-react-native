import { Logger } from '../../../src/infrastructure/logger/Logger';
import { LogLevel } from '../../../src/infrastructure/logger/LogLevel';
import { LogTransport } from '../../../src/infrastructure/logger/LogTransport';
import { LogEntry } from '../../../src/infrastructure/logger/LogEntry';

describe('Logger Transports', () => {
  let logger: Logger;
  let mockTransport: LogTransport;
  let writeSpy: jest.Mock;

  beforeEach(() => {
    // Reset logger instance (singleton hack for testing)
    // Accessing private static instance if possible, or just re-configuring/clearing
    logger = Logger.getInstance();
    (logger as any).clearTransports();

    writeSpy = jest.fn();
    mockTransport = {
      name: 'mock',
      write: writeSpy,
    };

    logger.configure({
      level: LogLevel.DEBUG,
      enabled: true,
      isProduction: false,
    });
  });

  it('should add and use a transport', () => {
    logger.addTransport(mockTransport);
    logger.info('test');

    expect(writeSpy).toHaveBeenCalled();
    const entry = writeSpy.mock.calls[0][0] as LogEntry;
    expect(entry.message).toBe('test');
    expect(entry.level).toBe(LogLevel.INFO);
  });

  it('should remove a transport', () => {
    logger.addTransport(mockTransport);
    logger.removeTransport('mock');
    logger.info('test');

    expect(writeSpy).not.toHaveBeenCalled();
  });

  it('should respect transport-specific minLevel', () => {
    mockTransport.minLevel = LogLevel.ERROR;
    logger.addTransport(mockTransport);

    logger.info('should ignore');
    expect(writeSpy).not.toHaveBeenCalled();

    logger.error('should log');
    expect(writeSpy).toHaveBeenCalled();
  });

  it('should handle multiple transports', () => {
    const spy2 = jest.fn();
    const transport2 = { name: 'mock2', write: spy2 };

    logger.addTransport(mockTransport);
    logger.addTransport(transport2);

    logger.info('test');
    expect(writeSpy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should stay silent after clearTransports() until a transport is added', () => {
    (logger as any).clearTransports();

    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    logger.info('test');

    // clearTransports() is honored — no self-heal, so nothing is logged.
    expect(consoleSpy).not.toHaveBeenCalled();

    // Adding a transport restores delivery.
    const spy = jest.fn();
    logger.addTransport({ name: 'mock', write: spy });
    logger.info('test2');
    expect(spy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should still deliver to custom transports in production (only console is suppressed)', () => {
    logger.addTransport(mockTransport);
    logger.configure({ isProduction: true });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    logger.error('prod failure', new Error('boom'));

    // Remote/custom transport MUST receive the entry — it is the reason
    // transports are registered for production.
    expect(writeSpy).toHaveBeenCalled();
    const entry = writeSpy.mock.calls[0][0] as LogEntry;
    expect(entry.message).toBe('prod failure');
    consoleSpy.mockRestore();
  });

  it('should suppress the console transport in production', () => {
    (logger as any).clearTransports();
    logger.configure({ isProduction: true });

    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    logger.info('should not reach console');

    // Auto-added console transport must stay silent in production.
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    consoleInfoSpy.mockRestore();
  });

  it('should catch transport errors without crashing', () => {
    const failingTransport = {
      name: 'fail',
      write: () => {
        throw new Error('Boom');
      },
    };

    const safeTransport = {
      name: 'safe',
      write: jest.fn(),
    };

    logger.addTransport(failingTransport);
    logger.addTransport(safeTransport);

    // Should not throw
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => logger.info('test')).not.toThrow();

    // Safe transport should still be called
    expect(safeTransport.write).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Logger transport failed:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
