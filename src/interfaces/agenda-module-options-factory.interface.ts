import { AgendaConfig } from 'agenda';

export interface AgendaModuleOptionsFactoryInterface {
  createAgendaModuleOptions(): Promise<AgendaConfig> | AgendaConfig;
}
