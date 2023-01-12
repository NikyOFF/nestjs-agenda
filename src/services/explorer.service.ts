import { Injectable, OnModuleInit } from '@nestjs/common';
import { AgendaParamsFactory } from '../factories';
import Agenda from 'agenda';
import { MetadataAccessorService } from './metadata-accessor.service';
import {
  ModuleRef,
  MetadataScanner,
  ModulesContainer,
  DiscoveryService,
} from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { AGENDA, PARAM_ARGS_METADATA } from '../constants';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ParamMetadata } from '@nestjs/core/helpers/interfaces';
import { AgendaContextType } from '../types';
import { ProcessorMetadataInterface } from '../interfaces';

@Injectable()
export class ExplorerService implements OnModuleInit {
  private readonly agendaParamsFactory = new AgendaParamsFactory();
  private agenda: Agenda;

  public constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: MetadataAccessorService,
    private readonly moduleRef: ModuleRef,
    private readonly metadataScanner: MetadataScanner,
    private readonly modulesContainer: ModulesContainer,
    private readonly externalContextCreator: ExternalContextCreator,
  ) {}

  public onModuleInit(): void {
    this.agenda = this.moduleRef.get<Agenda>(AGENDA);

    this.explore();
  }

  private explore(): void {
    const providers = this.discoveryService.getProviders();

    this.registerJobProcessors(providers);
  }

  private registerJobProcessors(providers: InstanceWrapper[]): void {
    const filteredProviders = providers.filter(this.filterJobProcessors);

    for (const provider of filteredProviders) {
      const instancePrototype = Object.getPrototypeOf(provider.instance);

      this.metadataScanner.scanFromPrototype(
        provider.instance,
        instancePrototype,
        (methodKey) => {
          this.registerProcessor(
            provider.instance,
            instancePrototype,
            methodKey,
          );
        },
      );
    }
  }

  private registerProcessor(
    instance: any,
    prototype: any,
    methodKey: string,
  ): void {
    const methodRef = prototype[methodKey];
    const processorsMetadata =
      this.metadataAccessor.getProcessorMetadata(methodRef);

    if (!processorsMetadata) {
      return;
    }

    for (const processorMetadata of processorsMetadata) {
      this.defineProcessor(instance, prototype, methodKey, processorMetadata);
    }
  }

  private defineProcessor(
    instance: any,
    prototype: any,
    methodKey: string,
    metadata: ProcessorMetadataInterface,
  ): void {
    const processorFunction = this.createContextProcessor(
      instance,
      prototype,
      methodKey,
    );

    this.agenda.define(
      metadata.name,
      metadata.options || {},
      async (job, done) => {
        await processorFunction(job, done);
      },
    );
  }

  private createContextProcessor<T extends Record<string, unknown>>(
    instance: T,
    prototype: unknown,
    methodName: string,
  ) {
    return this.externalContextCreator.create<
      Record<number, ParamMetadata>,
      AgendaContextType
    >(
      instance,
      prototype[methodName],
      methodName,
      PARAM_ARGS_METADATA,
      this.agendaParamsFactory,
      undefined,
      undefined,
      undefined,
      'agenda',
    );
  }

  private filterJobProcessors(
    wrapper: InstanceWrapper,
  ): InstanceWrapper<unknown> {
    return !wrapper.instance ||
      !this.metadataAccessor.isJobProcessors(wrapper.metatype)
      ? undefined
      : wrapper;
  }
}
