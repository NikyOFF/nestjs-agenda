import { JobAttributesData } from 'agenda';

export interface NowMetadataInterface<T extends JobAttributesData> {
  data?: T;
}
