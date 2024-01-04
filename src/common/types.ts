// Common types
export interface WithMessage {
    message: string;
}

// Core types
export interface Paste {
    title: string;
    content: string;
    modified_on: number;
}

// Request types
export interface PasteCreateResponse extends WithMessage {
    title: string;
}

export interface PasteDeleteResponse extends WithMessage {
}

export interface PasteListResponse  extends WithMessage {
    pastebin: Paste[];
}
