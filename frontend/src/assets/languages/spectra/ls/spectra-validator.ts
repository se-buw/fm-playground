import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { SpectraServices } from './spectra-module.js';
import {
    SpectraAstType,
    Model,
    isTemporalPrimaryExpr,
    TemporalPrimaryExpr
} from './generated/ast.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SpectraServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SpectraValidator;
    const checks: ValidationChecks<SpectraAstType> = {
        Model: validator.checkDwyerPatternsImport,
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SpectraValidator {

    checkDwyerPatternsImport(model: Model, accept: ValidationAcceptor): void {
        const functionCalls = this.collectFunctionCalls(model);
        const dwyerPatternNames = [
            'P_is_false_globally', 'P_is_false_before_R', 'P_is_false_after_Q', 'P_is_false_between_Q_and_R', 'P_is_false_after_Q_until_R', 'P_becomes_true_globally', 'P_becomes_true_before_R', 'P_becomes_true_After_Q', 'P_becomes_true_between_Q_and_R', 'P_becomes_true_after_Q_until_R', 'P_occures_at_most_twice_globally', 'P_occures_at_most_twice_before_R', 'P_occures_at_most_twice_after_Q', 'P_occures_at_most_twice_between_Q_and_R', 'P_is_true_globally', 'P_is_true_before_R', 'P_is_true_after_Q', 'P_is_true_between_Q_and_R', 'P_is_true_After_Q_until_R', 'S_precedes_to_P_globally', 'S_precedes_to_P_before_R', 'S_precedes_to_P_between_Q_and_R', 'S_precedes_to_P_after_Q_until_R', 'S_responds_to_P_globally', 'S_responds_to_P_before_R', 'S_responds_to_P_after_Q', 'S_responds_to_P_between_Q_and_R', 'S_responds_to_P_after_Q_until_R', 'S_and_T_precedes_to_P_globally', 'S_and_T_precedes_to_P_before_R', 'S_and_T_precedes_to_P_after_Q', 'S_and_T_precedes_to_P_between_Q_and_R', 'S_and_T_precedes_to_P_after_Q_until_R', 'P_precedes_S_and_T_globally', 'P_precedes_S_and_T_before_R', 'P_precedes_S_and_T_after_q', 'P_precedes_S_and_T_between_q_and_R', 'P_precedes_S_and_T_after_q_until_R', 'P_responds_to_S_and_T_globally', 'P_responds_to_S_and_T_before_r', 'P_responds_to_S_and_T_after_Q', 'P_responds_to_S_and_T_between_Q_and_R', 'P_responds_to_S_and_T_after_Q_until_R', 'S_and_T_responds_to_P_globally', 'S_and_T_responds_to_P_before_R', 'S_and_T_responds_to_P_after_q', 'S_and_T_responds_to_P_between_q_and_R', 'S_and_T_without_Z_responds_to_P_globally', 'S_and_T_without_Z_responds_to_P_before_R', 'S_and_T_without_Z_responds_to_P_after_Q', 'S_and_T_without_Z_responds_to_P_between_Q_and_R', 'notP_globally', 'notP_beforeR', 'pBecomesTrue_betweenQandR', 'pHolds_afterQuntilR', 'pRespondsToS'

            // Too general
            //'pattern10', 'pattern11', 'pattern12', 'pattern13', 'pattern14', 'pattern16', 'pattern17', 'pattern18', 'pattern19', 'pattern21', 'pattern22', 'pattern24', 'pattern25', 'pattern27', 'pattern28', 'pattern29', 'pattern30', 'pattern31', 'pattern32', 'pattern33', 'pattern34', 'pattern35', 'pattern36', 'pattern37', 'pattern38', 'pattern39', 'pattern40', 'pattern41', 'pattern42', 'pattern43', 'pattern44', 'pattern45', 'pattern46', 'pattern47', 'pattern48', 'pattern49', 'pattern51', 'pattern52', 'pattern53', 'pattern54', 'pattern03', 'pattern04', 'pattern05', 'pattern06', 'pattern07', 'pattern08'
        ]

        const dwyerPatternCalls = functionCalls.filter(call => {
            const funcName = call.predPatt?.$refText;
            return funcName && dwyerPatternNames.includes(funcName);
        })


        if (dwyerPatternCalls.length > 0) {
            const imports = (model.$document?.parseResult?.value as Model)?.imports;
            const importUrls = imports.map((imp: any) => imp.importURI);

            if (importUrls.length === 0 || !importUrls.some((url: string) => url.includes('DwyerPatterns.spectra'))) {
                dwyerPatternCalls.forEach(call =>
                    accept('error',
                        'Dwyer patterns are used but no import statement is found. Please import "DwyerPatterns.spectra"',
                        {
                            node: call,
                            property: 'predPatt',
                            code: 'ImportError'
                        }
                    )
                );
            }
        }

    }

    private collectFunctionCalls(model: Model): TemporalPrimaryExpr[] {
        const result: TemporalPrimaryExpr[] = [];

        const visit = (node: any): void => {
            if (!node || typeof node !== 'object') return;

            if (isTemporalPrimaryExpr(node) && node.predPatt) {
                result.push(node);
            }

            for (const key in node) {
                if (key.startsWith('$')) continue; // Skip Langium metadata

                const value = node[key];
                if (Array.isArray(value)) {
                    value.forEach(item => visit(item));
                } else {
                    visit(value);
                }
            }
        }
        visit(model);
        return result;
    }
}

