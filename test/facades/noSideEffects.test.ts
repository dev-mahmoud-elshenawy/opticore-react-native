describe('facades are side-effect-free on import', () => {
  it('importing the facades module calls no getInstance() at module load', () => {
    jest.isolateModules(() => {
      // Require the singleton classes FIRST (within the isolated registry) so the
      // facade module imports these exact instances — then install spies and load
      // the facades. If any facade resolved its singleton at module-eval time,
      // these spies would fire.
      const { ApiClient } = require('../../src/infrastructure/network/ApiClient');
      const { StorageManager } = require('../../src/infrastructure/storage/StorageManager');
      const { Logger } = require('../../src/infrastructure/logger/Logger');

      const apiSpy = jest.spyOn(ApiClient, 'getInstance');
      const storageSpy = jest.spyOn(StorageManager, 'getInstance');
      const loggerSpy = jest.spyOn(Logger, 'getInstance');

      require('../../src/facades');

      expect(apiSpy).not.toHaveBeenCalled();
      expect(storageSpy).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();

      apiSpy.mockRestore();
      storageSpy.mockRestore();
      loggerSpy.mockRestore();
    });
  });
});
