import { ErrorClassifier } from '../../src/error/ErrorClassifier';
import { ErrorType } from '../../src/error/ErrorType';
import { NonRenderError } from '../../src/error/NonRenderError';
import { RenderError } from '../../src/error/RenderError';
import type { ClassificationRule } from '../../src/error/ClassificationRule';

describe('ErrorClassifier — custom rules', () => {
  afterEach(() => {
    ErrorClassifier.clearCustomRules();
  });

  it('classifies 429 as NON_RENDER via custom rule (overrides 4xx default)', () => {
    const rateLimitRule: ClassificationRule = {
      name: 'rate-limit',
      match: (error) => (error as Record<string, unknown>)?.status === 429,
      type: ErrorType.NON_RENDER,
    };

    ErrorClassifier.addRule(rateLimitRule);

    expect(ErrorClassifier.classify({ status: 429 })).toBe(ErrorType.NON_RENDER);
  });

  it('custom rule takes precedence over default classification', () => {
    const overrideRule: ClassificationRule = {
      name: 'override-400',
      match: (error) => (error as Record<string, unknown>)?.status === 400,
      type: ErrorType.NONE,
    };

    ErrorClassifier.addRule(overrideRule);

    expect(ErrorClassifier.classify({ status: 400 })).toBe(ErrorType.NONE);
  });

  it('falls through to default classification when no custom rule matches', () => {
    const nonMatchingRule: ClassificationRule = {
      name: 'never-matches',
      match: () => false,
      type: ErrorType.NON_RENDER,
    };

    ErrorClassifier.addRule(nonMatchingRule);

    expect(ErrorClassifier.classify({ status: 500 })).toBe(ErrorType.NON_RENDER);
  });

  it('skips a broken rule and continues to the next one', () => {
    const brokenRule: ClassificationRule = {
      name: 'broken',
      match: () => {
        throw new Error('match function is broken');
      },
      type: ErrorType.NONE,
    };

    const workingRule: ClassificationRule = {
      name: 'working',
      match: (error) => (error as Record<string, unknown>)?.status === 503,
      type: ErrorType.RENDER,
    };

    ErrorClassifier.addRule(brokenRule);
    ErrorClassifier.addRule(workingRule);

    expect(ErrorClassifier.classify({ status: 503 })).toBe(ErrorType.RENDER);
  });

  it('addRule() registers a rule; clearCustomRules() removes all custom rules', () => {
    const rule: ClassificationRule = {
      name: 'clear-test',
      match: (error) => (error as Record<string, unknown>)?.status === 422,
      type: ErrorType.NON_RENDER,
    };

    ErrorClassifier.addRule(rule);
    expect(ErrorClassifier.classify({ status: 422 })).toBe(ErrorType.NON_RENDER);

    ErrorClassifier.clearCustomRules();
    expect(ErrorClassifier.classify({ status: 422 })).toBe(ErrorType.RENDER);
  });

  it('last-added rule has highest priority (LIFO order)', () => {
    const firstRule: ClassificationRule = {
      name: 'first',
      match: (error) => (error as Record<string, unknown>)?.status === 403,
      type: ErrorType.NON_RENDER,
    };
    const secondRule: ClassificationRule = {
      name: 'second',
      match: (error) => (error as Record<string, unknown>)?.status === 403,
      type: ErrorType.NONE,
    };

    ErrorClassifier.addRule(firstRule);
    ErrorClassifier.addRule(secondRule);

    expect(ErrorClassifier.classify({ status: 403 })).toBe(ErrorType.NONE);
  });

  it('does not break default BaseError classification when custom rules are registered', () => {
    const irrelevantRule: ClassificationRule = {
      name: 'irrelevant',
      match: (error) => (error as Record<string, unknown>)?.status === 999,
      type: ErrorType.NONE,
    };

    ErrorClassifier.addRule(irrelevantRule);

    expect(ErrorClassifier.classify(new RenderError('visible'))).toBe(ErrorType.RENDER);
    expect(ErrorClassifier.classify(new NonRenderError('silent'))).toBe(ErrorType.NON_RENDER);
  });
});
