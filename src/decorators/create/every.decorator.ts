import { PROCESSOR_SCHEDULE_METADATA } from '../../constants';
import { JobAttributesData, JobOptions } from 'agenda';

export const Every =
  <T extends JobAttributesData>(
    interval: string,
    options?: JobOptions,
    data?: T,
  ): MethodDecorator =>
  (
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    Reflect.defineMetadata(
      PROCESSOR_SCHEDULE_METADATA,
      [
        ...(Reflect.getMetadata(
          PROCESSOR_SCHEDULE_METADATA,
          descriptor.value,
        ) || []),
        {
          type: 'every',
          interval: interval,
          options: options,
          data: data,
        },
      ],
      descriptor.value,
    );

    return descriptor;
  };
