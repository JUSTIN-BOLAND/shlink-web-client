export interface ServerData {
  name: string;
  url: string;
  apiKey: string;
}

export interface ServerWithId extends ServerData {
  id: string;
}

export interface ReachableServer extends ServerWithId {
  version: string;
  printableVersion: string;
}

export interface NonReachableServer extends ServerWithId {
  serverNotReachable: true;
}

export interface NotFoundServer {
  serverNotFound: true;
}

export type RegularServer = ReachableServer | NonReachableServer;

export type SelectedServer = RegularServer | NotFoundServer | null;

export type ServersMap = Record<string, ServerWithId>;

export const hasServerData = (server: SelectedServer | ServerData): server is ServerData =>
  !!(server as ServerData)?.url && !!(server as ServerData)?.apiKey;

export const isServerWithId = (server: SelectedServer | ServerWithId): server is ServerWithId =>
  !!server?.hasOwnProperty('id');

export const isReachableServer = (server: SelectedServer): server is ReachableServer =>
  !!server?.hasOwnProperty('printableVersion');

export const isNotFoundServer = (server: SelectedServer): server is NotFoundServer =>
  !!server?.hasOwnProperty('serverNotFound');
