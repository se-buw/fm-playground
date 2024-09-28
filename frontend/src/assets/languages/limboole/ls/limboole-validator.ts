import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { LimbooleAstType, Expr, And, Or, Implies, Iff } from './generated/ast.js';
import { isAnd, isOr, isIff, isImplies } from './generated/ast.js';
import type { LimbooleServices } from './limboole-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: LimbooleServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.LimbooleValidator;
  const checks: ValidationChecks<LimbooleAstType> = {
    Expr: [validator.checkPersonStartsWithNot, validator.operatorShouldBeBetweenOperands]
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class LimbooleValidator {
  operatorShouldBeBetweenOperands(expr: Expr, accept: ValidationAcceptor): void {
    if (isAnd(expr) || isOr(expr) || isIff(expr) || isImplies(expr)) {
      validateBinaryOperands(expr, accept, expr.$type);
    }
  }

  checkPersonStartsWithNot(expr: Expr, accept: ValidationAcceptor): void {
    if (expr.var) {
      // console.log('First character of expr.var:', expr.var);
      if (expr.var.startsWith('!')) {
        accept('warning', 'Variable name should start with a capital.', { node: expr, property: 'var' });
      }
    }
  }
}
function validateBinaryOperands(
  expr: And | Or | Iff | Implies,
  accept: ValidationAcceptor,
  operatorName: string
): void {
  if (!expr.left) {
    accept('error', `Left operand is missing for the ${operatorName} operator.`, {
      node: expr,
      property: 'left',
    });
  }
  if (!expr.right) {
    accept('error', `Right operand is missing for the ${operatorName} operator.`, {
      node: expr,
      property: 'right',
    });
  }
}