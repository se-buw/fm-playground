/******************************************************************************
 * This file was generated by langium-cli 3.2.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import type { LangiumSharedCoreServices, LangiumCoreServices, LangiumGeneratedCoreServices, LangiumGeneratedSharedCoreServices, LanguageMetaData, Module } from 'langium';
import { SmtAstReflection } from './ast.js';
import { SmtGrammar } from './grammar.js';

export const SmtLanguageMetaData = {
    languageId: 'smt',
    fileExtensions: ['.smt2'],
    caseInsensitive: false
} as const satisfies LanguageMetaData;

export const SmtGeneratedSharedModule: Module<LangiumSharedCoreServices, LangiumGeneratedSharedCoreServices> = {
    AstReflection: () => new SmtAstReflection()
};

export const SmtGeneratedModule: Module<LangiumCoreServices, LangiumGeneratedCoreServices> = {
    Grammar: () => SmtGrammar(),
    LanguageMetaData: () => SmtLanguageMetaData,
    parser: {}
};