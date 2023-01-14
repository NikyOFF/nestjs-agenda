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
    const metadata: ProcessorMetadataInterface = {
      name: name,
      options: options,
    };

    Reflect.defineMetadata(PROCESSOR_METADATA, metadata, descriptor.value);

    return descriptor;
  };
