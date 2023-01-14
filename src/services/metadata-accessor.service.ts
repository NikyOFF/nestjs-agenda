import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PROCESSORS_DEFINER_METADATA,
  PROCESSOR_METADATA,
  PROCESSOR_SCHEDULE_METADATA,
} from '../constants';
import { ProcessorMetadataInterface } from '../interfaces';
import { ScheduleType } from '../types';

@Injectable()
export class MetadataAccessorService {
  public constructor(private readonly reflector: Reflector) {}

  public isProcessorsDefiner(target: Function): boolean {
    return (
      !!target && !!this.reflector.get(PROCESSORS_DEFINER_METADATA, target)
    );
  }

  public getProcessorMetadata(
    target: Function,
  ): ProcessorMetadataInterface | undefined {
    return this.reflector.get(PROCESSOR_METADATA, target);
  }

  public getProcessorScheduleMetadata(
    target: Function,
  ): ScheduleType[] | undefined {
    return this.reflector.get(PROCESSOR_SCHEDULE_METADATA, target);
  }
}
