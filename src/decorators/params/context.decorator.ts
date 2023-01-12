import { createParamDecorator } from '../../utils';
import { AgendaParamtypeEnum } from '../../enums';

export const Context: () => ParameterDecorator = createParamDecorator(
  AgendaParamtypeEnum.CONTEXT,
);
