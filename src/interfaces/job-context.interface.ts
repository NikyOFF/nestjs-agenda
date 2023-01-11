import { Job, JobAttributesData } from 'agenda';

export interface JobContext<T extends JobAttributesData = JobAttributesData> {
  job: Job<T>;
  done: () => void;
}
