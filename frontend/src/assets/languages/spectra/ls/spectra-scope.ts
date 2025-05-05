import { AstNode, GenericAstNode, DefaultScopeComputation, LangiumCoreServices, LangiumDocument, PrecomputedScopes, } from "langium";

export class SpectraScopeComputation extends DefaultScopeComputation {
    services: any;
    constructor(services: LangiumCoreServices) {
        super(services);
    }

    protected override async processNode(node: AstNode, document: LangiumDocument, scopes: PrecomputedScopes): Promise<void> {
        const container = node.$container;
        if (container) {
            const name = this.nameProvider.getName(node);
            if (name) {
                const description = this.descriptions.createDescription(node, name, document);

                scopes.add(container, description);

                if (container.$container && node.$containerProperty) {
                    const value = (node.$container as GenericAstNode)[node.$containerProperty as string];
                    if (Array.isArray(value)) scopes.add(container.$container, description);
                }

            }
        }

        const typeDefNode = node as GenericAstNode;
        if (typeDefNode.const) {
            const constants = Array.isArray(typeDefNode.const) ? typeDefNode.const : [];
            for (const constant of constants) {
                const constantName = this.nameProvider.getName(constant);
                if (constantName) {
                    const constantDescription = this.descriptions.createDescription(constant, constantName, document);
                    scopes.add(document.parseResult.value, constantDescription); // Add to the global scope
                }
            }
        }
    }
}

