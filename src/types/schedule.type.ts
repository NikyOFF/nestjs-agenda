import { JobAttributesData } from 'agenda';
import {
  EveryMetadataInterface,
  NowMetadataInterface,
  ScheduleMetadataInterface,
} from '../interfaces';

export type ScheduleType<T extends JobAttributesData = JobAttributesData> =
  | ({ type: 'now' } & NowMetadataInterface<T>)
  | ({ type: 'every' } & EveryMetadataInterface<T>)
  | ({ type: 'schedule' } & ScheduleMetadataInterface<T>);
