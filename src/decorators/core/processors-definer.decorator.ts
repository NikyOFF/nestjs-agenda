import { SetMetadata } from '@nestjs/common';
import { PROCESSORS_DEFINER_METADATA } from '../../constants';

export const ProcessorsDefiner = (): ClassDecorator =>
  SetMetadata(PROCESSORS_DEFINER_METADATA, true);
