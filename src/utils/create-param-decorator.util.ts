import { AgendaParamtypeEnum } from '../enums';
import { ParamData } from '../types';
import { AGENDA_PARAM_ARGS_METADATA } from '../constants';
import { assignMetadata } from '@nestjs/common';

export const createParamDecorator =
  (paramtype: AgendaParamtypeEnum) =>
  (data?: ParamData): ParameterDecorator =>
  (target, key, index) => {
    const args =
      Reflect.getMetadata(
        AGENDA_PARAM_ARGS_METADATA,
        target.constructor,
        key,
      ) || {};

    Reflect.defineMetadata(
      AGENDA_PARAM_ARGS_METADATA,
      assignMetadata(args, paramtype, index, data),
      target.constructor,
      key,
    );
  };
