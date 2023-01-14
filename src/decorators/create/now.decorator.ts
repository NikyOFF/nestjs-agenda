import { PROCESSOR_SCHEDULE_METADATA } from '../../constants';
import { JobAttributesData } from 'agenda';

export const Now =
  <T extends JobAttributesData>(data?: T): MethodDecorator =>
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
          type: 'now',
          data: data,
        },
      ],
      descriptor.value,
    );

    return descriptor;
  };
