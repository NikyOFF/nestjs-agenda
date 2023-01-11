import { Inject } from '@nestjs/common';
import { AGENDA } from '../../constants';

export const InjectAgenda = () => Inject(AGENDA);
