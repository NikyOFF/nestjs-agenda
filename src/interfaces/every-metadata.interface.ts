import { JobAttributesData, JobOptions } from 'agenda';

export interface EveryMetadataInterface<T extends JobAttributesData> {
  interval: string;
  data?: T;
  options?: JobOptions;
}
