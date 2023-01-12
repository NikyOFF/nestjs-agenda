import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JOB_PROCESSORS_METADATA, PROCESSOR_METADATA } from '../constants';
import { ProcessorMetadataInterface } from '../interfaces';

@Injectable()
export class MetadataAccessorService {
  public constructor(private readonly reflector: Reflector) {}

  public isJobProcessors(target: Function): boolean {
    return !!target && !!this.reflector.get(JOB_PROCESSORS_METADATA, target);
  }

  public getProcessorMetadata(
    target: Function,
  ): ProcessorMetadataInterface[] | undefined {
    return this.reflector.get(PROCESSOR_METADATA, target);
  }
}
