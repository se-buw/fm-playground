import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { SmtAstType, Model } from './generated/ast.js';
import type { SmtServices } from './smt-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SmtServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SmtValidator;
    const checks: ValidationChecks<SmtAstType> = {
        Model: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SmtValidator {

    checkPersonStartsWithCapital(model: Model, accept: ValidationAcceptor): void {
        // if (Model[Symbol] !== model[Symbol]) {
        //     const firstChar = model.elements.substring(0, 1);
        //     if (firstChar.toUpperCase() !== firstChar) {
        //         accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
        //     }
        // }
    }

}
