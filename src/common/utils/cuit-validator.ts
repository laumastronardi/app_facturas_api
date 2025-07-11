/**
 * Utilidades para validación de CUIT argentino
 */

/**
 * Valida el formato y dígito verificador de un CUIT argentino
 * @param cuit CUIT en formato XX-XXXXXXXX-X o solo números
 * @returns true si el CUIT es válido, false en caso contrario
 */
export function validateCuit(cuit: string): boolean {
  if (!cuit) return false;

  // Limpiar el CUIT de guiones y espacios
  const cleanCuit = cuit.replace(/[-\s]/g, '');

  // Verificar que tenga exactamente 11 dígitos
  if (!/^\d{11}$/.test(cleanCuit)) {
    return false;
  }

  // Extraer los primeros 10 dígitos y el dígito verificador
  const numbers = cleanCuit.substring(0, 10).split('').map(Number);
  const verifierDigit = parseInt(cleanCuit.substring(10, 11));

  // Multiplicadores para el cálculo del dígito verificador
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  // Calcular la suma ponderada
  const sum = numbers.reduce((acc, digit, index) => acc + digit * multipliers[index], 0);

  // Calcular el resto
  const remainder = sum % 11;

  // Determinar el dígito verificador esperado
  let expectedVerifier: number;
  if (remainder < 2) {
    expectedVerifier = remainder;
  } else {
    expectedVerifier = 11 - remainder;
  }

  return verifierDigit === expectedVerifier;
}

/**
 * Formatea un CUIT al formato estándar XX-XXXXXXXX-X
 * @param cuit CUIT sin formato
 * @returns CUIT formateado
 */
export function formatCuit(cuit: string): string {
  if (!cuit) return '';
  
  const cleanCuit = cuit.replace(/[-\s]/g, '');
  
  if (cleanCuit.length !== 11) {
    return cuit; // Retornar tal como vino si no tiene 11 dígitos
  }
  
  return `${cleanCuit.substring(0, 2)}-${cleanCuit.substring(2, 10)}-${cleanCuit.substring(10)}`;
}

/**
 * Tipos de persona según el primer par de dígitos del CUIT
 */
export function getCuitType(cuit: string): string {
  const cleanCuit = cuit.replace(/[-\s]/g, '');
  const prefix = cleanCuit.substring(0, 2);
  
  const types: { [key: string]: string } = {
    '20': 'Persona Física Masculino',
    '23': 'Persona Física Masculino',
    '24': 'Persona Física Masculino', 
    '27': 'Persona Física Femenino',
    '30': 'Persona Jurídica',
    '33': 'Persona Jurídica',
    '34': 'Persona Jurídica'
  };
  
  return types[prefix] || 'Tipo desconocido';
}
