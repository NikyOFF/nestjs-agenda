import { Injectable, OnModuleInit } from '@nestjs/common';
import { AgendaParamsFactory } from '../factories/agenda-params.factory';
import Agenda from 'agenda';
import { MetadataAccessorService } from '../services/metadata-accessor.service';
import { ModuleRef, MetadataScanner, ModulesContainer } from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { AGENDA, PARAM_ARGS_METADATA } from '../constants';
import { Module } from '@nestjs/core/injector/module';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ParamMetadata } from '@nestjs/core/helpers/interfaces';
import { AgendaContextType } from '../types/agenda-context.type';
import { identity } from 'lodash';
import { flattenDeep } from '../utils';

@Injectable()
export class ExplorerService implements OnModuleInit {
  private readonly agendaParamsFactory = new AgendaParamsFactory();
  private agenda: Agenda;

  public constructor(
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
    const modules = [...this.modulesContainer.values()];

    this.registerJobProcessors(modules);
  }

  private registerJobProcessors(modules: Module[]): void {
    const jobProcessorsWrappers = this.flatMap<InstanceWrapper>(
      modules,
      (wrapper) => this.filterJobProcessors(wrapper),
    );

    jobProcessorsWrappers.forEach((wrapper) => {
      const instancePrototype = Object.getPrototypeOf(wrapper.instance);

      this.metadataScanner.scanFromPrototype(
        wrapper.instance,
        instancePrototype,
        (name) => {
          this.registerProcessor(wrapper.instance, instancePrototype, name);
        },
      );
    });
  }

  private registerProcessor(
    instance: any,
    prototype: any,
    methodName: string,
  ): void {
    const methodRef = prototype[methodName];
    const processorsMetadata =
      this.metadataAccessor.getProcessorMetadata(methodRef);

    if (!processorsMetadata) {
      return;
    }

    for (const processorMetadata of processorsMetadata) {
      const processorFunction = this.createContextProcessor(
        instance,
        prototype,
        methodName,
      );

      this.agenda.define(
        processorMetadata.name,
        processorMetadata.options || {},
        async (job, done) => {
          await processorFunction(job, done);
        },
      );
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
    if (!wrapper.instance) {
      return undefined;
    }

    const isJobProcessors = this.metadataAccessor.isJobProcessors(
      wrapper.metatype,
    );

    if (!isJobProcessors) {
      return undefined;
    }

    return wrapper;
  }

  private flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper, moduleRef: Module) => T | T[],
  ): T[] {
    const visitedModules = new Set<Module>();

    const unwrap = (moduleRef: Module) => {
      if (visitedModules.has(moduleRef)) {
        return [];
      } else {
        visitedModules.add(moduleRef);
      }

      const providers = [...moduleRef.providers.values()];
      const defined = providers.map((wrapper) => callback(wrapper, moduleRef));

      const imported: (T | T[])[] = moduleRef.imports?.size
        ? [...moduleRef.imports.values()].reduce((prev, cur) => {
            return [...prev, ...unwrap(cur)];
          }, [])
        : [];

      return [...defined, ...imported];
    };

    return flattenDeep(modules.map(unwrap)).filter(identity);
  }
}
