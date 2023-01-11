import { createParamDecorator } from '../../utils/create-param-decorator.util';
import { AgendaParamtypeEnum } from '../../enums/agenda-paramtype.enum';

export const Context: () => ParameterDecorator = createParamDecorator(
  AgendaParamtypeEnum.CONTEXT,
);
