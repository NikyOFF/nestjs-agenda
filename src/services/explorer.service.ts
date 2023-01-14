import { Injectable, OnModuleInit } from '@nestjs/common';
import { AgendaParamsFactory } from '../factories';
import Agenda from 'agenda';
import { MetadataAccessorService } from './metadata-accessor.service';
import {
  ModuleRef,
  MetadataScanner,
  DiscoveryService,
} from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { AGENDA, AGENDA_PARAM_ARGS_METADATA } from '../constants';
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
    private readonly externalContextCreator: ExternalContextCreator,
  ) {}

  public onModuleInit(): void {
    this.agenda = this.moduleRef.get<Agenda>(AGENDA);

    this.explore();
  }

  private explore(): void {
    const providers = this.discoveryService.getProviders();

    this.registerProcessorsDefiners(providers);
  }

  private registerProcessorsDefiners(providers: InstanceWrapper[]): void {
    for (const provider of providers) {
      if (!this.metadataAccessor.isProcessorsDefiner(provider.metatype)) {
        continue;
      }

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
    const processorMetadata = this.metadataAccessor.getProcessorMetadata(methodRef);

    if (!processorMetadata) {
      return;
    }

    this.defineProcessor(instance, prototype, methodKey, processorMetadata);
    this.scheduleProcessor(methodRef, processorMetadata.name);
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

  private scheduleProcessor(methodRef: any, name: string): Promise<void> {
    const scheduleMetadta = this.metadataAccessor.getProcessorScheduleMetadata(methodRef);

    if (!scheduleMetadta || !scheduleMetadta.length) {
      return;
    }

    for (const metadata of scheduleMetadta) {
      switch (metadata.type) {
        case 'now':
          this.agenda.now(name, metadata.data);
          break;
        case 'every':
          this.agenda.every(metadata.interval, name, metadata.data, metadata.options);
          break;
        case 'schedule':
          this.agenda.schedule(metadata.when, name, metadata.data);
          break;
      }
    }
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
      AGENDA_PARAM_ARGS_METADATA,
      this.agendaParamsFactory,
      undefined,
      undefined,
      undefined,
      'agenda',
    );
  }
}
