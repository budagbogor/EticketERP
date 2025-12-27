export interface ForumCategory {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon?: string;
    created_at: string;
}

export interface ForumThread {
    id: string;
    title: string;
    content: string;
    category_id: string;
    author_id: string;
    is_pinned: boolean;
    is_resolved: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;

    // Virtual / Computed
    author?: {
        full_name?: string;
        email?: string;
        avatar_url?: string;
    };
    category?: ForumCategory;
    reply_count?: number;
}

export interface ForumPost {
    id: string;
    thread_id: string;
    content: string;
    author_id: string;
    parent_id?: string;
    is_solution: boolean;
    created_at: string;
    updated_at: string;

    // Virtual
    author?: {
        full_name?: string;
        email?: string;
        avatar_url?: string;
    };
}
