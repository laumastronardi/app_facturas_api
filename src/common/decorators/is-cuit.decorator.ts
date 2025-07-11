import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { validateCuit } from '../utils/cuit-validator';

/**
 * Decorador personalizado para validar CUIT argentino
 * Valida tanto el formato como el dígito verificador
 */
export function IsCuit(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCuit',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return validateCuit(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser un CUIT argentino válido (formato: XX-XXXXXXXX-X)`;
        },
      },
    });
  };
}
