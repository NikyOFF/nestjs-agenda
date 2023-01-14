import { JobAttributesData } from 'agenda';

export interface ScheduleMetadataInterface<T extends JobAttributesData> {
  when: string;
  data?: T;
}
