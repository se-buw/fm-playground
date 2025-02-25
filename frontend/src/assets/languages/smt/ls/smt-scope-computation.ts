import { AstNode, GenericAstNode, DefaultScopeComputation, LangiumCoreServices, LangiumDocument, PrecomputedScopes } from "langium";



export class SmtScopeComputation extends DefaultScopeComputation{

    constructor(services: LangiumCoreServices) {
            super(services);
    }

    /**
     * Process a single node during scopes computation. Adjusts visibility for nodes inside nested arrays,
     * exposing them one level higher in the AST.
     */
    protected override processNode(node: AstNode, document: LangiumDocument, scopes: PrecomputedScopes): void {
        const container = node.$container;
        if (container) {
            const name = this.nameProvider.getName(node);
            if (name) {
                const description = this.descriptions.createDescription(node, name, document);
                
                // Expose visibility to it's own container and with that to it's siblings
                scopes.add(container, description);

                // Increase visibility to an additional higher level
                // because properties with multiplicities introduce additional nesting that results in shadowing sibling elements
                if(container.$container && node.$containerProperty){
                    const value = (node.$container as GenericAstNode)[node.$containerProperty as string];
                    if(Array.isArray(value)) scopes.add(container.$container, description); 
                }

            }
        }
    }
}