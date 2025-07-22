grammar TXGram

// Basic tokens with improved readability
hidden terminal WHITESPACE: /[ \t\r\n]+/;  // Updated to explicitly include tabs
terminal IDENTIFIER: /[a-zA-Z_][\w]*/;
terminal TEXT_IN_QUOTES: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal NUMBER: /\d+/;

// Comments (hidden from parsing)
hidden terminal MULTILINE_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SINGLE_LINE_COMMENT: /\/\/[^\n\r]*/;

// Main entry point now directly accepts any diagram
entry Diagram:
    UseCaseDiagram | SequenceDiagram | ClassDiagram | ActivityDiagram;

// Use Case Diagram with improved structure
UseCaseDiagram:
    'UseCaseDiagram' name=IDENTIFIER ':'
        ('people:' 
            actors+=Actor (',' actors+=Actor)*)?
        ('systems:' 
            rectangles+=System (',' rectangles+=System)*)?
        ('actions:'
            useCases+=UseCase*)?
        ('connections:'
            relations+=Connection*)?;

Actor:
    name=IDENTIFIER;

System:
    name=IDENTIFIER;

UseCase:
    'action' name=IDENTIFIER ':'
        'what_it_does:' description=TEXT_IN_QUOTES
        ('optional_steps:'
            extensionPoints+=ExtensionPoint (',' extensionPoints+=ExtensionPoint)*)?;

Connection:
    '-' 'starting_from:' from=[Element]
        'going_to:' to=[Element]
        'connection_type:' type=ConnectionType
        ('pointing:' direction=Direction)?
        ('distance:' length=NUMBER)?;

ConnectionType:
    basic='basic' | extends='extends' | includes='includes';

Direction:
    upward='upward' | downward='downward' | leftward='leftward' | rightward='rightward';

Element:
    Actor | UseCase | System;

ExtensionPoint:
    description=TEXT_IN_QUOTES;

// Sequence Diagram with clearer terminology
SequenceDiagram:
    'SequenceDiagram' name=IDENTIFIER ':'
        'participants:'
            participants+=Participant*
        ('messages:'
            (interactions+=Message | interactions+=TaskExecution | interactions+=MessageGroup)*)?;

Participant:
    '-' 'name:' name=IDENTIFIER
        'role:' role=ParticipantRole;

ParticipantRole:
    person='person' | system='system' | interface='interface' | controller='controller' | data='data' | database='database' | list='list' | queue='queue';

Message:
    '-' 'from:' sender=[Participant]
        'to:' receiver=[Participant]
        'type:' messageType=MessageType
        ('content:' content=TEXT_IN_QUOTES)?;

MessageType:
    requestresponse='request-response' | oneway='one-way' | reply='reply' | lost='lost' | found='found';

TaskExecution:
    '-' 'task' participant=[Participant] ':' status=('begins' | 'ends');

MessageGroup:
    '-' 'group' type=GroupType ':'
        sections+=GroupSection*;

GroupType:
    alternative='alternative' | repeat='repeat' | parallel='parallel' | stop='stop';

GroupSection:
    'section' description=TEXT_IN_QUOTES
        ('messages:'
            (interactions+=Message | interactions+=TaskExecution | interactions+=MessageGroup)*)?;

// Class Diagram with simplified structure
ClassDiagram:
    'ClassDiagram' name=IDENTIFIER ':'
        'objects:'
            classes+=ClassDefinition*
        ('connections:'
            relationships+=ClassRelationship*)?;

ClassDefinition:
    'object' name=IDENTIFIER ':'
        'properties:'
            attributes+=Property*
        ('functions:'
            methods+=Func*)?;

Property:
    'property' name=IDENTIFIER ':' dataType=IDENTIFIER;

Func:
    'function' name=IDENTIFIER '('
        (parameters+=Parameter (',' parameters+=Parameter)*)?
    ')' ':' returnType=IDENTIFIER?;

Parameter:
    name=IDENTIFIER ':' dataType=IDENTIFIER;

ClassRelationship:
    ('connects' | 'contains' | 'owns') ':'
        fromClass=[ClassDefinition] fromCount=NumberRange
        'to' 
        toClass=[ClassDefinition] toCount=NumberRange
    | 'inherits' ':' childClass=[ClassDefinition] 'from' parentClass=[ClassDefinition];

// Activity Diagram with intuitive naming
ActivityDiagram:
    'ActivityDiagram' name=IDENTIFIER ':'
        'steps:'
            activities+=ActivityDefinition*;

ActivityDefinition:
    'process' name=IDENTIFIER ':'
        'can_be_modified:' canModify=YesNo
        'runs_once:' runOnce=YesNo
        'tasks:'
            tasks+=Task*
        ('flows:'
            flows+=Flow*)?
        ('data_flows:'
            dataFlows+=DataFlow*)?;

YesNo:
    yes='yes' | no='no';

Task:
    'task' name=IDENTIFIER ':'
        'details:' description=TEXT_IN_QUOTES;

Flow:
    'flow' name=IDENTIFIER ':'
        'from:' source=[Task]
        'to:' target=[Task]
        ('condition:' condition=TEXT_IN_QUOTES)?
        ('priority:' weight=TEXT_IN_QUOTES)?
        ('count:' count=NumberRange)?;

DataFlow:
    'data_flow' name=IDENTIFIER ':' 
        'allows_multiple_senders:' multiSender=YesNo
        'allows_multiple_receivers:' multiReceiver=YesNo
        'from:' source=[Task]
        'to:' target=[Task];

NumberRange:
    '[' minimum=NUMBER ('..' maximum=NUMBER | '..*')? ']';