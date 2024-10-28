grammar Smt

entry Model:
    commands+=Command+;


Command:
   CmdAssert
   | PAR_OPEN basicCommand=BasicCommand PAR_CLOSE
   | CmdCheckSat
   | CmdConstDecl
   | PAR_OPEN 'declare-datatype' name=SmtSymbol (dataTypeDec=DataTypeDec | dataTypeDec=DataTypeDecZ3) PAR_CLOSE //Z3 variant
   | CmdDecDataTypes
   | CmdFunDecl
   | PAR_OPEN 'declare-sort' symbol=SmtSymbol number=NUMERAL* PAR_CLOSE // SMT-LIB: '*' for z3
   | PAR_OPEN 'define-fun' FunctionDef PAR_CLOSE
   | PAR_OPEN 'define-fun-rec' FunctionDef PAR_CLOSE
   | PAR_OPEN 'define-funs-rec' PAR_OPEN functionDec+=FunctionDec+ PAR_CLOSE PAR_OPEN term+=Term+ PAR_CLOSE
   | PAR_OPEN 'define-sort' symbol=SmtSymbol PAR_OPEN symbol+=SmtSymbol* PAR_CLOSE Sort PAR_CLOSE
   | PAR_OPEN 'echo' STRING PAR_CLOSE
   | PAR_OPEN 'get-info' infoFlag=InfoFlag PAR_CLOSE
   | PAR_OPEN 'get-option' name=Keyword PAR_CLOSE
   | PAR_OPEN 'get-value' PAR_OPEN term=Term+ PAR_CLOSE PAR_CLOSE
   | PAR_OPEN 'pop' NUMERAL* PAR_CLOSE // '*' for Z3
   | PAR_OPEN 'push' NUMERAL* PAR_CLOSE // '*' for Z3
   | PAR_OPEN 'set-info' name=Attribute PAR_CLOSE
   | PAR_OPEN 'set-logic' symbol=SmtSymbol PAR_CLOSE
   | PAR_OPEN 'set-option' option=Option PAR_CLOSE
   // Z3 Commands
   | PAR_OPEN 'eval' term+=Term+ PAR_CLOSE
   | PAR_OPEN ('maximize' | 'minimize') term=Term PAR_CLOSE
   ;

CmdCheckSat :
    PAR_OPEN 'check-sat' PAR_CLOSE
    | PAR_OPEN 'check-sat-assuming' PAR_OPEN propLiteral+=Term* PAR_CLOSE PAR_CLOSE //Support Z3, SMT-LIB: PropLiteral
    ;

CmdAssert:
    PAR_OPEN 'assert' term=Term PAR_CLOSE;

BasicCommand returns string: 
    'check-sat' | 'reset' | 'reset-assertions' | 'get-model' | 'exit'
    | 'get-assertions' | 'get-assignment' | 'get-proof' | 'get-unsat-assumptions'
    | 'get-unsat-core';

CmdConstDecl:
	PAR_OPEN 'declare-const' symbol=SmtSymbol sorts+=Sort+ PAR_CLOSE;

CmdFunDecl:
    PAR_OPEN 'declare-fun' symbol=SmtSymbol PAR_OPEN paramSorts+=Sort* PAR_CLOSE returnSort=Sort PAR_CLOSE;

CmdDecDataTypes infers Command:
    PAR_OPEN 'declare-datatypes' PAR_OPEN (
        (sortDecZ3+=SortDecZ3* PAR_CLOSE PAR_OPEN dataTypeDec+=DataTypeDecZ3+)
    | (sortDec+=SortDec+ PAR_CLOSE PAR_OPEN dataTypeDec+=DataTypeDec+)
    ) PAR_CLOSE PAR_CLOSE;


DataTypeDec:
    PAR_OPEN constructorDecs+=ConstructorDec+ PAR_CLOSE
    | PAR_OPEN 'par' PAR_OPEN symbol+=SmtSymbol+ PAR_CLOSE PAR_OPEN constructorDecs+=ConstructorDec+ PAR_CLOSE PAR_CLOSE;

ConstructorDec:
    PAR_OPEN symbol=SmtSymbol selectorDec+=SelectorDec* PAR_CLOSE;

SelectorDec:
    PAR_OPEN symbol=SmtSymbol sort=Sort PAR_CLOSE;

SortDec:
    PAR_OPEN symbol=SmtSymbol num=NUMERAL PAR_CLOSE;

FunctionDef:
    functionSymbol=SmtSymbol PAR_OPEN sortedVar+=SortedVar* PAR_CLOSE Sort Term;

FunctionDec:
    PAR_OPEN functionSymbol=SmtSymbol PAR_OPEN var+=SortedVar* PAR_CLOSE Sort PAR_CLOSE;

SortedVar:
    PAR_OPEN symbol=SmtSymbol sort=Sort PAR_CLOSE;

Sort:
    identifier=Identifier | PAR_OPEN identifier=Identifier sorts+=Sort+ PAR_CLOSE;

Index:
    num=NUMERAL | symbol=SmtSymbol;

Identifier:
    symbol=SmtSymbol | (PAR_OPEN '_' symbol=SmtSymbol indices+=Index+ PAR_CLOSE);

PropLiteral:
    symbol=SmtSymbol | (PAR_OPEN 'not' symbol=SmtSymbol PAR_CLOSE);

Term:
    SpecConstant
    | QualIdentifier
    | PAR_OPEN qualId=QualIdentifier term+=Term+ PAR_CLOSE
    | PAR_OPEN 'let' PAR_OPEN varBinding+=VarBinding+ PAR_CLOSE term=Term PAR_CLOSE
    | QuantifiedTerm
    | PAR_OPEN 'match' term=Term PAR_OPEN matchCase+=MatchCase+ PAR_CLOSE
    //| PAR_OPEN '!' term=Term attribute+=Attribute+ PAR_CLOSE
    | PAR_OPEN PAR_OPEN '_' (PSEUDO_BOOL_KEYWORD | CARDINALITY_KEYWORD)  NUMERAL* PAR_CLOSE SmtSymbol* PAR_CLOSE //
    ;

terminal PSEUDO_BOOL_KEYWORD: 'pbeq' | 'pbge' | 'pble';
terminal CARDINALITY_KEYWORD: 'at-least' | 'at-most' ;


QuantifiedTerm:
    PAR_OPEN ('forall' | 'exists' ) PAR_OPEN sortedVar+=SortedVar+ PAR_CLOSE term=Term PAR_CLOSE;

MatchCase:
    PAR_OPEN pattern=Pattern term=Term PAR_CLOSE;

Pattern:
    symbol=SmtSymbol | (PAR_OPEN symbol=SmtSymbol symbols+=SmtSymbol+ PAR_CLOSE);

VarBinding:
    PAR_OPEN symbol=SmtSymbol term=Term PAR_CLOSE;

QualIdentifier:
    id=SIMPLE_SYMBOL;

SpecConstant returns string:
    NUMERAL | DECIMAL | HEXADECIMAL | BINARY | STRING;


SmtSymbol returns string:
    SIMPLE_SYMBOL;

InfoFlag:
    ':' 'all-statistics' | ':' 'assertion-stack-levels' | ':' 'authors'
    | ':' 'error-behavior' | ':' 'name' | ':' 'reason-unknown'
    | ':' 'version' | Keyword;

Keyword:
    ':' symbol=SmtSymbol;

Attribute:
    keyWord=Keyword | keyWord=Keyword value=AttributeValue;

AttributeValue:
    const=SpecConstant 
    | symbol=SmtSymbol 
    | {infer AttributeValue} PAR_OPEN exprs+=SExpr* PAR_CLOSE;

SExpr infers SExpr:
    const=SpecConstant | symbol=SmtSymbol | keyWord = Keyword | PAR_OPEN exprs+=SExpr+ PAR_CLOSE;


Option:
    OptionTerminal | Attribute;

terminal OptionTerminal:
    ':' 'diagnostic-output-channel' STRING
    | ':' 'global-declarations' BValue
    | ':' 'interactive-mode' BValue
    | ':' 'print-success' BValue
    | ':' 'produce-assertions' BValue
    | ':' 'produce-assignments' BValue
    | ':' 'produce-models' BValue
    | ':' 'produce-proofs' BValue
    | ':' 'produce-unsat-assumptions' BValue
    | ':' 'produce-unsat-cores' BValue
    | ':' 'random-seed' NUMERAL
    | ':' 'regular-output-channel' STRING
    | ':' 'reproducible-resource-limit' NUMERAL
    // Z3 
    | ':' 'smt-auto-config' BValue
    | ':' 'smt.mbqi' BValue
    | ':' 'smt.macro-finder' BValue
    | ':' 'model.compact' BValue
    | ':' 'opt.priority' SIMPLE_SYMBOL // Check
    | ':' 'pp.bv-literals' BValue
    | ':' 'verbosity' NUMERAL
    ;


// Z3 Related Specification
SortDecZ3:
    symbol+=SmtSymbol+;

ConstructorDecZ3:
    symbol=SmtSymbol selectorDec+=SelectorDecZ3*;

DataTypeDecZ3:
    PAR_OPEN constructorDecs+=ConstructorDecZ3+ PAR_CLOSE;


SelectorDecZ3:
    PAR_OPEN symbol=SmtSymbol sort+=Sort* PAR_CLOSE;

// Lexer rules
terminal PAR_OPEN: '(';
terminal PAR_CLOSE: ')';
terminal BValue: 'true' | 'false';
terminal LETTER returns string: /[a-zA-Z]/;
terminal DIGIT returns number: /[0-9]/;
terminal NUMERAL returns number: /0|[0-9][0-9]*/;
terminal DECIMAL: NUMERAL '.' NUMERAL;
terminal HEXADECIMAL: /#x[0-9a-fA-F]+/;
terminal BINARY: /#b[01]+/;
terminal STRING returns string: /"([^"\\]|\\.|(WS|PRINTABLE_CHAR))+"/;
hidden terminal WS: /\s+/;


terminal SIMPLE_SYMBOL: 
    (LETTER | '+' | '-' | '/' | '*' | ',' | '=' | '%' | '?' | '!' | '.' | '$' | '_' | '~' | '&' | '^' | '<' | '>' | '@')
    (LETTER | DIGIT | '+' | '-' | '/' | '*' | '=' | '%' | '?' | '!' | '.' | '$' | '_' | '~' | '&' | '^' | '<' | '>' | '@')*;
hidden terminal SL_COMMENT: /;[^\n\r]*/;
terminal SimplifyKeyword:
  ':ite-extra-rules' | ':flat' | ':elim-and' | ':local-ctx' | ':local-ctx-limit' | ':blast-distinct' | ':som' | ':som-blowup' | 
  ':hoist-mul' | ':hoist-cmul' | ':algebraic-number-evaluator' | ':mul-to-power' | ':expand-power' | 
  ':expand-tan' | ':max-degree' | ':eq2ineq' | ':sort-sums' | ':gcd-rounding' | ':arith-lhs' | ':elim-to-real' | 
  ':push-to-real' | ':elim-rem' | ':udiv2mul' | ':split-concat-eq' | ':bit2bool' | ':blast-eq-value' | ':elim-sign-ext' | 
  ':hi-div0' | ':mul2concat' | ':expand-select-store' | ':sort-store' | ':max-memory' | ':max-steps' | ':push-ite-arith' | 
  ':push-ite-bv' | ':pull-cheap-ite' | ':cache-all';