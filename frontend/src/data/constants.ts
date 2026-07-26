export type RBMenuSingleItem = {
    name: string;
    template: string;
    summary: string;
    details?: string;
};

export type Warnings = Record<string, RBMenuCategory[]>;

export type RBMenuCategory = {
    name: string;
    entries: RBMenuSingleItem[];
};

export const DEFAULT_WARNINGS: Warnings = {
    enwiki: [
        {
            name: 'Vandalism',
            entries: [
                {
                    name: 'Vandalism',
                    template: 'vandalism',
                    summary: 'non-constructive edits',
                },
                {
                    name: 'Subtle vandalism',
                    template: 'subtle',
                    summary: 'non-constructive edits',
                },
                {
                    name: 'Image vandalism',
                    template: 'image',
                    summary: 'inappropriate image additions',
                    details: 'Inappropriate images added to articles',
                },
                {
                    name: 'Joke edits',
                    template: 'joke',
                    summary: 'non-constructive edits',
                },
            ],
        },
        {
            name: 'Conduct/content',
            entries: [
                {
                    name: 'Personal attacks',
                    template: 'npa',
                    summary: 'non-constructive edits',
                },
                {
                    name: 'Unsourced',
                    template: 'unsourced',
                    summary: 'unsourced additions',
                },
                {
                    name: 'Unexplained removal',
                    template: 'delete',
                    summary: 'Unexplained content removal',
                },
                {
                    name: 'MOS',
                    template: 'mos',
                    summary: 'potentially disruptive',
                    details: 'Manual of style violations',
                },
            ],
        },
        {
            name: 'Disruption',
            entries: [
                {
                    name: 'Disruptive editing',
                    template: 'disruptive',
                    summary: 'potentially disruptive edits',
                },
                {
                    name: 'Factual errors',
                    template: 'error',
                    summary: 'factual errors',
                },
                {
                    name: 'Test edits',
                    template: 'test',
                    summary: 'Editing tests',
                },
            ],
        },
        {
            name: 'NPOV',
            entries: [
                {
                    name: 'Non-neutral',
                    template: 'npov',
                    summary: 'non-neutral-edits',
                },
                {
                    name: 'Promotional',
                    template: 'promo',
                    summary: 'Promotional contend added',
                },
            ],
        },
    ],
};
