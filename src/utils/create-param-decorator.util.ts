import { AgendaParamtypeEnum } from '../enums/agenda-paramtype.enum';
import { ParamData } from '../types/param-data.type';
import { PARAM_ARGS_METADATA } from '../constants';
import { assignMetadata } from '@nestjs/common';

export const createParamDecorator =
  (paramtype: AgendaParamtypeEnum) =>
  (data?: ParamData): ParameterDecorator =>
  (target, key, index) => {
    const args =
      Reflect.getMetadata(PARAM_ARGS_METADATA, target.constructor, key) || {};

    Reflect.defineMetadata(
      PARAM_ARGS_METADATA,
      assignMetadata(args, paramtype, index, data),
      target.constructor,
      key,
    );
  };
