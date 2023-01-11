import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JOB_PROCESSORS_METADATA, PROCESSOR_METADATA } from '../constants';
import { JobSequenceMetadataInterface } from '../interfaces/job-sequence-metadata.interface';

@Injectable()
export class MetadataAccessorService {
  public constructor(private readonly reflector: Reflector) {}

  public isJobProcessors(target: Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(JOB_PROCESSORS_METADATA, target);
  }

  public isProcessor(target: Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(PROCESSOR_METADATA, target);
  }

  public getProcessorMetadata(
    target: Function,
  ): JobSequenceMetadataInterface[] | undefined {
    return this.reflector.get(PROCESSOR_METADATA, target);
  }
}
