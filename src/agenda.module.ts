import {
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import { DiscoveryModule, ModuleRef } from '@nestjs/core';
import { ExplorerService, MetadataAccessorService } from './services';
import { Agenda, AgendaConfig } from 'agenda';
import { AGENDA, AGENDA_MODULE_OPTIONS } from './constants';
import {
  AgendaModuleAsyncOptionsInterface,
  AgendaModuleOptionsFactoryInterface,
} from './interfaces';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [ExplorerService, MetadataAccessorService],
})
export class AgendaModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  public static forRoot(options: AgendaConfig): DynamicModule {
    const agendaProvider: Provider = {
      provide: AGENDA,
      useFactory: async () => {
        const agenda = new Agenda(options);

        await agenda.start();

        return agenda;
      },
    };

    return {
      module: AgendaModule,
      providers: [
        {
          provide: AGENDA_MODULE_OPTIONS,
          useValue: options,
        },
        agendaProvider,
      ],
      exports: [agendaProvider],
    };
  }

  public static forRootAsync(
    options: AgendaModuleAsyncOptionsInterface,
  ): DynamicModule {
    const agendaProvider: Provider = {
      provide: AGENDA,
      useFactory: async (config: AgendaConfig) => {
        const agenda = new Agenda(config);

        await agenda.start();

        return agenda;
      },
      inject: [AGENDA_MODULE_OPTIONS],
    };

    return {
      module: AgendaModule,
      imports: options.imports,
      providers: [...this.createAsyncOptionsProviders(options), agendaProvider],
      exports: [agendaProvider],
    };
  }

  private static createAsyncOptionsProvider(
    options: AgendaModuleAsyncOptionsInterface,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: AGENDA_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: AGENDA_MODULE_OPTIONS,
      useFactory: async (
        optionsFactory: AgendaModuleOptionsFactoryInterface,
      ) => {
        return optionsFactory.createAgendaModuleOptions();
      },
      inject: [options.useExisting || options.useClass],
    };
  }

  private static createAsyncOptionsProviders(
    options: AgendaModuleAsyncOptionsInterface,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  public async onApplicationShutdown(): Promise<void> {
    const agenda = this.moduleRef.get<Agenda>(AGENDA);

    if (!agenda) {
      return;
    }

    await agenda.stop();
  }
}
