import { AstNode, ValidationAcceptor, ValidationChecks } from "langium";
import {
    ActivityDiagram,
    ClassDefinition,
    ClassDiagram,
    DataFlow,
    Flow,
    Message,
    MessageGroup,
    SequenceDiagram,
    TxGramAstType,
    UseCaseDiagram,
    isActivityDiagram,
    isMessage,
    isSequenceDiagram,
} from "./generated/ast.js";
import type { TxGramServices } from "./tx-gram-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: TxGramServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.TxGramValidator;
    const checks: ValidationChecks<TxGramAstType> = {
        UseCaseDiagram: validator.checkUseCaseDiagram,
        SequenceDiagram: validator.checkSequenceDiagram,
        ClassDiagram: validator.checkClassDiagram,
        ActivityDiagram: validator.checkActivityDiagram,
        MessageGroup: validator.checkMessageGroup,
        ClassDefinition: validator.checkClassDefinition,
        Flow: validator.checkFlow,
        DataFlow: validator.checkDataFlow,
        Message: validator.checkMessage,
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class TxGramValidator {
    // Use Case Diagram Validations
    checkUseCaseDiagram(
        diagram: UseCaseDiagram,
        accept: ValidationAcceptor
    ): void {
        // Check for unique actor names
        const actorNames = new Set<string>();
        diagram.actors?.forEach((actor) => {
            if (actorNames.has(actor.name)) {
                accept("error", `Duplicate actor name: ${actor.name}`, {
                    node: actor,
                });
            }
            actorNames.add(actor.name);
        });

        // Check for unique use case names
        const useCaseNames = new Set<string>();
        diagram.useCases?.forEach((useCase) => {
            if (useCaseNames.has(useCase.name)) {
                accept("error", `Duplicate use case name: ${useCase.name}`, {
                    node: useCase,
                });
            }
            useCaseNames.add(useCase.name);
        });

        // Verify all connections reference valid elements
        diagram.relations?.forEach((relation) => {
            const fromExists =
                diagram.actors?.some((a) => a === relation.from.ref) ||
                diagram.useCases?.some((u) => u === relation.from.ref);
            const toExists =
                diagram.actors?.some((a) => a === relation.to.ref) ||
                diagram.useCases?.some((u) => u === relation.to.ref);

            if (!fromExists) {
                accept(
                    "error",
                    `Connection references non-existent source element`,
                    { node: relation }
                );
            }
            if (!toExists) {
                accept(
                    "error",
                    `Connection references non-existent target element`,
                    { node: relation }
                );
            }
        });
    }

    // Sequence Diagram Validations
    checkSequenceDiagram(
        diagram: SequenceDiagram,
        accept: ValidationAcceptor
    ): void {
        // Check for unique participant names
        const participantNames = new Set<string>();
        diagram.participants?.forEach((participant) => {
            if (participantNames.has(participant.name)) {
                accept(
                    "error",
                    `Duplicate participant name: ${participant.name}`,
                    { node: participant }
                );
            }
            participantNames.add(participant.name);
        });

        // Verify message participants exist
        diagram.interactions?.forEach((interaction) => {
            if (isMessage(interaction)) {
                const senderExists = diagram.participants?.some(
                    (p) => p === interaction.sender.ref
                );
                const receiverExists = diagram.participants?.some(
                    (p) => p === interaction.receiver.ref
                );

                if (!senderExists) {
                    accept("error", `Message references non-existent sender`, {
                        node: interaction,
                    });
                }
                if (!receiverExists) {
                    accept(
                        "error",
                        `Message references non-existent receiver`,
                        { node: interaction }
                    );
                }
            }
        });
    }

    // Class Diagram Validations
    checkClassDiagram(diagram: ClassDiagram, accept: ValidationAcceptor): void {
        // Check for unique class names
        const classNames = new Set<string>();
        diagram.classes?.forEach((cls) => {
            if (classNames.has(cls.name)) {
                accept("error", `Duplicate class name: ${cls.name}`, {
                    node: cls,
                });
            }
            classNames.add(cls.name);
        });

        // Verify relationships reference valid classes
        diagram.relationships?.forEach((relationship) => {
            const fromClassExists = diagram.classes?.some(
                (c) => c === relationship.fromClass?.ref
            );
            const toClassExists = diagram.classes?.some(
                (c) => c === relationship.toClass?.ref
            );

            if (!fromClassExists) {
                accept(
                    "error",
                    `Relationship references non-existent source class`,
                    { node: relationship }
                );
            }
            if (!toClassExists) {
                accept(
                    "error",
                    `Relationship references non-existent target class`,
                    { node: relationship }
                );
            }
        });
    }

    // Activity Diagram Validations
    checkActivityDiagram(
        diagram: ActivityDiagram,
        accept: ValidationAcceptor
    ): void {
        // Check for unique activity names
        const activityNames = new Set<string>();
        diagram.activities?.forEach((activity) => {
            if (activityNames.has(activity.name)) {
                accept("error", `Duplicate activity name: ${activity.name}`, {
                    node: activity,
                });
            }
            activityNames.add(activity.name);

            // Check for unique task names within each activity
            const taskNames = new Set<string>();
            activity.tasks?.forEach((task) => {
                if (taskNames.has(task.name)) {
                    accept(
                        "error",
                        `Duplicate task name within activity: ${task.name}`,
                        { node: task }
                    );
                }
                taskNames.add(task.name);
            });
        });
    }

    // Message Group Validations
    checkMessageGroup(group: MessageGroup, accept: ValidationAcceptor): void {
        // Validate nested message references
        group.sections?.forEach((section) => {
            section.interactions?.forEach((interaction) => {
                if (isMessage(interaction)) {
                    const parentDiagram = this.findParentOfType(
                        group,
                        isSequenceDiagram
                    );
                    if (parentDiagram) {
                        const senderExists = parentDiagram.participants?.some(
                            (p) => p === interaction.sender.ref
                        );
                        const receiverExists = parentDiagram.participants?.some(
                            (p) => p === interaction.receiver.ref
                        );

                        if (!senderExists) {
                            accept(
                                "error",
                                `Grouped message references non-existent sender`,
                                { node: interaction }
                            );
                        }
                        if (!receiverExists) {
                            accept(
                                "error",
                                `Grouped message references non-existent receiver`,
                                { node: interaction }
                            );
                        }
                    }
                }
            });
        });
    }

    // Class Definition Validations
    checkClassDefinition(
        cls: ClassDefinition,
        accept: ValidationAcceptor
    ): void {
        // Check for unique property names
        const propertyNames = new Set<string>();
        cls.attributes?.forEach((property) => {
            if (propertyNames.has(property.name)) {
                accept("error", `Duplicate property name: ${property.name}`, {
                    node: property,
                });
            }
            propertyNames.add(property.name);
        });

        // Check for unique method names (allowing overloading based on parameters)
        const methodSignatures = new Set<string>();
        cls.methods?.forEach((method) => {
            const signature = `${method.name}(${
                method.parameters?.length || 0
            })`;
            if (methodSignatures.has(signature)) {
                accept("error", `Duplicate method signature: ${signature}`, {
                    node: method,
                });
            }
            methodSignatures.add(signature);
        });
    }

    // Flow Validations
    checkFlow(flow: Flow, accept: ValidationAcceptor): void {
        // Validate flow references
        const parentActivity = this.findParentOfType(flow, isActivityDiagram);
        if (parentActivity) {
            const sourceExists = parentActivity.activities?.some((a) =>
                a.tasks?.some((t) => t === flow.source.ref)
            );
            const targetExists = parentActivity.activities?.some((a) =>
                a.tasks?.some((t) => t === flow.target.ref)
            );

            if (!sourceExists) {
                accept("error", `Flow references non-existent source task`, {
                    node: flow,
                });
            }
            if (!targetExists) {
                accept("error", `Flow references non-existent target task`, {
                    node: flow,
                });
            }
        }

        // Validate number range if specified
        if (flow.count) {
            if (parseInt(flow.count.minimum) < 0) {
                accept("error", `Flow count minimum cannot be negative`, {
                    node: flow.count,
                });
            }
            if (flow.count.maximum && flow.count.maximum < flow.count.minimum) {
                accept(
                    "error",
                    `Flow count maximum must be greater than minimum`,
                    { node: flow.count }
                );
            }
        }
    }

    // Data Flow Validations
    checkDataFlow(dataFlow: DataFlow, accept: ValidationAcceptor): void {
        // Validate data flow references
        const parentActivity = this.findParentOfType(
            dataFlow,
            isActivityDiagram
        );
        if (parentActivity) {
            const sourceExists = parentActivity.activities?.some((a) =>
                a.tasks?.some((t) => t === dataFlow.source.ref)
            );
            const targetExists = parentActivity.activities?.some((a) =>
                a.tasks?.some((t) => t === dataFlow.target.ref)
            );

            if (!sourceExists) {
                accept(
                    "error",
                    `Data flow references non-existent source task`,
                    { node: dataFlow }
                );
            }
            if (!targetExists) {
                accept(
                    "error",
                    `Data flow references non-existent target task`,
                    { node: dataFlow }
                );
            }
        }
    }

    // Message Validations
    checkMessage(message: Message, accept: ValidationAcceptor): void {
        // Prevent self-messages unless explicitly allowed
        if (message.sender === message.receiver) {
            accept("warning", `Self-referential message detected`, {
                node: message,
            });
        }
    }

    // Utility function to find parent node of specific type
    private findParentOfType<T extends AstNode>(
        node: AstNode,
        typeGuard: (node: AstNode) => node is T
    ): T | undefined {
        let current = node.$container;
        while (current) {
            if (typeGuard(current)) {
                return current;
            }
            current = current.$container;
        }
        return undefined;
    }
}
