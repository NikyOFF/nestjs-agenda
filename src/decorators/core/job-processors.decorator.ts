import { SetMetadata } from '@nestjs/common';
import { JOB_PROCESSORS_METADATA } from '../../constants';

export const JobProcessors = (): ClassDecorator =>
  SetMetadata(JOB_PROCESSORS_METADATA, true);
