import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

const DEFAULT_ERRORS = {
  required: () => 'Este campo es obligatorio.',
  email: () => 'Invalid email.',
  minlength: (error: any) => `Este campo debe tener al menos ${error.requiredLength} caracteres.`,
  maxlength: (error: any) => `Este campo debe tener como máximo ${error.requiredLength} caracteres.`,
  minArrayLength: (minArrayLength: any) => `This field must contain at least ${minArrayLength} elements.`,
  maxArrayLength: (maxArrayLength: any) => `This field should not have more than ${maxArrayLength} elements.`,
  min: (error: any) => `Este campo debe tener al menos ${error.min}.`,
  max: (error: any) => `Este campo debe ser como máximo ${error.max}.`,
  pattern: () => 'Caracteres no válidos.',
  ONLY_LETTERS: () => 'Sólo se permiten letras.',
  ONLY_NUMBERS: () => 'Sólo se permiten números.',
  ONLY_NUMBERS_DECIMALS: () => 'Sólo se permiten números con hasta 2 decimales.',
  INVALID_EMAIL: () => 'Invalid email.',
  INVALID_DATE: () => 'Invalid date.',
  DATE_AFTER: (date: any) => `The date must be after ${date}`,
  DATE_BEFORE: (date: any) => `The date must be before ${date}`,

  // Related to phone number
  PHONE_NOT_VALID: () => 'Invalid phone number.',
  PHONE_NOT_A_NUMBER: () => 'Invalid phone number.',
  PHONE_TOO_SHORT: () => 'Invalid phone number.',
  PHONE_TOO_LONG: () => 'Invalid phone number.',
  PHONE_INVALID_LENGTH: () => 'Invalid phone number.',
  PHONE_INVALID_COUNTRY: () => 'Invalid country.',

  // Errors related to files
  FILE_INVALID_FORMAT: (fileName: string) => `The file "${fileName}" has an invalid format.`,
  FILE_MAX_FILES: (files: string) => `The maximum number of files allowed is ${files}`,
  FILE_INVALID_SIZE: ([fileName, maxSize]: string[]) =>
    `The file "${fileName}" exceeds the maximum allowed size of ${maxSize}.`,
  FILE_DUPLICATED: () => `One or more of the uploaded documents is duplicated`,
  MAX_FILES_PER_TYPE_EXCEEDED: (maxFiles: number) => `The maximum number of files of the same type is ${maxFiles}`,
  FILE_DOC_TYPE_REQUIRED: () => `Select the type for each document`,

  // Errors related to percentages
  INSUFFICIENT_PERCENTAGE: () => 'The sum of the percentages does not complete 100%',

  // duplicate file
  DUPLICATE_FILE: (fileName: string) => `The file "${fileName}" is duplicated.`,

  AMOUNT_GREATER_THAN_PRICE: () => 'The amount cannot be greater than the price.',

  // password errors

  passwordStrength: () => 'La contraseña debe incluir al menos una letra mayúscula, un número y un carácter especial.',
};

@Injectable({
  providedIn: 'platform',
})
export class InputErrorLocatorService {
  public locate(error?: ValidationErrors | undefined | null): string {
    if (!error) return '';

    const message = error['message'];

    if (message) return message;

    for (const entry of Object.entries(DEFAULT_ERRORS)) {
      const [key, value] = entry;
      if (error[key]) return value(error[key]);
    }

    const errorAsMessage = Object.values(error).find((value) => typeof value === 'string');
    if (errorAsMessage) return errorAsMessage;

    throw new Error(`Unknown input error: ${JSON.stringify(error)}`);
  }
}
