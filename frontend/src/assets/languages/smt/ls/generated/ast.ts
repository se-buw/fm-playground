/******************************************************************************
 * This file was generated by langium-cli 3.2.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable */
import type { AstNode, ReferenceInfo, TypeMetaData } from 'langium';
import { AbstractAstReflection } from 'langium';

export const SmtTerminals = {
    PSEUDO_BOOL_KEYWORD: /((pbeq|pbge)|pble)/,
    CARDINALITY_KEYWORD: /(at-least|at-most)/,
    OptionTerminal: /((((((((((((((((((((:diagnostic-output-channel("([^"\\]|\\.|(WS|PRINTABLE_CHAR))+"))|(:global-declarations((true|false))))|(:interactive-mode((true|false))))|(:print-success((true|false))))|(:produce-assertions((true|false))))|(:produce-assignments((true|false))))|(:produce-models((true|false))))|(:produce-proofs((true|false))))|(:produce-unsat-assumptions((true|false))))|(:produce-unsat-cores((true|false))))|(:random-seed(0|[0-9][0-9]*)))|(:regular-output-channel("([^"\\]|\\.|(WS|PRINTABLE_CHAR))+")))|(:reproducible-resource-limit(0|[0-9][0-9]*)))|(:smt-auto-config((true|false))))|(:smt\.mbqi((true|false))))|(:smt\.macro-finder((true|false))))|(:model\.compact((true|false))))|(:opt\.priority((((((((((((((((((((([a-zA-Z])|\+)|-)|\/)|\*)|,)|=)|%)|\?)|!)|\.)|\$)|_)|~)|&)|\^)|<)|>)|@)((((((((((((((((((([a-zA-Z])|([0-9]))|\+)|-)|\/)|\*)|=)|%)|\?)|!)|\.)|\$)|_)|~)|&)|\^)|<)|>)|@)*))))|(:pp\.bv-literals((true|false))))|(:verbosity(0|[0-9][0-9]*)))/,
    PAR_OPEN: /\(/,
    PAR_CLOSE: /\)/,
    NUMERAL: /0|[0-9][0-9]*/,
    DECIMAL: /((0|[0-9][0-9]*)\.(0|[0-9][0-9]*))/,
    HEXADECIMAL: /#x[0-9a-fA-F]+/,
    BINARY: /#b[01]+/,
    STRING: /"([^"\\]|\\.|(WS|PRINTABLE_CHAR))+"/,
    WS: /\s+/,
    SIMPLE_SYMBOL: /(((((((((((((((((((([a-zA-Z])|\+)|-)|\/)|\*)|,)|=)|%)|\?)|!)|\.)|\$)|_)|~)|&)|\^)|<)|>)|@)((((((((((((((((((([a-zA-Z])|([0-9]))|\+)|-)|\/)|\*)|=)|%)|\?)|!)|\.)|\$)|_)|~)|&)|\^)|<)|>)|@)*)/,
    SL_COMMENT: /;[^\n\r]*/,
};

export type SmtTerminalNames = keyof typeof SmtTerminals;

export type SmtKeywordNames = 
    | ":"
    | "_"
    | "all-statistics"
    | "assert"
    | "assertion-stack-levels"
    | "authors"
    | "check-sat"
    | "check-sat-assuming"
    | "declare-const"
    | "declare-datatype"
    | "declare-datatypes"
    | "declare-fun"
    | "declare-sort"
    | "define-fun"
    | "define-fun-rec"
    | "define-funs-rec"
    | "define-sort"
    | "echo"
    | "error-behavior"
    | "eval"
    | "exists"
    | "exit"
    | "forall"
    | "get-assertions"
    | "get-assignment"
    | "get-info"
    | "get-model"
    | "get-option"
    | "get-proof"
    | "get-unsat-assumptions"
    | "get-unsat-core"
    | "get-value"
    | "let"
    | "match"
    | "maximize"
    | "minimize"
    | "name"
    | "par"
    | "pop"
    | "push"
    | "reason-unknown"
    | "reset"
    | "reset-assertions"
    | "set-info"
    | "set-logic"
    | "set-option"
    | "version";

export type SmtTokenNames = SmtTerminalNames | SmtKeywordNames;

export type BasicCommand = 'check-sat' | 'exit' | 'get-assertions' | 'get-assignment' | 'get-model' | 'get-proof' | 'get-unsat-assumptions' | 'get-unsat-core' | 'reset' | 'reset-assertions';

export function isBasicCommand(item: unknown): item is BasicCommand {
    return item === 'check-sat' || item === 'reset' || item === 'reset-assertions' || item === 'get-model' || item === 'exit' || item === 'get-assertions' || item === 'get-assignment' || item === 'get-proof' || item === 'get-unsat-assumptions' || item === 'get-unsat-core';
}

export type InfoFlag = Keyword;

export const InfoFlag = 'InfoFlag';

export function isInfoFlag(item: unknown): item is InfoFlag {
    return reflection.isInstance(item, InfoFlag);
}

export type Option = Attribute;

export const Option = 'Option';

export function isOption(item: unknown): item is Option {
    return reflection.isInstance(item, Option);
}

export type SmtSymbol = string;

export function isSmtSymbol(item: unknown): item is SmtSymbol {
    return (typeof item === 'string' && (/(((((((((((((((((((([a-zA-Z])|\+)|-)|\/)|\*)|,)|=)|%)|\?)|!)|\.)|\$)|_)|~)|&)|\^)|<)|>)|@)((((((((((((((((((([a-zA-Z])|([0-9]))|\+)|-)|\/)|\*)|=)|%)|\?)|!)|\.)|\$)|_)|~)|&)|\^)|<)|>)|@)*)/.test(item)));
}

export type SpecConstant = number | string;


export interface Attribute extends AstNode {
    readonly $container: Command;
    readonly $type: 'Attribute';
    keyWord: Keyword;
    value?: AttributeValue;
}

export const Attribute = 'Attribute';

export function isAttribute(item: unknown): item is Attribute {
    return reflection.isInstance(item, Attribute);
}

export interface AttributeValue extends AstNode {
    readonly $container: Attribute;
    readonly $type: 'AttributeValue';
    const?: SpecConstant;
    exprs: Array<SExpr>;
    symbol?: SmtSymbol;
}

export const AttributeValue = 'AttributeValue';

export function isAttributeValue(item: unknown): item is AttributeValue {
    return reflection.isInstance(item, AttributeValue);
}

export interface Command extends AstNode {
    readonly $type: 'CmdAssert' | 'CmdCheckSat' | 'CmdConstDecl' | 'CmdFunDecl' | 'Command' | 'FunctionDef' | 'QualIdentifier' | 'QuantifiedTerm' | 'SmtSymbol' | 'Sort' | 'SpecConstant' | 'Term';
    basicCommand?: BasicCommand;
    dataTypeDec?: Array<DataTypeDec | DataTypeDecZ3> | DataTypeDec | DataTypeDecZ3;
    functionDec: Array<FunctionDec>;
    infoFlag?: InfoFlag;
    name?: Attribute | Keyword | SmtSymbol;
    number?: number;
    option?: Option;
    sortDec: Array<SortDec>;
    sortDecZ3: Array<SortDecZ3>;
    symbol?: Array<SmtSymbol> | SmtSymbol;
    term?: Array<Term> | Term;
}

export const Command = 'Command';

export function isCommand(item: unknown): item is Command {
    return reflection.isInstance(item, Command);
}

export interface ConstructorDec extends AstNode {
    readonly $container: DataTypeDec;
    readonly $type: 'ConstructorDec';
    selectorDec: Array<SelectorDec>;
    symbol: SmtSymbol;
}

export const ConstructorDec = 'ConstructorDec';

export function isConstructorDec(item: unknown): item is ConstructorDec {
    return reflection.isInstance(item, ConstructorDec);
}

export interface ConstructorDecZ3 extends AstNode {
    readonly $container: DataTypeDecZ3;
    readonly $type: 'ConstructorDecZ3';
    selectorDec: Array<SelectorDecZ3>;
    symbol: SmtSymbol;
}

export const ConstructorDecZ3 = 'ConstructorDecZ3';

export function isConstructorDecZ3(item: unknown): item is ConstructorDecZ3 {
    return reflection.isInstance(item, ConstructorDecZ3);
}

export interface DataTypeDec extends AstNode {
    readonly $container: Command;
    readonly $type: 'DataTypeDec';
    constructorDecs: Array<ConstructorDec>;
    symbol: Array<SmtSymbol>;
}

export const DataTypeDec = 'DataTypeDec';

export function isDataTypeDec(item: unknown): item is DataTypeDec {
    return reflection.isInstance(item, DataTypeDec);
}

export interface DataTypeDecZ3 extends AstNode {
    readonly $container: Command;
    readonly $type: 'DataTypeDecZ3';
    constructorDecs: Array<ConstructorDecZ3>;
}

export const DataTypeDecZ3 = 'DataTypeDecZ3';

export function isDataTypeDecZ3(item: unknown): item is DataTypeDecZ3 {
    return reflection.isInstance(item, DataTypeDecZ3);
}

export interface FunctionDec extends AstNode {
    readonly $container: CmdConstDecl | CmdFunDecl | Command | SelectorDec | SelectorDecZ3 | Sort | SortedVar;
    readonly $type: 'FunctionDec' | 'Sort';
    functionSymbol: SmtSymbol;
    var: Array<SortedVar>;
}

export const FunctionDec = 'FunctionDec';

export function isFunctionDec(item: unknown): item is FunctionDec {
    return reflection.isInstance(item, FunctionDec);
}

export interface Identifier extends AstNode {
    readonly $container: Sort;
    readonly $type: 'Identifier';
    indices: Array<Index>;
    symbol: SmtSymbol;
}

export const Identifier = 'Identifier';

export function isIdentifier(item: unknown): item is Identifier {
    return reflection.isInstance(item, Identifier);
}

export interface Index extends AstNode {
    readonly $container: Identifier;
    readonly $type: 'Index';
    num?: number;
    symbol?: SmtSymbol;
}

export const Index = 'Index';

export function isIndex(item: unknown): item is Index {
    return reflection.isInstance(item, Index);
}

export interface Keyword extends AstNode {
    readonly $container: Attribute | Command | SExpr;
    readonly $type: 'Keyword';
    symbol: SmtSymbol;
}

export const Keyword = 'Keyword';

export function isKeyword(item: unknown): item is Keyword {
    return reflection.isInstance(item, Keyword);
}

export interface MatchCase extends AstNode {
    readonly $container: Term;
    readonly $type: 'MatchCase';
    pattern: Pattern;
    term: Term;
}

export const MatchCase = 'MatchCase';

export function isMatchCase(item: unknown): item is MatchCase {
    return reflection.isInstance(item, MatchCase);
}

export interface Model extends AstNode {
    readonly $type: 'Model';
    commands: Array<Command>;
}

export const Model = 'Model';

export function isModel(item: unknown): item is Model {
    return reflection.isInstance(item, Model);
}

export interface Pattern extends AstNode {
    readonly $container: MatchCase;
    readonly $type: 'Pattern';
    symbol: SmtSymbol;
    symbols: Array<SmtSymbol>;
}

export const Pattern = 'Pattern';

export function isPattern(item: unknown): item is Pattern {
    return reflection.isInstance(item, Pattern);
}

export interface PropLiteral extends AstNode {
    readonly $type: 'PropLiteral';
    symbol: SmtSymbol;
}

export const PropLiteral = 'PropLiteral';

export function isPropLiteral(item: unknown): item is PropLiteral {
    return reflection.isInstance(item, PropLiteral);
}

export interface SelectorDec extends AstNode {
    readonly $container: ConstructorDec;
    readonly $type: 'SelectorDec';
    sort: Sort;
    symbol: SmtSymbol;
}

export const SelectorDec = 'SelectorDec';

export function isSelectorDec(item: unknown): item is SelectorDec {
    return reflection.isInstance(item, SelectorDec);
}

export interface SelectorDecZ3 extends AstNode {
    readonly $container: ConstructorDecZ3;
    readonly $type: 'SelectorDecZ3';
    sort: Array<Sort>;
    symbol: SmtSymbol;
}

export const SelectorDecZ3 = 'SelectorDecZ3';

export function isSelectorDecZ3(item: unknown): item is SelectorDecZ3 {
    return reflection.isInstance(item, SelectorDecZ3);
}

export interface SExpr extends AstNode {
    readonly $container: AttributeValue | SExpr;
    readonly $type: 'SExpr';
    const?: SpecConstant;
    exprs: Array<SExpr>;
    keyWord?: Keyword;
    symbol?: SmtSymbol;
}

export const SExpr = 'SExpr';

export function isSExpr(item: unknown): item is SExpr {
    return reflection.isInstance(item, SExpr);
}

export interface SortDec extends AstNode {
    readonly $container: Command;
    readonly $type: 'SortDec';
    num: number;
    symbol: SmtSymbol;
}

export const SortDec = 'SortDec';

export function isSortDec(item: unknown): item is SortDec {
    return reflection.isInstance(item, SortDec);
}

export interface SortDecZ3 extends AstNode {
    readonly $container: Command;
    readonly $type: 'SortDecZ3';
    symbol: Array<SmtSymbol>;
}

export const SortDecZ3 = 'SortDecZ3';

export function isSortDecZ3(item: unknown): item is SortDecZ3 {
    return reflection.isInstance(item, SortDecZ3);
}

export interface SortedVar extends AstNode {
    readonly $container: FunctionDec | FunctionDef | QuantifiedTerm;
    readonly $type: 'SortedVar';
    sort: Sort;
    symbol: SmtSymbol;
}

export const SortedVar = 'SortedVar';

export function isSortedVar(item: unknown): item is SortedVar {
    return reflection.isInstance(item, SortedVar);
}

export interface VarBinding extends AstNode {
    readonly $container: Term;
    readonly $type: 'VarBinding';
    symbol: SmtSymbol;
    term: Term;
}

export const VarBinding = 'VarBinding';

export function isVarBinding(item: unknown): item is VarBinding {
    return reflection.isInstance(item, VarBinding);
}

export interface CmdAssert extends Command {
    readonly $type: 'CmdAssert';
    term: Term;
}

export const CmdAssert = 'CmdAssert';

export function isCmdAssert(item: unknown): item is CmdAssert {
    return reflection.isInstance(item, CmdAssert);
}

export interface CmdCheckSat extends Command {
    readonly $type: 'CmdCheckSat';
    propLiteral: Array<Term>;
}

export const CmdCheckSat = 'CmdCheckSat';

export function isCmdCheckSat(item: unknown): item is CmdCheckSat {
    return reflection.isInstance(item, CmdCheckSat);
}

export interface CmdConstDecl extends Command {
    readonly $type: 'CmdConstDecl';
    sorts: Array<Sort>;
    symbol: SmtSymbol;
}

export const CmdConstDecl = 'CmdConstDecl';

export function isCmdConstDecl(item: unknown): item is CmdConstDecl {
    return reflection.isInstance(item, CmdConstDecl);
}

export interface CmdFunDecl extends Command {
    readonly $type: 'CmdFunDecl';
    paramSorts: Array<Sort>;
    returnSort: Sort;
    symbol: SmtSymbol;
}

export const CmdFunDecl = 'CmdFunDecl';

export function isCmdFunDecl(item: unknown): item is CmdFunDecl {
    return reflection.isInstance(item, CmdFunDecl);
}

export interface FunctionDef extends Command {
    readonly $type: 'FunctionDef' | 'QualIdentifier' | 'QuantifiedTerm' | 'SmtSymbol' | 'Sort' | 'SpecConstant' | 'Term';
    functionSymbol: SmtSymbol;
    sortedVar: Array<SortedVar>;
}

export const FunctionDef = 'FunctionDef';

export function isFunctionDef(item: unknown): item is FunctionDef {
    return reflection.isInstance(item, FunctionDef);
}

export interface Sort extends Command, FunctionDec, FunctionDef {
    readonly $container: CmdConstDecl | CmdFunDecl | SelectorDec | SelectorDecZ3 | Sort | SortedVar;
    readonly $type: 'Sort';
    identifier: Identifier;
    sorts: Array<Sort>;
}

export const Sort = 'Sort';

export function isSort(item: unknown): item is Sort {
    return reflection.isInstance(item, Sort);
}

export interface Term extends FunctionDef {
    readonly $type: 'QualIdentifier' | 'QuantifiedTerm' | 'SmtSymbol' | 'SpecConstant' | 'Term';
    matchCase: Array<MatchCase>;
    qualId?: QualIdentifier;
    term: Array<Term> | Term;
    varBinding: Array<VarBinding>;
}

export const Term = 'Term';

export function isTerm(item: unknown): item is Term {
    return reflection.isInstance(item, Term);
}

export interface QualIdentifier extends Term {
    readonly $container: Term;
    readonly $type: 'QualIdentifier';
    id: string;
}

export const QualIdentifier = 'QualIdentifier';

export function isQualIdentifier(item: unknown): item is QualIdentifier {
    return reflection.isInstance(item, QualIdentifier);
}

export interface QuantifiedTerm extends Term {
    readonly $type: 'QuantifiedTerm';
    sortedVar: Array<SortedVar>;
    term: Term;
}

export const QuantifiedTerm = 'QuantifiedTerm';

export function isQuantifiedTerm(item: unknown): item is QuantifiedTerm {
    return reflection.isInstance(item, QuantifiedTerm);
}

export type SmtAstType = {
    Attribute: Attribute
    AttributeValue: AttributeValue
    CmdAssert: CmdAssert
    CmdCheckSat: CmdCheckSat
    CmdConstDecl: CmdConstDecl
    CmdFunDecl: CmdFunDecl
    Command: Command
    ConstructorDec: ConstructorDec
    ConstructorDecZ3: ConstructorDecZ3
    DataTypeDec: DataTypeDec
    DataTypeDecZ3: DataTypeDecZ3
    FunctionDec: FunctionDec
    FunctionDef: FunctionDef
    Identifier: Identifier
    Index: Index
    InfoFlag: InfoFlag
    Keyword: Keyword
    MatchCase: MatchCase
    Model: Model
    Option: Option
    Pattern: Pattern
    PropLiteral: PropLiteral
    QualIdentifier: QualIdentifier
    QuantifiedTerm: QuantifiedTerm
    SExpr: SExpr
    SelectorDec: SelectorDec
    SelectorDecZ3: SelectorDecZ3
    Sort: Sort
    SortDec: SortDec
    SortDecZ3: SortDecZ3
    SortedVar: SortedVar
    Term: Term
    VarBinding: VarBinding
}

export class SmtAstReflection extends AbstractAstReflection {

    getAllTypes(): string[] {
        return [Attribute, AttributeValue, CmdAssert, CmdCheckSat, CmdConstDecl, CmdFunDecl, Command, ConstructorDec, ConstructorDecZ3, DataTypeDec, DataTypeDecZ3, FunctionDec, FunctionDef, Identifier, Index, InfoFlag, Keyword, MatchCase, Model, Option, Pattern, PropLiteral, QualIdentifier, QuantifiedTerm, SExpr, SelectorDec, SelectorDecZ3, Sort, SortDec, SortDecZ3, SortedVar, Term, VarBinding];
    }

    protected override computeIsSubtype(subtype: string, supertype: string): boolean {
        switch (subtype) {
            case Attribute: {
                return this.isSubtype(Option, supertype);
            }
            case CmdAssert:
            case CmdCheckSat:
            case CmdConstDecl:
            case CmdFunDecl:
            case FunctionDef: {
                return this.isSubtype(Command, supertype);
            }
            case Keyword: {
                return this.isSubtype(InfoFlag, supertype);
            }
            case QualIdentifier:
            case QuantifiedTerm: {
                return this.isSubtype(Term, supertype);
            }
            case Sort: {
                return this.isSubtype(Command, supertype) || this.isSubtype(FunctionDec, supertype) || this.isSubtype(FunctionDef, supertype);
            }
            case Term: {
                return this.isSubtype(FunctionDef, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(refInfo: ReferenceInfo): string {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }

    getTypeMetaData(type: string): TypeMetaData {
        switch (type) {
            case Attribute: {
                return {
                    name: Attribute,
                    properties: [
                        { name: 'keyWord' },
                        { name: 'value' }
                    ]
                };
            }
            case AttributeValue: {
                return {
                    name: AttributeValue,
                    properties: [
                        { name: 'const' },
                        { name: 'exprs', defaultValue: [] },
                        { name: 'symbol' }
                    ]
                };
            }
            case Command: {
                return {
                    name: Command,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'infoFlag' },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' }
                    ]
                };
            }
            case ConstructorDec: {
                return {
                    name: ConstructorDec,
                    properties: [
                        { name: 'selectorDec', defaultValue: [] },
                        { name: 'symbol' }
                    ]
                };
            }
            case ConstructorDecZ3: {
                return {
                    name: ConstructorDecZ3,
                    properties: [
                        { name: 'selectorDec', defaultValue: [] },
                        { name: 'symbol' }
                    ]
                };
            }
            case DataTypeDec: {
                return {
                    name: DataTypeDec,
                    properties: [
                        { name: 'constructorDecs', defaultValue: [] },
                        { name: 'symbol', defaultValue: [] }
                    ]
                };
            }
            case DataTypeDecZ3: {
                return {
                    name: DataTypeDecZ3,
                    properties: [
                        { name: 'constructorDecs', defaultValue: [] }
                    ]
                };
            }
            case FunctionDec: {
                return {
                    name: FunctionDec,
                    properties: [
                        { name: 'functionSymbol' },
                        { name: 'var', defaultValue: [] }
                    ]
                };
            }
            case Identifier: {
                return {
                    name: Identifier,
                    properties: [
                        { name: 'indices', defaultValue: [] },
                        { name: 'symbol' }
                    ]
                };
            }
            case Index: {
                return {
                    name: Index,
                    properties: [
                        { name: 'num' },
                        { name: 'symbol' }
                    ]
                };
            }
            case Keyword: {
                return {
                    name: Keyword,
                    properties: [
                        { name: 'symbol' }
                    ]
                };
            }
            case MatchCase: {
                return {
                    name: MatchCase,
                    properties: [
                        { name: 'pattern' },
                        { name: 'term' }
                    ]
                };
            }
            case Model: {
                return {
                    name: Model,
                    properties: [
                        { name: 'commands', defaultValue: [] }
                    ]
                };
            }
            case Pattern: {
                return {
                    name: Pattern,
                    properties: [
                        { name: 'symbol' },
                        { name: 'symbols', defaultValue: [] }
                    ]
                };
            }
            case PropLiteral: {
                return {
                    name: PropLiteral,
                    properties: [
                        { name: 'symbol' }
                    ]
                };
            }
            case SelectorDec: {
                return {
                    name: SelectorDec,
                    properties: [
                        { name: 'sort' },
                        { name: 'symbol' }
                    ]
                };
            }
            case SelectorDecZ3: {
                return {
                    name: SelectorDecZ3,
                    properties: [
                        { name: 'sort', defaultValue: [] },
                        { name: 'symbol' }
                    ]
                };
            }
            case SExpr: {
                return {
                    name: SExpr,
                    properties: [
                        { name: 'const' },
                        { name: 'exprs', defaultValue: [] },
                        { name: 'keyWord' },
                        { name: 'symbol' }
                    ]
                };
            }
            case SortDec: {
                return {
                    name: SortDec,
                    properties: [
                        { name: 'num' },
                        { name: 'symbol' }
                    ]
                };
            }
            case SortDecZ3: {
                return {
                    name: SortDecZ3,
                    properties: [
                        { name: 'symbol', defaultValue: [] }
                    ]
                };
            }
            case SortedVar: {
                return {
                    name: SortedVar,
                    properties: [
                        { name: 'sort' },
                        { name: 'symbol' }
                    ]
                };
            }
            case VarBinding: {
                return {
                    name: VarBinding,
                    properties: [
                        { name: 'symbol' },
                        { name: 'term' }
                    ]
                };
            }
            case CmdAssert: {
                return {
                    name: CmdAssert,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'infoFlag' },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' }
                    ]
                };
            }
            case CmdCheckSat: {
                return {
                    name: CmdCheckSat,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'infoFlag' },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'propLiteral', defaultValue: [] },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' }
                    ]
                };
            }
            case CmdConstDecl: {
                return {
                    name: CmdConstDecl,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'infoFlag' },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'sorts', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' }
                    ]
                };
            }
            case CmdFunDecl: {
                return {
                    name: CmdFunDecl,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'infoFlag' },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'paramSorts', defaultValue: [] },
                        { name: 'returnSort' },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' }
                    ]
                };
            }
            case FunctionDef: {
                return {
                    name: FunctionDef,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'functionSymbol' },
                        { name: 'infoFlag' },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'sortedVar', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' }
                    ]
                };
            }
            case Sort: {
                return {
                    name: Sort,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'functionSymbol' },
                        { name: 'identifier' },
                        { name: 'infoFlag' },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'sortedVar', defaultValue: [] },
                        { name: 'sorts', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' },
                        { name: 'var', defaultValue: [] }
                    ]
                };
            }
            case Term: {
                return {
                    name: Term,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'functionSymbol' },
                        { name: 'infoFlag' },
                        { name: 'matchCase', defaultValue: [] },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'qualId' },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'sortedVar', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' },
                        { name: 'varBinding', defaultValue: [] }
                    ]
                };
            }
            case QualIdentifier: {
                return {
                    name: QualIdentifier,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'functionSymbol' },
                        { name: 'id' },
                        { name: 'infoFlag' },
                        { name: 'matchCase', defaultValue: [] },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'qualId' },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'sortedVar', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' },
                        { name: 'varBinding', defaultValue: [] }
                    ]
                };
            }
            case QuantifiedTerm: {
                return {
                    name: QuantifiedTerm,
                    properties: [
                        { name: 'basicCommand' },
                        { name: 'dataTypeDec' },
                        { name: 'functionDec', defaultValue: [] },
                        { name: 'functionSymbol' },
                        { name: 'infoFlag' },
                        { name: 'matchCase', defaultValue: [] },
                        { name: 'name' },
                        { name: 'number' },
                        { name: 'option' },
                        { name: 'qualId' },
                        { name: 'sortDec', defaultValue: [] },
                        { name: 'sortDecZ3', defaultValue: [] },
                        { name: 'sortedVar', defaultValue: [] },
                        { name: 'symbol' },
                        { name: 'term' },
                        { name: 'varBinding', defaultValue: [] }
                    ]
                };
            }
            default: {
                return {
                    name: type,
                    properties: []
                };
            }
        }
    }
}

export const reflection = new SmtAstReflection();
