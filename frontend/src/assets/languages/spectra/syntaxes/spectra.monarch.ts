// Monarch syntax highlighting for the spectra language.
export default {
    keywords: [
        '.all','.any','.max','.min','.prod','.sum','FALSE','G','GE','GEF','GF','H','HISTORICALLY','Int','O','ONCE','PREV','S','SINCE','T','TRIGGERED','TRUE','Y','alw','alwEv','always','alwaysEventually','and','asm','assumption','aux','auxvar','boolean','counter','dec:','define','env','envvar','exists','false','forall','gar','guarantee','iff','implies','import','in','inc:','ini','initially','input','keep','mod','module','modulo','monitor','next','not','or','out','output','overflow:','pattern','predicate','regexp','regtest','reset:','spec','sys','sysvar','trans','trig','true','type','underflow:','var','weight','xor'
    ],
    operators: [
        '!','!=','%','&','*','+',',','-','->','.','..','/',':',':=',';','<','<->','<=','=','>','>=','?','|','|=>','~'
    ],
    symbols: /!|!=|%|&|\(|\(\)|\)|\*|\+|,|-|->|\.|\.\.|\/|:|:=|;|<|<->|<=|=|>|>=|\?|\[|\]|\{|\||\|=>|\}|~/,

    tokenizer: {
        initial: [
            { regex: /(\^?(([a-z]|[A-Z])|_)((([a-z]|[A-Z])|_)|[0-9])*)/, action: { cases: { '@keywords': {"token":"keyword"}, '@default': {"token":"string"} }} },
            { regex: /[0-9]+/, action: {"token":"number"} },
            { regex: /("((\\(((("|\\)|n)|r)|t))|((?!(\\|"))[\s\S]*?))*")/, action: {"token":"string"} },
            { include: '@whitespace' },
            { regex: /@symbols/, action: { cases: { '@operators': {"token":"operator"}, '@default': {"token":""} }} },
        ],
        whitespace: [
            { regex: /\/\*/, action: {"token":"comment","next":"@comment"} },
            { regex: /\/\/[^\n\r]*|--[^\n\r]*/, action: {"token":"comment"} },
            { regex: /((( |	)|\r)|\n)+/, action: {"token":"white"} },
        ],
        comment: [
            { regex: /[^/\*]+/, action: {"token":"comment"} },
            { regex: /\*\//, action: {"token":"comment","next":"@pop"} },
            { regex: /[/\*]/, action: {"token":"comment"} },
        ],
    }
};
