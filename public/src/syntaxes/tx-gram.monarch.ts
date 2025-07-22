// Monarch syntax highlighting for the tx-gram language.
export default {
    keywords: [
        'ActivityDiagram','ClassDiagram','SequenceDiagram','UseCaseDiagram','action','actions:','allows_multiple_receivers:','allows_multiple_senders:','alternative','basic','begins','can_be_modified:','condition:','connection_type:','connections:','connects','contains','content:','controller','count:','data','data_flow','data_flows:','database','details:','distance:','downward','ends','extends','flow','flows:','found','from','from:','function','functions:','going_to:','group','includes','inherits','interface','leftward','list','lost','messages:','name:','no','object','objects:','one-way','optional_steps:','owns','parallel','participants:','people:','person','pointing:','priority:','process','properties:','property','queue','repeat','reply','request-response','rightward','role:','runs_once:','section','starting_from:','steps:','stop','system','systems:','task','tasks:','to','to:','type:','upward','what_it_does:','yes'
    ],
    operators: [
        ',','-','..','..*',':'
    ],
    symbols: /\(|\)|,|-|\.\.|\.\.\*|:|\[|\]/,

    tokenizer: {
        initial: [
            { regex: /[a-zA-Z_][\w]*/, action: { cases: { '@keywords': {"token":"keyword"}, '@default': {"token":"IDENTIFIER"} }} },
            { regex: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/, action: {"token":"TEXT_IN_QUOTES"} },
            { regex: /\d+/, action: {"token":"NUMBER"} },
            { include: '@whitespace' },
            { regex: /@symbols/, action: { cases: { '@operators': {"token":"operator"}, '@default': {"token":""} }} },
        ],
        whitespace: [
            { regex: /[ \t\r\n]+/, action: {"token":"white"} },
            { regex: /\/\*/, action: {"token":"comment","next":"@comment"} },
            { regex: /\/\/[^\n\r]*/, action: {"token":"comment"} },
        ],
        comment: [
            { regex: /[^/\*]+/, action: {"token":"comment"} },
            { regex: /\*\//, action: {"token":"comment","next":"@pop"} },
            { regex: /[/\*]/, action: {"token":"comment"} },
        ],
    }
};
