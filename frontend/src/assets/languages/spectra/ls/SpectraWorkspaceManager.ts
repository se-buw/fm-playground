import {
    AstNode,
    DefaultWorkspaceManager,
    LangiumDocument,
    LangiumDocumentFactory,
} from "langium";
import { LangiumSharedServices } from "langium/lsp";
import { WorkspaceFolder } from "vscode-languageserver";
import { URI } from "vscode-uri";
import { buildinDwyerPatterns } from "./DwyerPatterns.js";

export class SpectraWorkspaceManager extends DefaultWorkspaceManager {
    private documentFactory: LangiumDocumentFactory;
    constructor(services: LangiumSharedServices) {
        super(services);
        this.documentFactory = services.workspace.LangiumDocumentFactory;
    }

    protected override async loadAdditionalDocuments(
        folders: WorkspaceFolder[], 
        collector: (document: LangiumDocument<AstNode>) => void
    ): Promise<void> {
        await super.loadAdditionalDocuments(folders, collector);
        collector(this.documentFactory.fromString(buildinDwyerPatterns, URI.parse("file:///dwyerPatterns.spectra")));
    }
}
