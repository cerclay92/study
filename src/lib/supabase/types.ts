export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      admins: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      articles: {
        Row: {
          id: number;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          featured_image: string | null;
          category_id: number | null;
          author_id: string | null;
          published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          featured_image?: string | null;
          category_id?: number | null;
          author_id?: string | null;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          category_id?: number | null;
          author_id?: string | null;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      tags: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      article_tags: {
        Row: {
          article_id: number;
          tag_id: number;
        };
        Insert: {
          article_id: number;
          tag_id: number;
        };
        Update: {
          article_id?: number;
          tag_id?: number;
        };
      };
      comments: {
        Row: {
          id: number;
          article_id: number;
          user_id: string | null;
          author_name: string | null;
          author_email: string | null;
          content: string;
          is_approved: boolean;
          parent_id: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          article_id: number;
          user_id?: string | null;
          author_name?: string | null;
          author_email?: string | null;
          content: string;
          is_approved?: boolean;
          parent_id?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          article_id?: number;
          user_id?: string | null;
          author_name?: string | null;
          author_email?: string | null;
          content?: string;
          is_approved?: boolean;
          parent_id?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      blog_settings: {
        Row: {
          id: number;
          setting_key: string;
          setting_value: string | null;
          description: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: number;
          setting_key: string;
          setting_value?: string | null;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: number;
          setting_key?: string;
          setting_value?: string | null;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      drafts: {
        Row: {
          id: number;
          title: string | null;
          content: string | null;
          author_id: string | null;
          category_id: number | null;
          is_autosave: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title?: string | null;
          content?: string | null;
          author_id?: string | null;
          category_id?: number | null;
          is_autosave?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string | null;
          content?: string | null;
          author_id?: string | null;
          category_id?: number | null;
          is_autosave?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      uploads: {
        Row: {
          id: number;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      visit_statistics: {
        Row: {
          id: number;
          date: string;
          page_path: string;
          article_id: number | null;
          visitor_count: number;
          unique_visitors: number;
        };
        Insert: {
          id?: number;
          date: string;
          page_path: string;
          article_id?: number | null;
          visitor_count?: number;
          unique_visitors?: number;
        };
        Update: {
          id?: number;
          date?: string;
          page_path?: string;
          article_id?: number | null;
          visitor_count?: number;
          unique_visitors?: number;
        };
      };
      subscriptions: {
        Row: {
          id: number;
          user_id: string;
          plan: "monthly" | "yearly";
          status: "active" | "canceled" | "expired";
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          plan: "monthly" | "yearly";
          status: "active" | "canceled" | "expired";
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          plan?: "monthly" | "yearly";
          status?: "active" | "canceled" | "expired";
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: number;
          subscription_id: number;
          amount: number;
          payment_method: string;
          payment_id: string;
          payment_status: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          subscription_id: number;
          amount: number;
          payment_method: string;
          payment_id: string;
          payment_status: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          subscription_id?: number;
          amount?: number;
          payment_method?: string;
          payment_id?: string;
          payment_status?: string;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: number;
          article_id: number;
          client_id: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          article_id: number;
          client_id: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          article_id?: number;
          client_id?: string;
          created_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: number;
          user_id: string;
          email_type: string;
          subject: string;
          sent_at: string;
          status: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          email_type: string;
          subject: string;
          sent_at?: string;
          status: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          email_type?: string;
          subject?: string;
          sent_at?: string;
          status?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}; 