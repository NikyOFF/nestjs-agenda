import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { AgendaModuleOptionsFactoryInterface } from './agenda-module-options-factory.interface';
import { AgendaConfig } from 'agenda';

export interface AgendaModuleAsyncOptionsInterface
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AgendaModuleOptionsFactoryInterface>;
  useClass?: Type<AgendaModuleOptionsFactoryInterface>;
  useFactory?: (...args: any[]) => Promise<AgendaConfig> | AgendaConfig;
  inject?: any[];
}
