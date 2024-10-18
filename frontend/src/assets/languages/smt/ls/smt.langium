grammar Smt

entry Model:
    commands+=Command+;

Command:
    CmdAssert
    | CmdBasic
    | PAR_OPEN 'check-sat-assuming' PAR_OPEN propLiteral+=PropLiteral* PAR_CLOSE PAR_CLOSE
    | CmdConstDecl
    | PAR_OPEN 'declare-datatype' name=ID DataTypeDec PAR_CLOSE
    | CmdFunDecl
    | PAR_OPEN 'declare-sort' name=ID NUMERAL PAR_CLOSE
    | PAR_OPEN 'define-fun' FunctionDef PAR_CLOSE
    | PAR_OPEN 'define-fun-rec' FunctionDef PAR_CLOSE
    | PAR_OPEN 'define-funs-rec' PAR_OPEN functionDec+=FunctionDec+ PAR_CLOSE PAR_OPEN term+=Term+ PAR_CLOSE
    | PAR_OPEN 'define-sort' symbol=SmtSymbol PAR_OPEN symbol+=SmtSymbol* PAR_CLOSE Sort PAR_CLOSE
    | PAR_OPEN 'echo' STRING PAR_CLOSE
    | PAR_OPEN 'get-info' infoFlag=InfoFlag PAR_CLOSE
    | PAR_OPEN 'get-option' name=Keyword PAR_CLOSE
    | PAR_OPEN 'get-value' PAR_OPEN term=Term+ PAR_CLOSE PAR_CLOSE
    | PAR_OPEN 'pop' NUMERAL PAR_CLOSE
    | PAR_OPEN 'push' NUMERAL PAR_CLOSE
    | PAR_OPEN 'set-info' name=Attribute PAR_CLOSE
    | PAR_OPEN 'set-logic' symbol=SmtSymbol PAR_CLOSE
    PAR_OPEN 'set-option' option=Option PAR_CLOSE
    ;

CmdAssert infers Command:
    PAR_OPEN 'assert' term=Term PAR_CLOSE;

CmdBasic infers Command:
    PAR_OPEN basicCommand=BasicCommand PAR_CLOSE;

CmdConstDecl infers Command:
	PAR_OPEN 'declare-const' name=ID sorts+=Sort PAR_CLOSE;

CmdFunDecl infers Command:
    PAR_OPEN 'declare-fun' name=ID PAR_OPEN paramSorts+=Sort* PAR_CLOSE returnSort=Sort PAR_CLOSE;

InfoFlag infers InfoFlag:
    ':' 'all-statistics' | ':' 'assertion-stack-levels' | ':' 'authors'
    | ':' 'error-behavior' | ':' 'name' | ':' 'reason-unknown'
    | ':' 'version' | Keyword
    ;

Option infers Option:
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
    | ':' 'verbosity' NUMERAL
    | Attribute
    ;

terminal BValue: 'true' | 'false';


FunctionDec infers FunctionDec:
    PAR_OPEN symbol=SmtSymbol PAR_OPEN var+=SortedVar* PAR_CLOSE Sort PAR_CLOSE;

FunctionDef infers FunctionDef:
    symbol=SmtSymbol PAR_OPEN var+=SortedVar* PAR_CLOSE Sort Term;

DataTypeDec infers DataTypeDec:
    PAR_OPEN conttructorDec+=ConstructorDec+ PAR_CLOSE
    | PAR_OPEN 'par' PAR_OPEN symbol+=SmtSymbol+ PAR_CLOSE PAR_OPEN conttructorDec+=ConstructorDec+ PAR_CLOSE PAR_CLOSE;

ConstructorDec infers ConstructorDec:
    PAR_OPEN symbol=SmtSymbol selectorDec+=SelectorDec* PAR_CLOSE;

SelectorDec infers SelectorDec:
    PAR_OPEN symbol=SmtSymbol sotr=Sort PAR_CLOSE;

PropLiteral infers PropLiteral:
    symbol=SmtSymbol | (PAR_OPEN 'not' symbol=SmtSymbol PAR_CLOSE);

BasicCommand returns string: 
    'check-sat' | 'reset' | 'reset-assertions' | 'get-model' | 'exit'
    | 'get-assertions' | 'get-assignment' | 'get-proof' | 'get-unsat-assumptions'
    | 'get-unsat-core';

Term infers Term:
    TermConstant
    | TermIdentifier
    | LetExpr
    | ForAll
    | Exists
    | Match
    // | TermAttribute
    ;

TermConstant infers Term:
    const=SpecConstant;

TermIdentifier infers Term:
    identifier= QualIdentifier;

LetExpr infers Term:
    PAR_OPEN 'let' PAR_OPEN var+=VarBindings+ PAR_CLOSE term=Term PAR_CLOSE;

ForAll infers Term:
    PAR_OPEN 'forall' PAR_OPEN var+=SortedVar+ PAR_CLOSE term=Term PAR_CLOSE;

Exists infers Term:
	PAR_OPEN 'exists' PAR_OPEN var+=SortedVar+ PAR_CLOSE term=Term PAR_CLOSE;

Match infers Term:
    PAR_OPEN 'match' term=Term PAR_OPEN cases+=MatchCase+ PAR_CLOSE PAR_CLOSE;

TermAttribute infers Term:
    PAR_OPEN '!' term=Term PAR_OPEN attributes+=Attribute+ PAR_CLOSE PAR_CLOSE;

VarBindings infers VarBindings:
    PAR_OPEN symbol=SmtSymbol term=Term PAR_CLOSE;

SortedVar infers SortedVar:
    PAR_OPEN symbol=SmtSymbol sort=Sort PAR_CLOSE;

MatchCase infers MatchCase:
    PAR_OPEN pattern=Pattern term=Term PAR_CLOSE;

Attribute infers Attribute:
    keyWord=Keyword value=AttributeValue?;

Keyword infers Keyword:
    ':' simpleSymbol=SIMPLE_SYMBOL;

AttributeValue infers AttributeValue:
    const=SpecConstant | symbol=SmtSymbol | {infer AttributeValue} PAR_OPEN exprs+=SExpr* PAR_CLOSE;

SExpr infers SExpr:
    const=SpecConstant | symb=SmtSymbol | keyWord = Keyword | PAR_OPEN exprs+=SExpr+ PAR_CLOSE;

Pattern infers Pattern:
    symbol=SmtSymbol | (PAR_OPEN symbol=SmtSymbol symbols+=SmtSymbol+ PAR_CLOSE);

SmtSymbol infers SmtSymbol:
    symbol=ID;

Index infers Index:
    num=NUMERAL | symbol=SmtSymbol;

Identifier infers Identifier:
    symbol=ID | (PAR_OPEN '_' symbol=ID indices+=Index+ PAR_CLOSE);

Sort infers Sort:
    identifier=Identifier | PAR_OPEN indetifier=Identifier sorts+=Sort+ PAR_CLOSE;
QualIdentifier infers Identifier:
    id=Identifier | (PAR_OPEN 'as' id=Identifier sort=Sort PAR_CLOSE);

SpecConstant returns string:
    NUMERAL | DECIMAL | HEXADECIMAL | BINARY | STRING;


// Lexer rules
terminal PAR_OPEN: '(';
terminal PAR_CLOSE: ')';
terminal LETTER: /[a-zA-Z]/;
terminal DIGIT: /[0-9]/;
terminal NUMERAL: /0|[0-9][0-9]*/;
terminal DECIMAL: NUMERAL '.' NUMERAL;
terminal HEXADECIMAL: /#x[0-9a-fA-F]+/;
terminal BINARY: /#b[01]+/;
terminal STRING: /"(WS|PRINTABLE_CHAR)*"/;
hidden terminal WS: /\s+/;
terminal SIMPLE_SYMBOL: 
    (LETTER | '+' '-' | '/' | '*' | '=' | '%' | '?' | '!' | '.' | '$' | '_' | '~' | '&' | '^' | '<' | '>' | '@')
    (LETTER | DIGIT | '+' '-' | '/' | '*' | '=' | '%' | '?' | '!' | '.' | '$' | '_' | '~' | '&' | '^' | '<' | '>' | '@'); 
terminal ID: (LETTER | '+' ) (LETTER | DIGIT | '+' )* | '|' (PRINTABLE_CHAR)+ '|';
hidden terminal SL_COMMENT: /;[^\n\r]*/;
terminal PRINTABLE_CHAR:  /[\u0020-\u007E\u0080-\u00FF]/;