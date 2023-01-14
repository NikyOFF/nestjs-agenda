import { PROCESSOR_SCHEDULE_METADATA } from '../../constants';
import { JobAttributesData } from 'agenda';

export const Schedule =
  <T extends JobAttributesData>(when: string, data?: T): MethodDecorator =>
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
          type: 'schedule',
          when: when,
          data: data,
        },
      ],
      descriptor.value,
    );

    return descriptor;
  };
