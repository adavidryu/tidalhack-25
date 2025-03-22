declare module '@auth0/nextjs-auth0' {
  export function handleAuth(): any;
  
  export interface UserProfile {
    email?: string;
    email_verified?: boolean;
    name?: string;
    nickname?: string;
    picture?: string;
    sub?: string;
    updated_at?: string;
    [key: string]: any;
  }

  export interface UserContext {
    user?: UserProfile;
    error?: Error;
    isLoading: boolean;
  }

  export function useUser(): UserContext;
  export function UserProvider(props: { children: React.ReactNode }): JSX.Element;
} 