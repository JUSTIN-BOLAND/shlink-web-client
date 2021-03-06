import { Mock } from 'ts-mockery';
import { CsvJson } from 'csvjson';
import ServersExporter from '../../../src/servers/services/ServersExporter';
import LocalStorage from '../../../src/utils/services/LocalStorage';

describe('ServersExporter', () => {
  const createLinkMock = () => ({
    setAttribute: jest.fn(),
    click: jest.fn(),
    style: {},
  });
  const createWindowMock = (isIe10 = true) => Mock.of<Window>({
    navigator: {
      msSaveBlob: isIe10 ? jest.fn() : undefined,
    },
    document: {
      createElement: jest.fn(() => createLinkMock()),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
      },
    },
  });
  const storageMock = Mock.of<LocalStorage>({
    get: jest.fn(() => ({
      abc123: {
        id: 'abc123',
        name: 'foo',
      },
      def456: {
        id: 'def456',
        name: 'bar',
      },
    })),
  });
  const createCsvjsonMock = (throwError = false) => Mock.of<CsvJson>({
    toCSV: jest.fn(() => {
      if (throwError) {
        throw new Error('');
      }

      return '';
    }),
  });

  describe('exportServers', () => {
    let originalConsole: Console;
    const error = jest.fn();

    beforeEach(() => {
      originalConsole = global.console;
      global.console = Mock.of<Console>({ error });
      (global as any).Blob = class Blob {}; // eslint-disable-line @typescript-eslint/no-extraneous-class
      (global as any).URL = { createObjectURL: () => '' };
    });
    afterEach(() => {
      global.console = originalConsole;
      jest.clearAllMocks();
    });

    it('logs an error if something fails', () => {
      const csvjsonMock = createCsvjsonMock(true);
      const exporter = new ServersExporter(storageMock, createWindowMock(), csvjsonMock);
      const { toCSV } = csvjsonMock;

      exporter.exportServers();

      expect(error).toHaveBeenCalledTimes(1);
      expect(toCSV).toHaveBeenCalledTimes(1);
    });

    it('makes use of msSaveBlob API when available', () => {
      const windowMock = createWindowMock();
      const exporter = new ServersExporter(storageMock, windowMock, createCsvjsonMock());
      const { navigator: { msSaveBlob }, document: { createElement } } = windowMock;

      exporter.exportServers();

      expect(storageMock.get).toHaveBeenCalledTimes(1);
      expect(msSaveBlob).toHaveBeenCalledTimes(1);
      expect(createElement).not.toHaveBeenCalled();
    });

    it('makes use of download link API when available', () => {
      const windowMock = createWindowMock(false);
      const exporter = new ServersExporter(storageMock, windowMock, createCsvjsonMock());
      const { document: { createElement, body } } = windowMock;
      const { appendChild, removeChild } = body;

      exporter.exportServers();

      expect(storageMock.get).toHaveBeenCalledTimes(1);
      expect(createElement).toHaveBeenCalledTimes(1);
      expect(appendChild).toHaveBeenCalledTimes(1);
      expect(removeChild).toHaveBeenCalledTimes(1);
    });
  });
});
