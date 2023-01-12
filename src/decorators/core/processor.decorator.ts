import { DefineOptions } from 'agenda/dist/agenda/define';
import { PROCESSOR_METADATA } from '../../constants';
import { ProcessorMetadataInterface } from '../../interfaces';

export const Processor =
  (name: string, options?: DefineOptions): MethodDecorator =>
  (
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const metadata: ProcessorMetadataInterface[] = [
      {
        name: name,
        options: options,
      },
    ];

    const previousValue =
      Reflect.getMetadata(PROCESSOR_METADATA, descriptor.value) || [];

    const value = [...previousValue, ...metadata];

    Reflect.defineMetadata(PROCESSOR_METADATA, value, descriptor.value);

    return descriptor;
  };
