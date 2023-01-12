import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator';
import { AgendaParamtypeEnum } from '../enums';
import { ParamData } from '@nestjs/common';
import { Job } from 'agenda';

export class AgendaParamsFactory implements ParamsFactory {
  public exchangeKeyForValue(
    type: AgendaParamtypeEnum,
    data: ParamData,
    args: any,
  ): any {
    const job = args[0] as Job;
    const done = args[1] as Function;

    switch (type) {
      case AgendaParamtypeEnum.CONTEXT:
        return { job, done };
      default:
        return null;
    }
  }
}
