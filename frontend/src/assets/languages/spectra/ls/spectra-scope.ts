import {
    AstNode,
    GenericAstNode,
    DefaultScopeComputation,
    LangiumCoreServices,
    LangiumDocument,
    PrecomputedScopes,
} from "langium";
import { isReferrable, isTypeDef, isVar, isVarDecl, TypeDef, Var, VarDecl } from "./generated/ast.js";

export class SpectraScopeComputation extends DefaultScopeComputation {
    services: any;
    constructor(services: LangiumCoreServices) {
        super(services);
    }

    protected override async processNode(node: AstNode, document: LangiumDocument, scopes: PrecomputedScopes): Promise<void> {
        const container = node.$container;
        if (container && isReferrable(node)) {

            const name = this.nameProvider.getName(node);
            if (name) {
                const description = this.descriptions.createDescription(node, name, document);

                scopes.add(container, description);

                if (container.$container && node.$containerProperty) {
                    const value = (container as GenericAstNode)[node.$containerProperty as string];
                    if (Array.isArray(value)) scopes.add(container.$container, description);
                }

            }
        }

        if (container && isTypeDef(node)) {
            const typeDefNode = node as TypeDef;
            const constants = Array.isArray(typeDefNode.type.const) ? typeDefNode.type.const : [];
            for (const constant of constants) {
                const constantName = this.nameProvider.getName(constant);
                if (constantName) {
                    const constantDescription = this.descriptions.createDescription(constant, constantName, document);
                    scopes.add(container, constantDescription);
                }
            }
        }

        if (container && isVar(node)) {
            const typeDefNode = node as Var;
            const constants = Array.isArray(typeDefNode.type.const) ? typeDefNode.type.const : [];
            for (const constant of constants) {
                const constantName = this.nameProvider.getName(constant);
                if (constantName) {
                    const constantDescription = this.descriptions.createDescription(constant, constantName, document);
                    scopes.add(container, constantDescription);
                }
            }
        }

        if (container && isVarDecl(node)) {
            const typeDefNode = node as VarDecl;
            const constants = Array.isArray(typeDefNode.type.const) ? typeDefNode.type.const : [];
            for (const constant of constants) {
                const constantName = this.nameProvider.getName(constant);
                if (constantName) {
                    const constantDescription = this.descriptions.createDescription(constant, constantName, document);
                    scopes.add(container, constantDescription);
                }
            }
        }
    }
}
